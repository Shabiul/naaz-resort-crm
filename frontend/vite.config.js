import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/crm/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/twilio': 'http://localhost:8000',
      '/seed': 'http://localhost:8000',
      '/assets': 'http://localhost:8000',
    },
  },
})
