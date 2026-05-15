import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { initAuth } from './lib/auth.ts'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

initAuth();

createRoot(document.getElementById('root')!).render(
  <ConvexProvider client={convex}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ConvexProvider>
)
