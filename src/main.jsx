import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

import './styles/index.css';
import './styles/sidebar.css';
import './styles/chat.css';
import './styles/entry.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
