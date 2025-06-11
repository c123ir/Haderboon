// frontend/src/App.tsx
// کامپوننت اصلی برنامه

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AIChat from './pages/AIChat';

// صفحات مربوط به پروژه
import ProjectsListPage from './pages/project/ProjectsListPage';
import NewProjectPage from './pages/project/NewProjectPage';
import ProjectDetailsPage from './pages/project/ProjectDetailsPage';
import EditProjectPage from './pages/project/EditProjectPage';

// صفحات مستندات
import ProjectDocumentsPage from './pages/document/ProjectDocumentsPage';
import NewDocumentPage from './pages/document/NewDocumentPage';
import DocumentDetailsPage from './pages/document/DocumentDetailsPage';
import EditDocumentPage from './pages/document/EditDocumentPage';
import NewVersionPage from './pages/document/NewVersionPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* مسیرهای عمومی */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            
          {/* مسیرهای محافظت شده (نیاز به احراز هویت) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* مسیر چت هوشمند */}
            <Route path="/ai-chat" element={<AIChat />} />
              
            {/* مسیرهای مربوط به پروژه */}
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/:id/edit" element={<EditProjectPage />} />
            
            {/* مسیرهای مستندات پروژه */}
            <Route path="/projects/:projectId/documents" element={<ProjectDocumentsPage />} />
            <Route path="/projects/:projectId/documents/new" element={<NewDocumentPage />} />
            
            {/* مسیرهای مستندات */}
            <Route path="/documents/:documentId" element={<DocumentDetailsPage />} />
            <Route path="/documents/:documentId/edit" element={<EditDocumentPage />} />
            <Route path="/documents/:documentId/versions/new" element={<NewVersionPage />} />
          </Route>
          
          {/* مسیر پیش‌فرض - صفحه 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
              <h1 className="text-4xl font-bold text-gray-800 font-vazirmatn">404</h1>
              <p className="mt-2 text-gray-600 font-vazirmatn">صفحه مورد نظر یافت نشد.</p>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;