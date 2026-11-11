import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Keep the existing hand-written public/manifest.webmanifest + icons.
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg,jpg,ico}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // The app bundle is large; raise the precache file-size ceiling.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
})
