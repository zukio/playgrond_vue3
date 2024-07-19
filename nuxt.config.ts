import { defineNuxtConfig } from "nuxt/config";
import { fileURLToPath, URL } from "node:url";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    baseURL: process.env.NODE_ENV === "production" ? "/playgrond_vue3/" : "/",
    head: {
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: process.env.NODE_ENV === "production" ? "/playgrond_vue3/favicon.ico" : "/favicon.ico",
        },
      ],
    },
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
    server: {
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:  data:; img-src 'self' data:; object-src 'none';",
      },
    },
    optimizeDeps: {
      include: ["three"],
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
