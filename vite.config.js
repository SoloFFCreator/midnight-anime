import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/hindi-stream': {
        target: 'https://nuvioapi-erbmmxkc.manus.space',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hindi-stream/, '/api/stream'),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
})
