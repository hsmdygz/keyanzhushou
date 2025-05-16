import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://clifikqzwwps.sealoshzh.site',
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    host: '0.0.0.0',
    cors: true,
    hmr: {
      overlay: false
    }
  }
})
