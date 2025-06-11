// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// صفحات عمومی
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// صفحات داشبورد
import Dashboard from './pages/Dashboard';

// صفحات پروژه
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* مسیرهای عمومی */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* مسیرهای محافظت شده */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* مسیرهای پروژه */}
              <Route path="projects">
                <Route index element={<ProjectsListPage />} />
                <Route path="new" element={<NewProjectPage />} />
                <Route path=":projectId" element={<ProjectDetailsPage />} />
                <Route path=":projectId/edit" element={<EditProjectPage />} />
                
                {/* مسیرهای مستندات پروژه */}
                <Route path=":projectId/documents">
                  <Route index element={<ProjectDocumentsPage />} />
                  <Route path="new" element={<NewDocumentPage />} />
                </Route>
              </Route>
              
              {/* مسیرهای مستندات */}
              <Route path="documents">
                <Route path=":documentId" element={<DocumentDetailsPage />} />
                <Route path=":documentId/edit" element={<EditDocumentPage />} />
                <Route path=":documentId/versions/new" element={<NewVersionPage />} />
              </Route>
            </Route>
            
            {/* صفحه 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;