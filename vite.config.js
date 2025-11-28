import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/reuniform/',
  server: {
    // Allow ngrok and other tunneling services
    allowedHosts: [
      '.ngrok.io',
      '.ngrok-free.app',
      'localhost',
    ],
    // Alternatively, use 'all' to allow all hosts (less secure but convenient for dev)
    // allowedHosts: 'all',
  }
})
