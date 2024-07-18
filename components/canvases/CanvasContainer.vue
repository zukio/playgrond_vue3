<template>
  <div :style="props.flexStyle">
    <canvas ref="canvas1" id="canvas1"> </canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, provide, onMounted, onUnmounted, defineProps } from "vue";

interface Provider {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
}

const provider = reactive<Provider>({
  canvas: null,
  context: null,
});

provide("provider", provider);

const props = defineProps<{
  flexStyle: any;
}>();

const canvas1 = ref<HTMLCanvasElement | null>(null);

const initProvider = () => {
  if (canvas1.value && (!provider.context || !provider.canvas)) {
    provider.canvas = canvas1.value;
    provider.context = canvas1.value.getContext("2d");

    const parentElement = canvas1.value.parentElement;
    if (parentElement) {
      // 解像度
      canvas1.value.width = parentElement.clientWidth;
      canvas1.value.height = parentElement.clientHeight;
      // 表示サイズ
      canvas1.value.style.width = `${parentElement.clientWidth}px`;
      canvas1.value.style.height = `${parentElement.clientHeight}px`;
    }
  }
};

const onResize = () => {
  if (provider.canvas) {
    provider.canvas.width = window.innerWidth;
    provider.canvas.height = window.innerHeight;
  }
};

onMounted(() => {
  window.addEventListener("resize", onResize);
  onResize();
  initProvider();
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<style lang="scss" scoped>
canvas {
  display: block; /* This removes the default inline-block behavior */
  width: 100%;
  height: 100%;
}
</style>
