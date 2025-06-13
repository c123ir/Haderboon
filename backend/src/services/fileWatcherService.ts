import * as chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { prisma } from '../server';
import { getFileType, shouldIgnoreFile } from '../utils';
import { analyzeFile } from './fileAnalysisService';

interface ProjectWatcher {
  projectId: string;
  watcher: chokidar.FSWatcher;
  basePath: string;
}

class FileWatcherService {
  private watchers: Map<string, ProjectWatcher> = new Map();

  /**
   * شروع نظارت بر یک پروژه
   */
  async startWatching(projectId: string, directoryPath: string): Promise<void> {
    try {
      // بررسی اینکه آیا قبلاً نظارت شروع شده یا نه
      if (this.watchers.has(projectId)) {
        console.log(`⚠️ نظارت برای پروژه ${projectId} قبلاً شروع شده است`);
        return;
      }

      console.log(`👁️ شروع نظارت بر پروژه ${projectId} در مسیر: ${directoryPath}`);

      // ایجاد watcher با تنظیمات مناسب
      const watcher = chokidar.watch(directoryPath, {
        ignored: (filePath: string) => {
          const relativePath = path.relative(directoryPath, filePath);
          const fileName = path.basename(filePath);
          
          // نادیده گرفتن فایل‌ها و پوشه‌های غیرضروری
          return (
            shouldIgnoreFile(relativePath) ||
            this.shouldIgnoreDirectory(fileName) ||
            filePath.includes('node_modules') ||
            filePath.includes('.git')
          );
        },
        persistent: true,
        ignoreInitial: true, // فایل‌های موجود را نادیده بگیر
        followSymlinks: false,
        depth: undefined, // نامحدود
        awaitWriteFinish: {
          stabilityThreshold: 2000, // 2 ثانیه انتظار
          pollInterval: 100
        }
      });

      // ثبت event handlers
      watcher
        .on('add', (filePath) => this.handleFileAdded(projectId, directoryPath, filePath))
        .on('change', (filePath) => this.handleFileChanged(projectId, directoryPath, filePath))
        .on('unlink', (filePath) => this.handleFileDeleted(projectId, directoryPath, filePath))
        .on('addDir', (dirPath) => console.log(`📁 پوشه جدید: ${path.relative(directoryPath, dirPath)}`))
        .on('unlinkDir', (dirPath) => console.log(`🗑️ پوشه حذف شد: ${path.relative(directoryPath, dirPath)}`))
        .on('error', (error) => console.error(`❌ خطا در نظارت فایل:`, error));

      // ذخیره watcher
      this.watchers.set(projectId, {
        projectId,
        watcher,
        basePath: directoryPath
      });

      console.log(`✅ نظارت برای پروژه ${projectId} شروع شد`);

    } catch (error) {
      console.error(`❌ خطا در شروع نظارت برای پروژه ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * توقف نظارت بر یک پروژه
   */
  async stopWatching(projectId: string): Promise<void> {
    const projectWatcher = this.watchers.get(projectId);
    
    if (projectWatcher) {
      await projectWatcher.watcher.close();
      this.watchers.delete(projectId);
      console.log(`🛑 نظارت برای پروژه ${projectId} متوقف شد`);
    } else {
      console.log(`⚠️ هیچ نظارتی برای پروژه ${projectId} یافت نشد`);
    }
  }

  /**
   * توقف تمام نظارت‌ها
   */
  async stopAllWatching(): Promise<void> {
    const promises = Array.from(this.watchers.keys()).map(projectId => 
      this.stopWatching(projectId)
    );
    
    await Promise.all(promises);
    console.log('🛑 تمام نظارت‌ها متوقف شدند');
  }

  /**
   * مدیریت اضافه شدن فایل جدید
   */
  private async handleFileAdded(projectId: string, basePath: string, filePath: string): Promise<void> {
    try {
      const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
      console.log(`➕ فایل جدید اضافه شد: ${relativePath}`);

      // بررسی وجود فایل در دیتابیس
      const existingFile = await prisma.projectFile.findFirst({
        where: {
          projectId,
          path: relativePath
        }
      });

      if (existingFile) {
        console.log(`⚠️ فایل ${relativePath} قبلاً در دیتابیس موجود است`);
        return;
      }

      // خواندن اطلاعات فایل
      const stats = fs.statSync(filePath);
      const fileType = getFileType(relativePath);
      const extension = path.extname(relativePath);

      // تحلیل فایل
      let analysis = null;
      try {
        analysis = await analyzeFile(filePath);
      } catch (error) {
        console.warn(`خطا در تحلیل فایل ${relativePath}:`, error);
      }

      // خواندن محتوا برای فایل‌های متنی کوچک
      let content = null;
      if (stats.size < 500 * 1024 && 
          ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.html', '.css', '.scss', '.json', '.md', '.txt'].includes(extension)) {
        try {
          content = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
          console.warn(`خطا در خواندن محتوای فایل ${relativePath}:`, error);
        }
      }

      // ایجاد رکورد در دیتابیس
      await prisma.projectFile.create({
        data: {
          projectId,
          path: relativePath,
          originalPath: filePath,
          name: path.basename(relativePath),
          extension,
          type: fileType as any,
          size: BigInt(stats.size),
          content,
          analysis: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
          isDirectory: false
        }
      });

      // به‌روزرسانی شمارنده فایل‌های پروژه
      await this.updateProjectFileCount(projectId);

      console.log(`✅ فایل ${relativePath} به پروژه اضافه شد`);

    } catch (error) {
      console.error(`❌ خطا در اضافه کردن فایل ${filePath}:`, error);
    }
  }

  /**
   * مدیریت تغییر فایل
   */
  private async handleFileChanged(projectId: string, basePath: string, filePath: string): Promise<void> {
    try {
      const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
      console.log(`🔄 فایل تغییر کرد: ${relativePath}`);

      // یافتن فایل در دیتابیس
      const existingFile = await prisma.projectFile.findFirst({
        where: {
          projectId,
          path: relativePath
        }
      });

      if (!existingFile) {
        console.log(`⚠️ فایل ${relativePath} در دیتابیس یافت نشد، اضافه می‌شود...`);
        await this.handleFileAdded(projectId, basePath, filePath);
        return;
      }

      // خواندن اطلاعات جدید فایل
      const stats = fs.statSync(filePath);
      const extension = path.extname(relativePath);

      // تحلیل مجدد فایل
      let analysis = null;
      try {
        analysis = await analyzeFile(filePath);
      } catch (error) {
        console.warn(`خطا در تحلیل مجدد فایل ${relativePath}:`, error);
      }

      // خواندن محتوای جدید
      let content = null;
      if (stats.size < 500 * 1024 && 
          ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.html', '.css', '.scss', '.json', '.md', '.txt'].includes(extension)) {
        try {
          content = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
          console.warn(`خطا در خواندن محتوای جدید فایل ${relativePath}:`, error);
        }
      }

      // به‌روزرسانی فایل در دیتابیس
      await prisma.projectFile.update({
        where: { id: existingFile.id },
        data: {
          size: BigInt(stats.size),
          content,
          analysis: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
          updatedAt: new Date()
        }
      });

      console.log(`✅ فایل ${relativePath} به‌روزرسانی شد`);

    } catch (error) {
      console.error(`❌ خطا در به‌روزرسانی فایل ${filePath}:`, error);
    }
  }

  /**
   * مدیریت حذف فایل
   */
  private async handleFileDeleted(projectId: string, basePath: string, filePath: string): Promise<void> {
    try {
      const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
      console.log(`🗑️ فایل حذف شد: ${relativePath}`);

      // حذف از دیتابیس
      const deletedFile = await prisma.projectFile.deleteMany({
        where: {
          projectId,
          path: relativePath
        }
      });

      if (deletedFile.count > 0) {
        // به‌روزرسانی شمارنده فایل‌های پروژه
        await this.updateProjectFileCount(projectId);
        console.log(`✅ فایل ${relativePath} از پروژه حذف شد`);
      } else {
        console.log(`⚠️ فایل ${relativePath} در دیتابیس یافت نشد`);
      }

    } catch (error) {
      console.error(`❌ خطا در حذف فایل ${filePath}:`, error);
    }
  }

  /**
   * به‌روزرسانی تعداد فایل‌های پروژه
   */
  private async updateProjectFileCount(projectId: string): Promise<void> {
    try {
      const fileCount = await prisma.projectFile.count({
        where: { projectId }
      });

      const totalSize = await prisma.projectFile.aggregate({
        where: { projectId },
        _sum: { size: true }
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          filesCount: fileCount,
          totalSize: totalSize._sum.size || BigInt(0),
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error(`❌ خطا در به‌روزرسانی آمار پروژه ${projectId}:`, error);
    }
  }

  /**
   * بررسی نادیده گرفتن پوشه
   */
  private shouldIgnoreDirectory(dirName: string): boolean {
    const ignoredDirs = [
      'node_modules',
      '.git',
      '.svn',
      '.hg',
      'dist',
      'build',
      'out',
      '.next',
      '.nuxt',
      'coverage',
      '.nyc_output',
      '.cache',
      '.parcel-cache',
      '.vscode',
      '.idea',
      'logs',
      'tmp',
      'temp',
      '__pycache__',
      '.pytest_cache',
      'vendor',
      '.vendor',
      'bower_components',
      '.sass-cache'
    ];
    
    return ignoredDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * دریافت وضعیت نظارت‌ها
   */
  getWatchingStatus(): { projectId: string; basePath: string; isWatching: boolean }[] {
    return Array.from(this.watchers.values()).map(watcher => ({
      projectId: watcher.projectId,
      basePath: watcher.basePath,
      isWatching: true
    }));
  }
}

// تک‌ نمونه سرویس
export const fileWatcherService = new FileWatcherService();

// تمیز کردن در هنگام خروج
process.on('SIGINT', async () => {
  console.log('\n🛑 در حال توقف نظارت فایل‌ها...');
  await fileWatcherService.stopAllWatching();
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 در حال توقف نظارت فایل‌ها...');
  await fileWatcherService.stopAllWatching();
}); 