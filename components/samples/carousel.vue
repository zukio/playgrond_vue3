<template>
  <div class="p-0 m-0">
    <Carousel :pages="components" ref="carouselRef" @onPageChanged="onPageChanged" />
  </div>
</template>

<script setup lang="ts">
// import { useSwipeDetection } from "@/utils/swipeDetection";
import Carousel from "@/components/carousels/Carousel.vue";
import Page1 from "@/components/book/Read.vue";
import Page2 from "@/components/book/Read.vue";
import CanvasView from "@/components/samples/canvas-view.vue";
import ThreeView from "@/components/samples/three-view.vue"; // Page1とPage2は同じコンポーネントと仮定

const carouselRef: any = ref(null);
const components = [
  { component: Page1, props: { pageIndex: 0 }, ref: "page1Ref" },
  { component: Page2, props: { pageIndex: 1 }, ref: "page2Ref" },
  { component: CanvasView, props: { contentNo: 0 }, ref: "page3Ref" },
  { component: ThreeView, props: { contentNo: 0 } },
  //{{ component: ThreeView, props: { contentNo: 1 } },
];
const activeIndex = computed(() => {
  return carouselRef?.currentIndex || 0;
});
const activeComponent = computed(() => {
  return components[activeIndex.value] || null;
});
const onPageChanged = (newIndex: number, oldIndex: number) => {
  console.log(activeIndex, `(${newIndex}, ${oldIndex})`);
};
</script>

<style scoped></style>
