// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import ColorModeProvider from './theme/ColorModeProvider.jsx';
import UiProvider from './store/ui/UiProvider.jsx';
import ScopeProvider from './store/scope/ScopeProvider.jsx';
import QueryProvider from './app/QueryProvider.jsx';
import { parseViewParam } from './lib/views/urlParam';
import I18nProvider from './store/i18n/I18nProvider.jsx';
import ComplianceStaticProvider from "./store/complianceStaticStore.jsx";
import { AuthProvider } from "./auth/authContext.jsx";
import { installAuthFetch } from "./api/httpAuthPatch.js";

// Ensure generated API client base URL is configured
import './api/client/config';
installAuthFetch();

if (typeof window !== 'undefined') {
  window.__parseViewParam = parseViewParam;
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorModeProvider>
      <I18nProvider>
        <UiProvider>
          <AuthProvider>
            <ComplianceStaticProvider>
              <ScopeProvider>
                <QueryProvider>
                  <App />
                </QueryProvider>
              </ScopeProvider>
            </ComplianceStaticProvider>
          </AuthProvider>
        </UiProvider>
      </I18nProvider>
    </ColorModeProvider>
  </React.StrictMode>
);
