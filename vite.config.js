import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://9bbc6zsl-4000.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: false,
        headers: {
          'bypass-tunnel-reminder': 'true',
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react/')) {
              return 'vendor-react'
            }
            return 'vendor-core'
          }
        },
      },
    },
  },
})
