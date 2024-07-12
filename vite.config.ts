import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/playgrond_vue3/' : '/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('three-')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/assets/sass/prepends.scss";'
      }
    }
  },
  server: {
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:  data:; img-src 'self' data:; object-src 'none';"
    }
  },
  optimizeDeps: {
    include: ['three']
  },
  build: {
    chunkSizeWarningLimit: 1000, // Some chunks are larger than 500 kB after minification.
    commonjsOptions: {
      include: [/three/, /node_modules/]
    },
    outDir: 'dist'
  }
})
