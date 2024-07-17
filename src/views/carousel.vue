<template>
  <div class="p-0 m-0">
    <Carousel :pages="pages" />
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useSwipeDetection } from '@/utils/swipeDetection'
import Carousel from '@/components/carousels/carousel.vue'
import Page from '@/components/WelcomeAnim.vue'

const pages = [
  { component: Page, props: { msg: 'HELLO' } },
  { component: Page, props: { msg: 'HEY' } }
]
</script>

<style scoped></style>
