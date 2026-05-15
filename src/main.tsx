import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'
import { initAuth } from './lib/auth.ts'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

initAuth();

createRoot(document.getElementById('root')!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
)
