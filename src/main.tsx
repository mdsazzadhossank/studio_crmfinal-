import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { API_BASE_URL } from './config';

// Auth keys that must NEVER be globally synced — they are browser-specific
const AUTH_LOCAL_KEYS = ['studio_auth_current_user', 'studio_auth_users'];

async function initApp() {
  try {
    // 1. Preserve browser-local auth state BEFORE clearing
    const savedAuth: Record<string, string | null> = {};
    for (const key of AUTH_LOCAL_KEYS) {
      savedAuth[key] = localStorage.getItem(key);
    }

    // 2. Fetch entire database state (SQL tables + Store values)
    const response = await fetch(`${API_BASE_URL}/sync`);
    if (response.ok) {
      const data = await response.json();
      
      // 3. Clear localStorage and replace with fresh DB data
      localStorage.clear();
      for (const [key, value] of Object.entries(data)) {
        // SKIP auth keys from server — they must stay browser-local
        if (AUTH_LOCAL_KEYS.includes(key)) continue;
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    }

    // 4. Restore browser-local auth state AFTER sync
    for (const key of AUTH_LOCAL_KEYS) {
      if (savedAuth[key] !== null) {
        localStorage.setItem(key, savedAuth[key]!);
      }
    }
  } catch (err) {
    console.error('Failed to sync with backend DB. App will run in offline/local mode.', err);
  }

  // 5. Monkey patch localStorage to automatically pipe saves to our SQL backend
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.apply(this, arguments as any); // Update local cache synchronously
    
    // NEVER sync auth keys to backend — they are browser-specific
    if (AUTH_LOCAL_KEYS.includes(key)) return;
    
    // Fire-and-forget sync to backend
    fetch(`${API_BASE_URL}/store/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: value
    }).catch(console.error);
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    originalRemoveItem.apply(this, arguments as any);
    
    fetch(`${API_BASE_URL}/store/${key}`, { 
      method: 'DELETE' 
    }).catch(console.error);
  };

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

initApp();

