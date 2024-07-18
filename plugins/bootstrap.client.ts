// ===============================================
// bootstrap5
// ===============================================
import { Modal, Tooltip, Carousel } from "bootstrap";

export default defineNuxtPlugin((nuxtApp) => {
  //nuxtApp.provide('bootstrap', bootstrap)
  return {
    provide: {
      "bootstrap": {
        Modal: Modal,
        Tooltip: Tooltip,
        Carousel: Carousel,
      },
    },
  };
});
