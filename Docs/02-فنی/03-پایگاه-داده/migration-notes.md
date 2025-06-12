# یادداشت‌های Migration پایگاه داده

## تغییرات Schema برای نسخه‌بندی مستندات

### تغییرات اعمال شده:

1. **بهبود مدل Document:**
   - اضافه کردن فیلد `parentId` برای ساختار درختی
   - اضافه کردن روابط جدید: `parent`, `children`, `versions`, `tags`

2. **مدل جدید DocumentVersion:**
   - مدیریت نسخه‌های مختلف هر مستند
   - فیلدهای: `versionNumber`, `title`, `content`, `changelog`, `isPublished`
   - رابطه با `Document` و `User`

3. **مدل جدید Tag:**
   - سیستم تگ‌گذاری برای مستندات
   - فیلدهای: `name`, `color`, `userId`

4. **مدل جدید DocumentTag:**
   - جدول رابطه many-to-many بین Document و Tag

### دستورات Migration:

```bash
# تولید migration جدید
npx prisma migrate dev --name add-document-versioning-and-tags

# اعمال migration
npx prisma migrate deploy

# تولید Prisma client جدید
npx prisma generate
```

### نکات مهم:

1. **Backup:** قبل از اعمال migration، حتماً از پایگاه داده backup بگیرید
2. **Test Environment:** ابتدا در محیط تست آزمایش کنید
3. **Data Migration:** اگر داده‌های موجود دارید، ممکن است نیاز به data migration باشد

### تست Migration:

پس از اعمال migration، موارد زیر را تست کنید:
- ایجاد مستند جدید
- ایجاد نسخه جدید از مستند
- ایجاد و اختصاص تگ‌ها
- ساختار درختی مستندات 