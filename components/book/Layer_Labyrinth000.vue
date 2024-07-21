<template>
  <div class="m-0 p-3 w-100 h-100" ref="gsapCanvas">
    <div class="info">
      <h3 class="text-center">{{ title }}</h3>
      <p style="white-space: pre-wrap">{{ description }}</p>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, onUnmounted } from "vue";
import gsap from "gsap";

// ===============================================
// components: レイヤー | loading spinner
// ===============================================
// props // 親コンポーネントから継承した値
interface Props {
  title: string;
  description: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "string",
  description: "string",
});

// emit // 親コンポーネントとの連絡用
const emit = defineEmits(["onContinue"]);
// -----------------------------------------------
// data
let tl: gsap.core.Timeline;
let ctx: gsap.Context;
const gsapCanvas = ref<HTMLElement | null>(null);
// -----------------------------------------------
// LifeCycle
function tween() {
  tl.play();
}

onMounted(() => {
  if (ctx) ctx.revert();
  if (!gsapCanvas.value) return;
});

onUnmounted(() => {
  if (ctx) ctx.revert(); // <- Easy Cleanup!
});

defineExpose({
  tween,
});
</script>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  // left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  animation: slideinTopDown 0.3s ease-in-out;
  text-align: center;
  touch-action: auto;
}

@keyframes slideinTopDown {
  0% {
    transform: translateY(-100vh);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
