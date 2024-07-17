<template>
  <div id="carouselExample" class="carousel slide" ref="carouselSelf">
    <div class="carousel-inner">
      <div
        v-for="(page, index) in pages"
        :key="index"
        class="carousel-item"
        :class="{ active: selectedIndex == index }"
      >
        <component :is="page.component" v-bind="page.props"></component>
      </div>
    </div>
    <button
      v-if="selectedIndex > 0"
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
      v-if="selectedIndex < pages.length - 1"
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSwipeDetection } from '@/utils/swipeDetection'
const props = defineProps<{
  pages: any[]
}>()

const carouselSelf = ref(null)
const pageContainer = ref<HTMLElement | null>(null)
const prevBtn = ref<HTMLButtonElement | null>(null)
const nextBtn = ref<HTMLButtonElement | null>(null)
const selectedIndex = ref(0)

const next = () => {
  if (selectedIndex.value < props.pages.length - 1) {
    selectedIndex.value += 1
  } else {
    selectedIndex.value = props.pages.length - 1
  }
  nextBtn.value?.click()
}

const prev = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value -= 1
  } else {
    selectedIndex.value = 0
  }
  prevBtn.value?.click()
}

const handleSwipe = (direction: string) => {
  if (direction === 'left') {
    // swipe to left from right
    next()
  } else if (direction === 'right') {
    // swipe to right from left
    prev()
  }
}

const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd
} = useSwipeDetection(pageContainer, handleSwipe)

onMounted(() => {
  const app = useNuxtApp()
  const carousel = new app.$bootstrap.Carousel(document.getElementById('carouselExample'))

  if (carouselSelf.value) {
    pageContainer.value = carouselSelf.value.parentElement
    if (pageContainer.value) {
      pageContainer.value.addEventListener('mousedown', handleMouseDown)
      pageContainer.value.addEventListener('mousemove', handleMouseMove)
      pageContainer.value.addEventListener('mouseup', handleMouseUp)
      pageContainer.value.addEventListener('mouseleave', handleMouseLeave)
      pageContainer.value.addEventListener('touchstart', handleTouchStart)
      pageContainer.value.addEventListener('touchmove', handleTouchMove)
      pageContainer.value.addEventListener('touchend', handleTouchEnd)
    }
  }
})

onBeforeUnmount(() => {
  if (pageContainer.value) {
    pageContainer.value.removeEventListener('mousedown', handleMouseDown)
    pageContainer.value.removeEventListener('mousemove', handleMouseMove)
    pageContainer.value.removeEventListener('mouseup', handleMouseUp)
    pageContainer.value.removeEventListener('mouseleave', handleMouseLeave)
    pageContainer.value.removeEventListener('touchstart', handleTouchStart)
    pageContainer.value.removeEventListener('touchmove', handleTouchMove)
    pageContainer.value.removeEventListener('touchend', handleTouchEnd)
  }
})

defineExpose({
  next,
  prev
})
</script>

<style scoped>
.carousel-item {
  height: 100svh;
}
</style>
