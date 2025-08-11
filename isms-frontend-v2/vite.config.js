import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 9001,
    hmr: {host: "192.168.1.207"}
  },
  plugins: [react()],
})
