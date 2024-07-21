<template>
  <div id="carouselExample" class="carousel slide" ref="carouselSelf">
    <div class="carousel-inner">
      <div
        v-for="(page, index) in pages"
        :key="index"
        class="carousel-item"
        :class="{ 'active': currentIndex == index }"
      >
        <component :is="page.component" v-bind="page.props" :ref="(el: any) => (pageRefs[index] = el)"></component>
      </div>
    </div>
    <button
      v-if="!startStop"
      @click="prev"
      ref="prevBtn"
      class="carousel-control-prev"
      type="button"
      data-bs-target="#carouselExample"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button
      v-if="!endStop"
      @click="next"
      ref="nextBtn"
      class="carousel-control-next"
      type="button"
      data-bs-target="#carouselExample"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSwipeDetection } from "@/utils/swipeDetection";
const props = defineProps<{
  pages: any[];
}>();

// Emitsの定義
const emit = defineEmits(["onPageChanged"]);

const carouselSelf = ref<HTMLElement | null>(null);
const carouselContainer = ref<HTMLElement | null>(null);
const pageRefs = ref<Array<HTMLElement | null>>([]); // Array to hold references to page components
const currentIndex = ref(0);
//const activeComponent: any = computed(() => {
//  return pageRefs.value ? pageRefs.value[currentIndex.value] || null : null;
//});
const prevBtn = ref<HTMLButtonElement | null>(null);
const nextBtn = ref<HTMLButtonElement | null>(null);
const startStop = computed(() => {
  return currentIndex.value <= 0;
});
const endStop = computed(() => {
  return currentIndex.value >= props.pages.length - 1;
});
const next = () => {
  if (endStop) return;
  const oldIndex = currentIndex.value;
  currentIndex.value += 1;
  // nextBtn.value?.click();
  emit("onPageChanged", currentIndex.value, oldIndex);
};

const prev = () => {
  if (startStop) return;
  const oldIndex = currentIndex.value;
  currentIndex.value -= 1;
  // prevBtn.value?.click();
  emit("onPageChanged", currentIndex.value, oldIndex);
};
// -----------------------------------------------
// Swipe
const handleSwipe = (direction: string) => {
  if (direction === "left") {
    // swipe to left from right
    next();
  } else if (direction === "right") {
    // swipe to right from left
    prev();
  }
};

const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useSwipeDetection(carouselContainer, handleSwipe);

onMounted(() => {
  console.log("Mounted: Carousel");
  const { $bootstrap }: any = useNuxtApp();
  const carousel = new $bootstrap.Carousel(document.getElementById("carouselExample"));
  carousel.addEventListener("slide.bs.carousel", (event: any) => {
    const slideIndex = event.to;
    // slideIndexを使用して特定のスライドに対する処理を実行
    console.log(slideIndex);
  });
  if (carouselSelf.value) {
    carouselContainer.value = carouselSelf.value.parentElement;
    if (carouselContainer.value) {
      carouselContainer.value.addEventListener("mousedown", handleMouseDown);
      carouselContainer.value.addEventListener("mousemove", handleMouseMove);
      carouselContainer.value.addEventListener("mouseup", handleMouseUp);
      carouselContainer.value.addEventListener("mouseleave", handleMouseLeave);
      carouselContainer.value.addEventListener("touchstart", handleTouchStart);
      carouselContainer.value.addEventListener("touchmove", handleTouchMove);
      carouselContainer.value.addEventListener("touchend", handleTouchEnd);
    }
  }
});

onBeforeUnmount(() => {
  console.log("Unmount: Carousel");
  if (carouselContainer.value) {
    carouselContainer.value.removeEventListener("mousedown", handleMouseDown);
    carouselContainer.value.removeEventListener("mousemove", handleMouseMove);
    carouselContainer.value.removeEventListener("mouseup", handleMouseUp);
    carouselContainer.value.removeEventListener("mouseleave", handleMouseLeave);
    carouselContainer.value.removeEventListener("touchstart", handleTouchStart);
    carouselContainer.value.removeEventListener("touchmove", handleTouchMove);
    carouselContainer.value.removeEventListener("touchend", handleTouchEnd);
  }
});

defineExpose({
  currentIndex,
  pageRefs,
  next,
  prev,
});
</script>

<style scoped>
/*.carousel-item {
  height: 100svh;
}*/
</style>
