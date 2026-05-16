import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { initClient } from './lib/auth.ts'
import { initSentry } from './lib/sentry.ts'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
initClient(convex);
initSentry();

// Analytics
const GA_ID = import.meta.env.VITE_GA_ID || '';
if (GA_ID) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) { window.dataLayer.push(args); }
  gtag('js', new Date());
  gtag('config', GA_ID);
}

createRoot(document.getElementById('root')!).render(
  <ConvexProvider client={convex}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ConvexProvider>
)
