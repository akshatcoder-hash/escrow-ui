import 'crypto-browserify';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { Buffer } from 'buffer'
window.Buffer = Buffer
window.global = window as any;
if (typeof global === 'undefined') {
  (window as any).global = window;
}
(window as any).process = {
  env: { NODE_ENV: process.env.NODE_ENV },
};

console.log('main.tsx is running');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)