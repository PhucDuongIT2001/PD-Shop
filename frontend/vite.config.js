import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://47.129.213.238.nip.io',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://47.129.213.238.nip.io',
        changeOrigin: true,
      },
      '/login/oauth2/code': {
        target: 'http://47.129.213.238.nip.io',
        changeOrigin: true,
      }
    }
  }
})
