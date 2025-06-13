// Frontend: frontend/src/App.tsx (Complete)
// کامپوننت اصلی کامل برنامه ایجنت هادربون

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

// Navigation Context
const NavigationContext = createContext({
  currentPage: 'dashboard',
  setCurrentPage: () => {}
});

// Navbar Component
const Navbar = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { currentPage, setCurrentPage } = useContext(NavigationContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 w-full z-50 ${darkMode ? 'bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-20' : 'bg-white bg-opacity-90 backdrop-blur-lg border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center space-x-4 space-x-reverse"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🧠</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ایجنت هادربون
              </h1>
              <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                مستندساز هوشمند
              </p>
            </div>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <NavLink page="dashboard" icon="🏠">داشبورد</NavLink>
            <NavLink page="projects" icon="📁">پروژه‌ها</NavLink>
            <NavLink page="documents" icon="📝">مستندات</NavLink>
            <NavLink page="chat" icon="💬">چت هوشمند</NavLink>
            <NavLink page="settings" icon="⚙️">تنظیمات</NavLink>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <button className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold hover:scale-110 transition-transform">
                {user?.avatar || 'ک'}
              </button>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden md:block">
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'کاربر'}
              </p>
              <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                آنلاین
              </p>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <span className={`block w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>☰</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white border-opacity-20">
            <div className="flex flex-col space-y-2 pt-4">
              <MobileNavLink page="dashboard" icon="🏠">داشبورد</MobileNavLink>
              <MobileNavLink page="projects" icon="📁">پروژه‌ها</MobileNavLink>
              <MobileNavLink page="documents" icon="📝">مستندات</MobileNavLink>
              <MobileNavLink page="chat" icon="💬">چت هوشمند</MobileNavLink>
              <MobileNavLink page="settings" icon="⚙️">تنظیمات</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Navigation Link Component
const NavLink = ({ page, children, icon }) => {
  const { darkMode } = useContext(ThemeContext);
  const { currentPage, setCurrentPage } = useContext(NavigationContext);
  const isActive = currentPage === page;
  
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? darkMode 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'bg-purple-100 text-purple-700'
          : darkMode 
            ? 'text-white hover:bg-white hover:bg-opacity-10' 
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </button>
  );
};

// Mobile Navigation Link Component
const MobileNavLink = ({ page, children, icon }) => {
  const { darkMode } = useContext(ThemeContext);
  const { currentPage, setCurrentPage } = useContext(NavigationContext);
  const isActive = currentPage === page;
  
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? darkMode 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'bg-purple-100 text-purple-700'
          : darkMode 
            ? 'text-white hover:bg-white hover:bg-opacity-10' 
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{children}</span>
    </button>
  );
};

// Action Button Component
const ActionButton = ({ children, primary = false, onClick, disabled = false, className = '' }) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
        primary
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
          : darkMode
            ? 'bg-white bg-opacity-15 backdrop-blur-lg text-white border border-white border-opacity-20'
            : 'bg-white bg-opacity-70 text-gray-900 border border-gray-200'
      } ${className}`}
    >
      {children}
    </button>
  );
};

