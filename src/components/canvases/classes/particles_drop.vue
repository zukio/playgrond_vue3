<template>
  <div></div>
</template>

<script setup lang="ts">
import { ref, inject, toRef } from 'vue'

interface Provider {
  context: CanvasRenderingContext2D
}

interface Mouse {
  x: number
  y: number
}

interface Canvas {
  width: number | null
  height: number | null
}

const provider = inject('provider') as Provider

const props = defineProps<{
  mouse: Mouse
  canvas: Canvas
}>()

// mouse を reactive な ref に変換
const mouseRef = toRef(props, 'mouse')

const x = ref<number>(0)
const y = ref<number>(0)
const size = ref<number>(0)
const color = ref<string | null>(null)
const weight = ref<number>(0)

const initParticle = (
  initX: number,
  initY: number,
  initSize: number,
  initColor: string,
  initWeight: number
) => {
  x.value = initX
  y.value = initY
  size.value = initSize
  color.value = initColor
  weight.value = initWeight
}

const update = () => {
  size.value -= 0.1
  if (size.value < 0) {
    x.value = Math.floor(mouseRef.value.x + (Math.random() * 20 - 10))
    y.value = mouseRef.value.y + Math.random() * 10
    size.value = Math.floor(Math.random() * 12 + 10)
    weight.value = Math.random() * 2 - 0.5
  }
  y.value += weight.value
  y.value = Math.floor(y.value * 100) / 100
  weight.value += 2

  if (props.canvas.height !== null && y.value > props.canvas.height - size.value) {
    weight.value *= -0.2 // 跳ね返る高さ
  }
}

const draw = () => {
  const ctx = provider.context
  ctx.beginPath()
  ctx.arc(x.value, y.value, size.value, 0, Math.PI * 2, false)
  ctx.fillStyle = color.value || 'black'
  ctx.fill()
}

defineExpose({
  initParticle,
  update,
  draw
})
</script>

<style lang="scss" scoped></style>
