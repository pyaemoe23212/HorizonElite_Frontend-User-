import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router";
import router from './routes/routes';
import { TranslationProvider } from './contexts/TranslationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider>
      <RouterProvider router={router} />
    </TranslationProvider>
  </StrictMode>,
)
