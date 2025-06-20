
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
 import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* BrouserRouter wraps the entire app */}
      <AuthProvider> { /* AuthProvider makes auth context available */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
