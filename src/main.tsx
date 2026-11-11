import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import { MatchProvider } from './context/MatchContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Fonts are bundled with the app so the scoreboard renders the same offline.
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
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
