<template>
  <div class="tooltip" ref="tooltip">
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
    <button @click="hideTooltip">閉じる</button>
  </div>
</template>

<script setup lang="ts">
import { gsap } from "gsap";

// Propsの定義
const props = defineProps<{
  title: string;
  content: string;
}>();

// Emitsの定義
const emit = defineEmits(["close"]);

// Tooltipの参照
const tooltip = ref(null);

function showTooltip() {
  gsap.from(tooltip.value, { opacity: 0, y: -20, duration: 0.5 });
}
function hideTooltip() {
  gsap.to(tooltip.value, { opacity: 0, y: -20, duration: 0.5, onComplete: () => emit("close") });
}
onMounted(() => {
  showTooltip();
});
</script>

<style scoped lang="scss">
.tooltip {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: black;
  opacity: 1;
}
</style>
