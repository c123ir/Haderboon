// Frontend: frontend/src/contexts/index.tsx
// تمام Context های برنامه

import React, { createContext } from 'react';

// Theme Context
export const ThemeContext = createContext({
  darkMode: true,
  toggleDarkMode: () => {}
});

// Auth Context
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false
});

// Navigation Context for managing current page
export const NavigationContext = createContext({
  currentPage: 'dashboard',
  setCurrentPage: () => {}
});

// Project Context
export const ProjectContext = createContext({
  projects: [],
  currentProject: null,
  setCurrentProject: () => {},
  createProject: () => {},
  updateProject: () => {},
  deleteProject: () => {}
});

// Document Context
export const DocumentContext = createContext({
  documents: [],
  currentDocument: null,
  setCurrentDocument: () => {},
  createDocument: () => {},
  updateDocument: () => {},
  deleteDocument: () => {}
});

// Chat Context
export const ChatContext = createContext({
  conversations: [],
  currentConversation: null,
  messages: [],
  setCurrentConversation: () => {},
  sendMessage: () => {},
  createConversation: () => {}
});

// Global App Context Provider
export const AppProvider = ({ children }) => {
  // All context providers would be wrapped here
  return (
    <>
      {children}
    </>
  );
};