import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': process.env.AMAL_API_URL || 'http://127.0.0.1:8000',
      '/health': process.env.AMAL_API_URL || 'http://127.0.0.1:8000',
      '/ready': process.env.AMAL_API_URL || 'http://127.0.0.1:8000',
    },
  },
})
