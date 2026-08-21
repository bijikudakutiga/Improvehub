import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'IMPROVEHUB Finance & Tax',
        short_name: 'IMPROVEHUB',
        description: 'Laporan keuangan & perpajakan IMPROVEHUB Group',
        theme_color: '#EFEAF9',
        background_color: '#EFEAF9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192-v2.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512-v2.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
