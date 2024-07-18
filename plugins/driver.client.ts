// ===============================================
// Driver.js plugin for Nuxt.js
// ===============================================
// import { defineNuxtPlugin } from "#app";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default defineNuxtPlugin((nuxtApp) => {
  // nuxtApp.provide("driver", driver);
  return {
    provide: {
      driver: driver,
    },
  };
});