// Stats Card Component
const StatsCard = ({ icon, value, label, change, color }) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className={`p-6 rounded-3xl backdrop-blur-lg border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      darkMode 
        ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
        : 'bg-white bg-opacity-70 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <span className="text-green-500 text-sm font-bold">{change}</span>
      </div>
      <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </h3>
      <p className={darkMode ? 'text-purple-200' : 'text-gray-600'}>
        {label}
      </p>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const [stats, setStats] = useState({
    projects: 15,
    documents: 243,
    chatSessions: 120,
    savedHours: 48
  });

  return (
    <div className="px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            سلام به 
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> ایجنت هادربون</span>
          </h1>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
            دستیار هوشمند شما برای مستندسازی پروژه‌ها، تحلیل کد و تولید محتوای تخصصی
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
            <ActionButton primary>
              🚀 شروع پروژه جدید
            </ActionButton>
            <ActionButton>
              ▶️ مشاهده دمو
            </ActionButton>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatsCard
            icon="📊"
            value={stats.projects}
            label="پروژه فعال"
            change="+12%"
            color="from-purple-500 to-indigo-500"
          />
          <StatsCard
            icon="📄"
            value={stats.documents}
            label="مستند ایجاد شده"
            change="+8%"
            color="from-pink-500 to-rose-500"
          />
          <StatsCard
            icon="💬"
            value={stats.chatSessions}
            label="جلسه چت"
            change="+25%"
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            icon="⏰"
            value={stats.savedHours}
            label="ساعت صرفه‌جویی"
            change="+15%"
            color="from-orange-500 to-red-500"
          />
        </div>
      </div>
    </div>
  );
};

// Projects Component
const Projects = () => {
  const { darkMode } = useContext(ThemeContext);
  const [projects] = useState([
    {
      id: 1,
      name: 'فروشگاه آنلاین',
      description: 'پلتفرم فروشگاه آنلاین با React و Node.js',
      status: 'active',
      progress: 85,
      documents: 12,
      icon: '🛒',
      color: 'from-green-400 to-blue-400'
    },
    {
      id: 2,
      name: 'اپلیکیشن موبایل',
      description: 'اپلیکیشن کراس پلتفرم با React Native',
      status: 'development',
      progress: 60,
      documents: 8,
      icon: '📱',
      color: 'from-purple-400 to-pink-400'
    }
  ]);

  return (
    <div className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              پروژه‌های شما
            </h2>
            <p className={`text-xl ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
              مدیریت و نظارت بر پروژه‌های فعال
            </p>
          </div>
          <ActionButton primary>
            ➕ پروژه جدید
          </ActionButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-6 rounded-3xl backdrop-blur-lg border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                darkMode 
                  ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
                  : 'bg-white bg-opacity-70 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${project.color} rounded-xl flex items-center justify-center text-xl`}>
                  {project.icon}
                </div>
                <span className="text-green-400 text-sm bg-green-400 bg-opacity-20 px-2 py-1 rounded-full">
                  فعال
                </span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {project.name}
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                {project.description}
              </p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                    پیشرفت
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {project.progress}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-white bg-opacity-20' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                  <span>{project.documents} مستند</span>
                </div>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg text-white text-sm font-medium hover:scale-105 transition-transform">
                  مشاهده
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Documents Component
const Documents = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            مستندات
          </h2>
          <p className={`text-xl ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
            مدیریت مستندات پروژه‌ها
          </p>
          <div className="mt-8">
            <ActionButton primary>
              ➕ مستند جدید
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Component
const Chat = () => {
  const { darkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'سلام! من ایجنت هوشمند هادربون هستم. چطور می‌تونم کمکتون کنم؟',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        content: `متشکرم از پیام شما: "${userMessage.content}". این یک پاسخ نمونه است.`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            چت هوشمند
          </h2>
          <p className={`text-xl ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
            با ایجنت خود گفتگو کنید
          </p>
        </div>
        
        <div className={`rounded-3xl overflow-hidden backdrop-blur-lg border ${
          darkMode 
            ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
            : 'bg-white bg-opacity-70 border-gray-200'
        }`}>
          <div className="p-6 h-96 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tl-sm'
                      : darkMode
                        ? 'bg-white bg-opacity-15 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-900 rounded-tr-sm'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`p-6 border-t ${darkMode ? 'border-white border-opacity-20' : 'border-gray-200'}`}>
            <div className="flex space-x-4 space-x-reverse">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="پیام خود را بنویسید..."
                className={`flex-1 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  darkMode 
                    ? 'bg-white bg-opacity-15 text-white placeholder-purple-200' 
                    : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'
                }`}
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl hover:scale-105 transition-transform"
              >
                <span className="text-white">📤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const Settings = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            تنظیمات
          </h2>
          <p className={`text-xl ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
            شخصی‌سازی ایجنت مطابق نیازهای شما
          </p>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ورود به سیستم
        </h2>
        <p className={darkMode ? 'text-purple-200' : 'text-gray-600'}>
          لطفاً وارد حساب کاربری خود شوید
        </p>
      </div>
    </div>
  );
};

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