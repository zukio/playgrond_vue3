<template>
  <Transition name="fade">
    <div v-if="visible" class="canvas-overlay">
      <svg width="100%" height="100%" style="position: absolute">
        <defs>
          <mask id="highlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              :x="highlightRect.x"
              :y="highlightRect.y"
              :width="highlightRect.width"
              :height="highlightRect.height"
              fill="black"
              class="mask-animation"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.8)" mask="url(#highlight-mask)" />
      </svg>

      <div class="highlight" :style="highlightStyle"></div>
      <Transition name="slideup-fade">
        <div v-if="showPopover" class="popover" :style="popoverStyle">
          <div class="popover-content">
            <h3>{{ title }}</h3>
            <p>{{ description }}</p>
            <slot></slot>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// ===============================================
// Component: HighlightOverlay
// ===============================================
import { computed } from "vue";
import type { CSSProperties } from "vue";

interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  highlightRect: HighlightRect;
  title?: string;
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Highlighted Area",
  description: "This area is highlighted",
});

const visible = ref(false);
const showPopover = ref(false);

const highlightStyle = computed(
  (): CSSProperties => ({
    position: "absolute",
    left: `${props.highlightRect.x}px`,
    top: `${props.highlightRect.y}px`,
    width: `${props.highlightRect.width}px`,
    height: `${props.highlightRect.height}px`,
    borderRadius: "4px",
    pointerEvents: "none",
  })
);

const popoverStyle = computed((): CSSProperties => {
  // const left = props.highlightRect.x + props.highlightRect.width / 2;
  // const top = props.highlightRect.y + props.highlightRect.height + 10;
  const left = props.highlightRect.x + props.highlightRect.width - 10;
  const top = props.highlightRect.y + 10;
  return {
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
    // transform: "translateX(-50%)",
  };
});
// -----------------------------------------------
// Lyfecycle
onMounted(() => {
  show();
});
onUnmounted(() => {
  hide();
});
const show = () => {
  visible.value = true;
  nextTick(() => {
    showPopover.value = true;
  });
};
const hide = () => {
  showPopover.value = false;
  nextTick(() => {
    visible.value = false;
  });
};

defineExpose({
  show,
  hide,
});
</script>

<style scoped lang="scss">
.canvas-overlay {
  position: absolute;
  pointer-events: none;
  //left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.highlight {
  position: absolute;
  transition: all 0.3s ease;
}

@keyframes highlight-grow {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.mask-animation {
  transform-origin: center;
  animation: highlight-grow 0.5s ease-out forwards;
}
.popover {
  position: absolute;
  max-width: 300px;
  z-index: 1000;

  &::before {
    content: "";
    position: absolute;
    left: -10px;
    top: 20px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 10px solid #fde047;
  }
  .popover-content {
    background-color: #fde047;
    color: #000;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  h3 {
    font-size: 20px;
    font-weight: 900;
  }
  p {
    font-size: 14px;
    margin-bottom: 0;
  }
}
.slideup-fade-enter-active,
.slideup-fade-leave-active {
  transition: all 0.5s ease;
}

.slideup-fade-enter-from,
.slideup-fade-leave-to {
  transform: translateY(10px) translateX(-50%);
  opacity: 0;
}
</style>
