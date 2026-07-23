import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ── Data Version Guard ──────────────────────────────────────────────────────
// Bump this string any time sampleData changes. On mismatch the old
// Zustand-persisted state is cleared so the store rehydrates from fresh data.
const DATA_VERSION = '2026-07-23-v6';
const storedDataVersion = localStorage.getItem('crm-data-version');
if (storedDataVersion !== DATA_VERSION) {
  localStorage.removeItem('deepika-crm-storage');
  localStorage.setItem('crm-data-version', DATA_VERSION);
}
// ───────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
