import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  tailwindcss()
  ],
  server: {
    port: 5005,
    proxy: {
      '/api': 'http://localhost:5000',
      //'/auth': 'http://localhost:5000',
      //'/patients': 'http://localhost:5000',
      //'/appointments': 'http://localhost:5000',
      //'/clinical_notes': 'http://localhost:5000',
    },
  },
})
