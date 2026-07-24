import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router";
import router from './routes/routes';
import { TranslationProvider } from './contexts/TranslationContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider>
      <CurrencyProvider>
        <RouterProvider router={router} />
      </CurrencyProvider>
    </TranslationProvider>
  </StrictMode>,
)
