import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    inspectAttr(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/*.svg', 'images/*.png', 'images/*.webp', 'images/*.jpg'],
      manifest: {
        name: 'تزيد — Tazid',
        short_name: 'تزيد',
        description: 'منصة تربط الشركات السعودية بأفضل الكفاءات الطلابية حسب التخصص',
        theme_color: '#1a3a3a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: '/images/Tazid Blue Logo (7).png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/Tazid Blue Logo (7).png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/images/Tazid Blue Logo (7).png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
