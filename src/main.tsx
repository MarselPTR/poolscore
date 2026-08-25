import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import { MatchProvider } from './context/MatchContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <MatchProvider>
        <App />
      </MatchProvider>
    </SettingsProvider>
  </React.StrictMode>
);
