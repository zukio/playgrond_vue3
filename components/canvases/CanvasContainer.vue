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
    // provider.context = canvas1.value.getContext("2d");
    provider.context = canvas1.value.getContext("2d", {
      willReadFrequently: true,
    });

    const parentElement = canvas1.value.parentElement;
    const parentWidth = parentElement ? parentElement.clientWidth : window.innerWidth;
    const parentHeight = parentElement ? parentElement.clientHeight : window.innerHeight;
    // 解像度
    canvas1.value.width = parentWidth;
    canvas1.value.height = parentHeight;
    // 表示サイズ 100%
    //canvas1.value.style.width = `${parentWidth}px`;
    //canvas1.value.style.height = `${parentHeight}px`;
  }
};

const onResize = () => {
  if (provider.canvas) {
    const parentElement = provider.canvas.parentElement;
    const parentWidth = parentElement ? parentElement.clientWidth : window.innerWidth;
    const parentHeight = parentElement ? parentElement.clientHeight : window.innerHeight;

    // 解像度 そのまま
    //provider.canvas.width = parentWidth;
    //provider.canvas.height = parentHeight;
  }
};

onMounted(() => {
  // window.addEventListener("resize", onResize);
  // onResize();
  initProvider();
});

onUnmounted(() => {
  // window.removeEventListener("resize", onResize);
});
const activeSelf = (activate: boolean) => {
  //
};
defineExpose({
  activeSelf,
});
</script>

<style lang="scss" scoped>
canvas {
  display: block; /* This removes the default inline-block behavior */
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  background-image: url("@/assets/images/labyrinth/texture_01.png");
}
</style>
