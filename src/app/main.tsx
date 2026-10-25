/**
 * Punto de entrada de la app (lo carga index.html).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/kaushan-script';
import '@fontsource/oswald/500.css';
import '@fontsource/roboto-slab/400.css';
import '@fontsource/roboto-slab/700.css';
import '@fontsource/crimson-pro/400.css';
import '@fontsource/crimson-pro/400-italic.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/caveat/400.css';
import '@fontsource/anton';
import '../book/book.css';
import './app.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
