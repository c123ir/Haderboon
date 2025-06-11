// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

// صفحات مربوط به پروژه
import ProjectsListPage from './pages/project/ProjectsListPage';
import NewProjectPage from './pages/project/NewProjectPage';
import ProjectDetailsPage from './pages/project/ProjectDetailsPage';
import EditProjectPage from './pages/project/EditProjectPage';

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
            
            {/* مسیرهای مربوط به پروژه */}
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/:id/edit" element={<EditProjectPage />} />
            
            {/* مسیرهای محافظت شده دیگر در اینجا اضافه می‌شوند */}
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