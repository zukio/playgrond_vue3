<template>
  <section>
    <div class="page-container" ref="pageContainer">
      <div v-for="(page, index) in pages" :key="index" class="page">
        <component
          :is="page.component"
          v-bind="page.props"
          :ref="(el: any) => (pageRefs[index] = el)"
          @custom-event="handleCustomEvent"
        ></component>
      </div>
    </div>
    <div class="position-absolute w-100 top-50 d-flex justify-content-between">
      <div id="prev_btn" class="rounded-pill">
        <span class="carousel-control-prev-btn" :class="{ 'disabled': startStop }" @click="handleSwipe('right')"
          >&lt;</span
        >
      </div>
      <div id="next_btn" class="rounded-pill">
        <span class="carousel-control-next-btn" :class="{ 'disabled': endStop }" @click="handleSwipe('left')"
          >&gt;</span
        >
      </div>
    </div>
    <!-- Reminder -->
    <div id="attention" class="position-absolute w-100" v-if="showAttention">
      <Bubble
        :title="!endStop ? '>' : '<'"
        :duration="intervalSeconds"
        @close="showAttention = false"
        class="position-absolute top-50 z-3"
        :class="endStop ? 'left' : 'right'"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Bubble from "@/components/tooltip/GsapAttention.vue";
import { useSwipeDetection } from "@/utils/swipeDetection";
// -----------------------------------------------
// data
const props = defineProps<{
  pages: any[];
}>();

// Emitsの定義
const emit = defineEmits(["onPageChanged", "customEvent"]);

const handleCustomEvent = (eventData: any) => {
  emit("customEvent", eventData);
};
// -----------------------------------------------
// カルーセル
const pageContainer = ref<HTMLElement | null>(null);
const pageRefs = ref<Array<HTMLElement | null>>([]); // Array to hold references to page components

const currentIndex = computed(() => {
  return useUser().readingState.currentIndex;
});
watch(currentIndex, (newIndex, oldIndex) => {
  updatePagePosition(oldIndex);
});

const startStop = computed(() => {
  return currentIndex.value === 0;
});
const endStop = computed(() => {
  return currentIndex.value === props.pages.length - 1;
});

function moveNext() {
  if (currentIndex.value < props.pages.length - 1) {
    // ページ移動先：進む
    useUser().setCurrentIndex(currentIndex.value + 1);
    // ページ移動元（進む前のページ）
    // updatePagePosition(currentIndex.value - 1);
  }
}
function movePrev() {
  if (currentIndex.value > 0) {
    // ページ移動先：戻る
    useUser().setCurrentIndex(currentIndex.value - 1);
    // ページ移動元（戻る前のページ）
    // updatePagePosition(currentIndex.value + 1);
  }
}
// -----------------------------------------------
// Reminder
const timmer = ref<NodeJS.Timeout | null>(null);
const showAttention = ref(false);
const intervalSeconds = 1000 + 1000; // 表示間隔（ミリ秒）最低アニメーション分の１秒を確保
const localSetInterval = () => {
  timmer.value = setInterval(() => {
    showAttention.value = true;
  }, intervalSeconds);
};
const localClearInterval = () => {
  if (timmer.value) {
    clearInterval(timmer.value);
    timmer.value = null;
  }
  showAttention.value = false;
};
// -----------------------------------------------
// Swipe
const handleSwipe = (direction: string) => {
  if (direction === "left") {
    moveNext();
  } else if (direction === "right") {
    movePrev();
  }
};

const updatePagePosition = (oldIndex: number) => {
  if (pageContainer.value) {
    pageContainer.value.style.transform = `translateX(${-currentIndex.value * 100}%)`;
    emit("onPageChanged", currentIndex.value, oldIndex);
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
    document.addEventListener("mouseup", handleMouseUp);
    pageContainer.value.addEventListener("mouseleave", handleMouseLeave);
    pageContainer.value.addEventListener("touchstart", handleTouchStart);
    pageContainer.value.addEventListener("touchmove", handleTouchMove);
    pageContainer.value.addEventListener("touchend", handleTouchEnd);

    // Reminder
    localSetInterval();
  }
});

onBeforeUnmount(() => {
  if (pageContainer.value) {
    pageContainer.value.removeEventListener("mousedown", handleMouseDown);
    pageContainer.value.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    pageContainer.value.removeEventListener("mouseleave", handleMouseLeave);
    pageContainer.value.removeEventListener("touchstart", handleTouchStart);
    pageContainer.value.removeEventListener("touchmove", handleTouchMove);
    pageContainer.value.removeEventListener("touchend", handleTouchEnd);

    // Reminder
    localClearInterval();
  }
});

defineExpose({
  currentIndex,
  pageRefs,
  moveNext,
  movePrev,
});
</script>

<style scoped lang="scss">
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
  // overflow: hidden; /* 横スクロールバーを非表示にする */
  scrollbar-width: none; /* Firefox のスクロールバーを非表示にする */
  z-index: 10;
}
.page-container::-webkit-scrollbar {
  display: none; /* Webkit ブラウザのスクロールバーを非表示にする */
}

.page {
  flex: 0 0 100%;
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
  z-index: 10;
}
.carousel-control-next-btn,
.carousel-control-prev-btn {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba($color: #fff, $alpha: 0.1);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  font-size: 2rem;
  margin: 0;
  padding: 0 0 0.2em 0;

  &.disabled {
    color: #eee;
    background-color: rgba($color: #fff, $alpha: 0);
    cursor: none;
    opacity: 0.3;
  }
}
#attention {
  user-select: none;
  touch-action: none;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 900;
  z-index: 11;
}
</style>
