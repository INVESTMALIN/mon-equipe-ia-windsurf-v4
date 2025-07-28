import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Fallback pour development - on simule juste une réponse
          proxy.on('error', (err, req, res) => {
            console.log('API proxy error:', err)
          })
        }
      }
    }
  }
})