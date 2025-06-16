import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import NewProjectPage from './pages/NewProjectPage';
import ChatPage from './pages/ChatPage';
import PromptGeneratorPage from './pages/PromptGeneratorPage';
import { apiService } from './services/api';
import './styles/globals.css';

function App() {
  useEffect(() => {
    // انجام demo login در صورت عدم وجود authentication
    const initializeAuth = async () => {
      if (!apiService.auth.isAuthenticated()) {
        console.log('🔑 شروع demo login...');
        try {
          const result = await apiService.demoLogin();
          if (result.success) {
            console.log('✅ Demo login موفق');
          } else {
            console.error('❌ خطا در demo login:', result.message);
          }
        } catch (error) {
          console.error('❌ خطا در demo login:', error);
        }
      }
    };

    initializeAuth();
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/chat" element={<ChatPage />} />
            <Route path="/projects/:id/prompt" element={<PromptGeneratorPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;