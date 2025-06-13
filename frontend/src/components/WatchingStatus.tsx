import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface WatchingStatusProps {
  projectId: string;
  projectName: string;
  projectPath?: string;
  initialStatus?: 'WATCHING' | 'READY' | 'ANALYZING' | 'UPLOADING' | 'ERROR' | 'ARCHIVED';
}

const WatchingStatus: React.FC<WatchingStatusProps> = ({ 
  projectId, 
  projectName, 
  projectPath,
  initialStatus = 'READY'
}) => {
  const [isWatching, setIsWatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchingPath, setWatchingPath] = useState<string | null>(null);

  useEffect(() => {
    // Check if project is currently being watched
    setIsWatching(initialStatus === 'WATCHING');
    if (projectPath) {
      setWatchingPath(projectPath);
    }
  }, [initialStatus, projectPath]);

  const handleStartWatching = async () => {
    if (!watchingPath) {
      alert('مسیر پروژه مشخص نیست. فقط پروژه‌هایی که از پوشه محلی آپلود شده‌اند قابل نظارت هستند.');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.startProjectWatching(projectId);
      setIsWatching(true);
      console.log('✅ نظارت شروع شد');
    } catch (error: any) {
      console.error('خطا در شروع نظارت:', error);
      alert(error.response?.data?.message || 'خطا در شروع نظارت');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopWatching = async () => {
    setIsLoading(true);
    try {
      await apiService.stopProjectWatching(projectId);
      setIsWatching(false);
      console.log('🛑 نظارت متوقف شد');
    } catch (error: any) {
      console.error('خطا در توقف نظارت:', error);
      alert(error.response?.data?.message || 'خطا در توقف نظارت');
    } finally {
      setIsLoading(false);
    }
  };

  if (!watchingPath) {
    return (
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <EyeSlashIcon className="w-5 h-5 text-gray-400 ml-3" />
            <div>
              <h3 className="text-white font-medium">نظارت بر تغییرات</h3>
              <p className="text-white/60 text-sm">غیرفعال - فقط برای پروژه‌های محلی</p>
            </div>
          </div>
          <div className="text-white/40 text-sm">
            نظارت فقط برای پروژه‌هایی که از پوشه محلی آپلود شده‌اند فعال است
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isWatching ? (
            <EyeIcon className="w-5 h-5 text-green-400 ml-3" />
          ) : (
            <EyeSlashIcon className="w-5 h-5 text-gray-400 ml-3" />
          )}
          <div>
            <h3 className="text-white font-medium">نظارت بر تغییرات فایل</h3>
            <p className="text-white/60 text-sm">
              {isWatching ? 'فعال - تغییرات به صورت خودکار تشخیص می‌شوند' : 'غیرفعال'}
            </p>
            {watchingPath && (
              <p className="text-white/40 text-xs mt-1">
                مسیر: {watchingPath}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-reverse space-x-3">
          {isWatching ? (
            <button
              onClick={handleStopWatching}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></div>
              ) : (
                <EyeSlashIcon className="w-4 h-4 ml-2" />
              )}
              توقف نظارت
            </button>
          ) : (
            <button
              onClick={handleStartWatching}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></div>
              ) : (
                <EyeIcon className="w-4 h-4 ml-2" />
              )}
              شروع نظارت
            </button>
          )}
        </div>
      </div>
      
      {isWatching && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
            <span className="text-green-400 text-sm font-medium">
              نظارت فعال - تغییرات فایل‌ها به صورت زنده تشخیص می‌شوند
            </span>
          </div>
          <p className="text-green-300/70 text-xs mt-1">
            هر تغییری که در پوشه پروژه اعمال کنید، به صورت خودکار در هادربون منعکس می‌شود
          </p>
        </div>
      )}
    </div>
  );
};

export default WatchingStatus; 