<template>
  <div :style="props.bgColor ? { backgroundColor: props.bgColor } : ''">
    <canvas
      ref="canvas1"
      id="canvas1"
      :style="props.bgColor ? { backgroundColor: props.bgColor } : ''"
    >
    </canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, provide, onMounted } from 'vue'

interface Provider {
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
}

const provider = reactive<Provider>({
  canvas: null,
  context: null
})

provide('provider', provider)

const props = defineProps<{
  bgColor: string | undefined
}>()
const canvas1 = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (canvas1.value) {
    provider.canvas = canvas1.value
    provider.context = canvas1.value.getContext('2d')

    const parentElement = canvas1.value.parentElement
    if (parentElement) {
      canvas1.value.width = parentElement.clientWidth
      canvas1.value.height = parentElement.clientHeight
    }
  }
})
</script>

<style lang="scss" scoped>
/* 背景色は親（呼び出し元）で指定
.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: top right / cover repeat-y #d36015;
  z-index: -100;
}*/

canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
  /*background:linear-gradient(#25364f, #4d71a5, #9bc4ff);*/
  /*background: black;*/
}
</style>
