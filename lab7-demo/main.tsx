import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BookGalleryDemo } from '../src/lab7';
import '../src/lab7.css';

function App() {
  return (
    <main style={{ padding: '20px' }}>
      <h1 style={{ marginTop: 0 }}>Домашнее задание №7</h1>
      <BookGalleryDemo />
    </main>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
