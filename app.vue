<template>
  <NuxtLayout>
    <NuxtPage ref="page" />
  </NuxtLayout>
</template>
<script setup lang="ts">
const page = ref();
useHead({
  titleTemplate: (titleChunk: string | undefined) => {
    return titleChunk ? `${titleChunk} - Sitename` : "Sitename";
  },
  htmlAttrs: { lang: "ja" },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
  ],
  /*link: [
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    // { rel: "manifest", href: "/manifest.json" }
  ],*/
});
</script>
<style lang="scss">
#full {
  min-height: 100svh;
}
</style>
