import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The live URL of your Render backend service
const RENDER_BACKEND_URL = 'https://server-sqj1.onrender.com';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // This will proxy any request starting with /api to your Render backend
      '/api': {
        target: RENDER_BACKEND_URL,
        changeOrigin: true, // Recommended for virtual hosted sites
        secure: false,      // Recommended unless you have specific security needs
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
