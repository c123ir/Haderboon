// Frontend: frontend/src/App.tsx
// کامپوننت اصلی برنامه ایجنت هادربون

import React, { useState, useEffect, createContext, useContext } from 'react';

// Theme Context
const ThemeContext = createContext({
  darkMode: true,
  toggleDarkMode: () => {}
});

// Auth Context
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false
});

// Navigation Context for managing current page
const NavigationContext = createContext({
  currentPage: 'dashboard',
  setCurrentPage: () => {}
});

// Main App Component
const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState({
    name: 'کاربر نمونه',
    email: 'user@example.com',
    avatar: 'ک'
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'documents':
        return <Documents />;
      case 'chat':
        return <Chat />;
      case 'settings':
        return <Settings />;
      case 'login':
        return <Login />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
        <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
          <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-blue-50 to-purple-100'}`}>
            <Navbar />
            <main className="pt-20">
              {renderCurrentPage()}
            </main>
          </div>
        </NavigationContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;