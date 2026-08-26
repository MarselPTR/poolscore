import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import { MatchProvider } from './context/MatchContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <AuthProvider>
          <MatchProvider>
            <App />
          </MatchProvider>
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  </React.StrictMode>
);
