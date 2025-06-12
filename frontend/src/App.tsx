// مسیر فایل: /Users/imac2019/My-Apps/Haderboon/frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// کامپوننت‌های صفحات
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// کامپوننت‌های پروژه
import NewProjectPage from './pages/project/NewProjectPage';
import ProjectDetailsPage from './pages/project/ProjectDetailsPage';
import EditProjectPage from './pages/project/EditProjectPage';

// کامپوننت‌های مستندات
import NewDocumentPage from './pages/document/NewDocumentPage';
import DocumentDetailsPage from './pages/document/DocumentDetailsPage';
import EditDocumentPage from './pages/document/EditDocumentPage';
import ProjectDocumentsPage from './pages/document/ProjectDocumentsPage';
import NewVersionPage from './pages/document/NewVersionPage';

// صفحه چت
import ChatPage from './pages/ChatPage';

// کامپوننت‌های احراز هویت
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* صفحات عمومی */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* صفحات محافظت شده */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* مسیرهای پروژه */}
              <Route path="/projects/new" element={<NewProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/projects/:id/edit" element={<EditProjectPage />} />
              
              {/* مسیرهای مستندات */}
              <Route path="/documents/new" element={<NewDocumentPage />} />
              <Route path="/documents/:id" element={<DocumentDetailsPage />} />
              <Route path="/documents/:id/edit" element={<EditDocumentPage />} />
              <Route path="/documents/:id/new-version" element={<NewVersionPage />} />
              <Route path="/projects/:projectId/documents" element={<ProjectDocumentsPage />} />
              
              {/* صفحه چت */}
              <Route path="/chat" element={<ChatPage />} />
            </Route>
            
            {/* صفحه ۴۰۴ و مسیرهای ناشناخته */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;