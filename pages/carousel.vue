<template>
  <div class="p-0 m-0">
    <Carousel :pages="pages" />
  </div>
</template>

<script setup lang="ts">
import { useSwipeDetection } from "@/utils/swipeDetection";
import Carousel from "@/components/carousels/Carousel.vue";
import Page from "@/components/HelloWorld.vue";

const pages = [
  { component: Page, props: { msg: "HELLO" } },
  { component: Page, props: { msg: "HEY" } },
];
</script>

<style scoped></style>
