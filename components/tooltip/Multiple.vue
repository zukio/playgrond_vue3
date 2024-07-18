<template>
  <span
    :data-bs-toggle="'tooltip'"
    :title="title"
    :data-bs-placement="placement"
    data-bs-custom-class="custom-tooltip"
    ref="tooltipRef"
    @click="toggleTooltip"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
const { $bootstrap }: any = useNuxtApp();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  placement: {
    type: String,
    default: "top",
  },
});

const tooltipRef = ref(null);
let tooltipInstance: any = null;
let touchtimmer: ReturnType<typeof setTimeout> | null = null;
const touchDelay = 500; // milliseconds

const show = () => {
  tooltipInstance?.show();
};

const hide = () => {
  tooltipInstance?.hide();
};

function toggleTooltip() {
  if (tooltipInstance) {
    if (tooltipInstance._isShown()) {
      hide();
    } else {
      show();
    }
  }
}

function handleTouchStart() {
  touchtimmer = setTimeout(() => {
    toggleTooltip();
  }, touchDelay);
}

function handleTouchEnd() {
  if (touchtimmer) {
    clearTimeout(touchtimmer);
  }
}

function init() {
  if ($bootstrap && $bootstrap.Tooltip && tooltipRef.value) {
    tooltipInstance = new $bootstrap.Tooltip(tooltipRef.value, {
      trigger: "manual", // タッチやクリックで表示させたいとき
      html: true, // Allow HTML in the tooltip
    });
  }
}

function dispose() {
  if (tooltipInstance) {
    tooltipInstance.dispose();
  }
  if (touchtimmer) {
    clearTimeout(touchtimmer);
    touchtimmer = null;
  }
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  dispose();
});

defineExpose({
  toggleTooltip,
  show,
  hide,
});
</script>

<style scoped>
/* Add some styles to make the tooltip touch-friendly */
[data-bs-toggle="tooltip"] {
  cursor: pointer;
  user-select: none;
}
.custom-tooltip {
  --bs-tooltip-bg: var(--bs-primary);
}
</style>
