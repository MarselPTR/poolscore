import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import { MatchProvider } from './context/MatchContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <MatchProvider>
          <App />
        </MatchProvider>
      </AuthProvider>
    </SettingsProvider>
  </React.StrictMode>
);
