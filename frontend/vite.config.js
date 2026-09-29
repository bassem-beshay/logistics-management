import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.FRAPPE_PROXY_TARGET || 'http://localhost:8001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
