<template>
  <div class="page-container" ref="pageContainer">
    <div v-for="(page, index) in pages" :key="index" class="page">
      <component :is="page.component" v-bind="page.props"></component>
    </div>
  </div>
  <div class="position-absolute w-100 top-50 d-flex justify-content-between z-3">
    <div id="prev_btn" class="rounded-pill">
      <span v-if="currentIndex > 0" class="carousel-control-prev-icon" @click="handleSwipe('right')"></span>
    </div>
    <div id="next_btn" class="rounded-pill">
      <span
        v-if="currentIndex < pages.length - 1"
        class="carousel-control-next-icon"
        @click="handleSwipe('left')"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSwipeDetection } from "@/utils/swipeDetection";

const props = defineProps<{
  pages: any[];
}>();

const pageContainer = ref<HTMLElement | null>(null);

const currentIndex = ref(0);

const handleSwipe = (direction: string) => {
  if (direction === "left") {
    // swipe to left from right
    if (currentIndex.value < props.pages.length - 1) {
      currentIndex.value++;
      onSwipe("left");
    }
  } else if (direction === "right") {
    // swipe to right from left
    if (currentIndex.value > 0) {
      currentIndex.value--;
      onSwipe("right");
    }
  }
};

// Swipe direction handling
const onSwipe = (direction: string) => {
  if (direction === "left" && currentIndex.value < props.pages.length - 1) {
    currentIndex.value++;
  } else if (direction === "right" && currentIndex.value > 0) {
    currentIndex.value--;
  }
  updatePagePosition();
};

const updatePagePosition = () => {
  if (pageContainer.value) {
    const contentsWidth = pageContainer.value.offsetWidth;
    pageContainer.value.style.transform = `translateX(${-currentIndex.value * 100}%)`;
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
} = useSwipeDetection(pageContainer, handleSwipe);

onMounted(() => {
  if (pageContainer.value) {
    pageContainer.value.addEventListener("mousedown", handleMouseDown);
    pageContainer.value.addEventListener("mousemove", handleMouseMove);
    pageContainer.value.addEventListener("mouseup", handleMouseUp);
    pageContainer.value.addEventListener("mouseleave", handleMouseLeave);
    pageContainer.value.addEventListener("touchstart", handleTouchStart);
    pageContainer.value.addEventListener("touchmove", handleTouchMove);
    pageContainer.value.addEventListener("touchend", handleTouchEnd);
  }
});

onBeforeUnmount(() => {
  if (pageContainer.value) {
    pageContainer.value.removeEventListener("mousedown", handleMouseDown);
    pageContainer.value.removeEventListener("mousemove", handleMouseMove);
    pageContainer.value.removeEventListener("mouseup", handleMouseUp);
    pageContainer.value.removeEventListener("mouseleave", handleMouseLeave);
    pageContainer.value.removeEventListener("touchstart", handleTouchStart);
    pageContainer.value.removeEventListener("touchmove", handleTouchMove);
    pageContainer.value.removeEventListener("touchend", handleTouchEnd);
  }
});
</script>

<style scoped>
.page-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  transition: transform 0.3s ease;
  margin: 0;
  padding: 0;
}

.page {
  flex: 0 0 100%;
  /*background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  user-select: none;
  margin: 0;
  padding: 0;*/
}

#prev_btn,
#next_btn {
  width: 50px;
  height: 50px;
  max-width: 50px;
  max-height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
