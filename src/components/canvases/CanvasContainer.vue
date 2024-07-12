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
import { ref, reactive, provide, onMounted, onUnmounted } from 'vue'

interface Provider {
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
}

const provider = reactive<Provider>({
  canvas: null,
  context: null
})

provide('provider', provider)

const initProvider = () => {
  if (canvas1.value && (!provider.context || !provider.canvas)) {
    provider.canvas = canvas1.value
    provider.context = canvas1.value.getContext('2d')

    const parentElement = canvas1.value.parentElement
    if (parentElement) {
      canvas1.value.width = parentElement.clientWidth
      canvas1.value.height = parentElement.clientHeight
    }
  }
}

const props = defineProps<{
  bgColor: string | undefined
}>()
const canvas1 = ref<HTMLCanvasElement | null>(null)
const onResize = () => {
  if (provider.canvas) {
    provider.canvas.width = window.innerWidth
    provider.canvas.height = window.innerHeight
  }
}
onMounted(() => {
  window.addEventListener('resize', onResize)
  onResize()
  initProvider()
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped>
/* 親（呼び出し元）で指定
.canvas-wrapper {
}*/

canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
}
</style>
