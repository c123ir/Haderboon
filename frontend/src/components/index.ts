# دستورالعمل تصحیح فایل‌ها

# 1. پاک کردن فایل خراب components/index.ts
rm -f src/components/index.ts

# 2. ایجاد فایل components/index.ts صحیح
cat > src/components/index.ts << 'EOF'
export { default as FileTree } from './FileTree';
export { default as FileContentViewer } from './FileContentViewer';
export { default as WatchingStatus } from './WatchingStatus';
export { default as ProjectFileManager } from './ProjectFileManager';
EOF

# 3. ایجاد پوشه hooks اگر وجود ندارد
mkdir -p src/hooks

# 4. ایجاد فایل hooks/useProject.ts
# (کد از artifact قبلی کپی کنید)

# 5. ایجاد فایل hooks/useProjectFiles.ts
# (کد از artifact قبلی کپی کنید)

# 6. ایجاد فایل hooks/index.ts
cat > src/hooks/index.ts << 'EOF'
export { default as useProject } from './useProject';
export { default as useProjectFiles } from './useProjectFiles';
EOF

# 7. تصحیح import در فایل HomePage.tsx
# تغییر خط 14 از:
# import apiService, { authHelpers } from '../services/api';
# به:
# import { apiService, authHelpers } from '../services/api';

# 8. تصحیح import در فایل NewProjectPage.tsx
# تغییر خط 16 از:
# import apiService, { authHelpers } from '../services/api';
# به:
# import { apiService, authHelpers } from '../services/api';

# 9. تصحیح import در فایل ProjectsPage.tsx
# تغییر خط 16 از:
# import apiService from '../services/api';
# به:
# import { apiService } from '../services/api';

# 10. اضافه کردن attributes به input در ProjectFileManager.tsx
# در قسمت input پوشه، این attributes را اضافه کنید:
# webkitdirectory=""
# directory=""

echo "تمام فایل‌ها تصحیح شدند!"