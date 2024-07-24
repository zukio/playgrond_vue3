<template>
  <div class="attention" ref="attention">
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
import { gsap } from "gsap";

// Propsの定義
const props = defineProps<{
  title: string;
  duration: number;
}>();

// Emitsの定義
const emit = defineEmits(["close"]);

// Tooltipの参照
const attention = ref(null);
const timmer = ref<NodeJS.Timeout | null>(null);

function showAttention() {
  gsap.from(attention.value, { opacity: 0, x: -20, duration: 0.1 });
  // 表示時間
  timmer.value = setTimeout(hideAttention, 1000);
}
function hideAttention() {
  gsap.to(attention.value, { opacity: 0, x: -20, duration: 0.1, onComplete: () => emit("close") });
  timmer.value = null;
}
// -----------------------------------------------
// LifeCycle
onMounted(() => {
  showAttention();
});
onBeforeUnmount(() => {
  if (timmer.value) {
    clearTimeout(timmer.value);
    timmer.value = null;
  }
});
</script>

<style scoped lang="scss">
.attention {
  width: 25px;
  height: 50px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  //border: 1px solid #ddd;
  //border-radius: 50%;
  color: black;
  opacity: 1;
  font-size: 2rem;
  margin: 0;
  padding: 0;
  //touch-action: none;
  //user-select: none;
  &.left {
    left: 50px;
  }
  &.right {
    right: 50px;
  }
}
</style>
