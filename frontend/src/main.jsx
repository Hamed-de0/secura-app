// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import ColorModeProvider from './theme/ColorModeProvider.jsx';
import UiProvider from './store/ui/UiProvider.jsx';
import ScopeProvider from './store/scope/ScopeProvider.jsx';
import QueryProvider from './app/QueryProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorModeProvider>
      <UiProvider>
        <ScopeProvider>
          <QueryProvider>
            <App />
          </QueryProvider>
        </ScopeProvider>
      </UiProvider>
    </ColorModeProvider>
  </React.StrictMode>
);
