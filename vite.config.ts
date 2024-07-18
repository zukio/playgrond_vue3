import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数を読み取る
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env.NODE_ENV)
  return {
    base: env.NODE_ENV === 'production' ? '/playgrond_vue3/' : '/',
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
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@popperjs/core': '@popperjs/core/dist/umd/popper.min.js'
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
          "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:  data:; img-src 'self' data:; object-src 'none';"
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
  }
})
