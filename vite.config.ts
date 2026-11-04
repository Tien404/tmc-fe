import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/identity': {
        target: 'http://127.0.0.1:8081',
        rewrite: (path) => path.replace(/^\/identity/, ''),
      },
      '/checkin': {
        target: 'http://127.0.0.1:8080',
        rewrite: (path) => path.replace(/^\/checkin/, ''),
      },
    },
  },
})
