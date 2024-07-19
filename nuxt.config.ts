import { defineNuxtConfig } from "nuxt/config";
import { fileURLToPath, URL } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    baseURL: process.env.NODE_ENV === "production" ? "/playgrond_vue3/" : "/",
  },
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    // "driver.js/dist/driver.min.css", // "@/plugins/driver.client.ts内に記述
    "@/assets/css/main.css",
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/css/_main.scss" as *;',
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@popperjs/core": "@popperjs/core/dist/umd/popper.min.js",
      },
    },
    server: {
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:  data:; img-src 'self' data:; object-src 'none';",
      },
    },
    optimizeDeps: {
      include: ["three"],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      commonjsOptions: {
        include: [/three/, /node_modules/],
      },
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || "/",
    },
  },
  build: {
    transpile: ["gsap", "three"],
  },
});
