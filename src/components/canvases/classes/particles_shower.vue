<template>
  <div></div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'

interface Provider {
  context: CanvasRenderingContext2D | null
}

const provider = inject('provider') as Provider

interface Mouse {
  x: number | undefined
  y: number | undefined
}

interface Canvas {
  width: number | null
  height: number | null
}

interface Collision {
  x: number
  y: number
  width: number
  height: number
}

const props = defineProps<{
  mouse: Mouse
  canvas: Canvas
  collision: Collision
}>()

const x = ref<number>(0)
const y = ref<number>(0)
const size = ref<number>(0)
const directionX = ref<number>(0)
const weight = ref<number>(0)

const constructor = (initX: number, initY: number) => {
  x.value = initX
  y.value = initY
  size.value = Math.random() * 15 + 1
  weight.value = size.value / 8
  directionX.value = 1
}

const update = () => {
  if (y.value > (props.canvas.height || 0)) {
    y.value = 0 - size.value
    weight.value = size.value / 8
    x.value = Math.random() * (props.canvas.width || 0) * 1.3
  }
  weight.value += 0.01

  x.value += directionX.value

  if (
    x.value < props.collision.x + props.collision.width &&
    x.value + size.value > props.collision.x &&
    y.value < props.collision.y + props.collision.height &&
    y.value + size.value > props.collision.y
  ) {
    y.value -= 3
    weight.value *= -0.5 / size.value
  } else {
    y.value += weight.value
  }
}

const draw = () => {
  const ctx = provider.context
  if (ctx) {
    ctx.fillStyle = 'yellow'
    ctx.beginPath()
    ctx.arc(x.value, y.value, size.value, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }
}

onMounted(() => {
  constructor(Math.random() * (props.canvas.width || 0), Math.random() * (props.canvas.height || 0))
})

defineExpose({
  update,
  draw
})
</script>
