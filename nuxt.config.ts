// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
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
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NODE_ENV === "production" ? process.env.BASE_URL : "/",
    },
  },
  router: {
    base: process.env.NODE_ENV === "production" ? "/playgrond_vue3/" : "/",
  },
  build: {
    transpile: ["gsap"],
  },
});
