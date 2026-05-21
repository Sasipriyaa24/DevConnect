import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: enables React Fast Refresh and JSX in .jsx files
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Later phases: proxy API calls to Express (e.g. /api -> http://localhost:4000)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
