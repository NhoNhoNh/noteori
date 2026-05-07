import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://nginx',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://nginx',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://nginx',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
