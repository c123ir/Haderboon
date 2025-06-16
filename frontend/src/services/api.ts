// services/api.ts - بررسی متدهای مورد نیاز
// اطمینان حاصل کنید که این متدها در فایل api.ts شما موجود هستند:

// 1. متد دریافت پروژه
const getProject = async (projectId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در دریافت پروژه'
    };
  }
};

// 2. متد دریافت فایل‌های پروژه
const getProjectFiles = async (projectId: string) => {
  try {
    const response = await api.get(`/files/projects/${projectId}/files`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در دریافت فایل‌ها'
    };
  }
};

// 3. متد دریافت محتوای فایل
const getFileContent = async (projectId: string, fileId: string) => {
  try {
    const response = await api.get(`/files/projects/${projectId}/files/${fileId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در دریافت محتوای فایل'
    };
  }
};

// 4. متد تحلیل مجدد پروژه
const reAnalyzeProject = async (projectId: string) => {
  try {
    const response = await api.post(`/files/projects/${projectId}/reanalyze`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در تحلیل مجدد پروژه'
    };
  }
};

// اطمینان حاصل کنید که export شده‌اند:
export const apiService = {
  // ... سایر متدها
  getProject,
  getProjectFiles,
  getFileContent,
  reAnalyzeProject,
  // ... سایر متدها
};