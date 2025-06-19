import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5005,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/patients': 'http://localhost:5000',
      '/appointments': 'http://localhost:5000',
      '/clinical_notes': 'http://localhost:5000',
    },
  },
})
