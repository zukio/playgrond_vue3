<template>
  <div ref="particleRef" :style="particleStyle"></div>
</template>

<script setup lang="ts">
import { ref, defineProps, toRef, computed } from 'vue'

interface Canvas {
  width: number
  height: number
}

interface Rotation {
  x: number
  y: number
  z: number
}

const props = defineProps<{
  canvas: Canvas
  rotation: Rotation
  id: number
}>()

const rotationRef = toRef(props, 'rotation')
const particleRef = ref<HTMLDivElement | null>(null)

const x = ref(Math.random() * props.canvas.width)
const y = ref(0) // Start from the top
const size = ref(Math.random() * 3 + 2) // Slightly larger particles
const color = ref(`rgba(0, 100, 255, ${Math.random() * 0.5 + 0.25})`)
const vx = ref(0)
const vy = ref(0)

const gravity = 0.2
const friction = 0.99

const particleStyle: any = computed(() => ({
  position: 'absolute',
  width: `${size.value * 2}px`,
  height: `${size.value * 2}px`,
  borderRadius: '50%',
  backgroundColor: color.value
}))

const update = (particles: any[]) => {
  let ax = Math.sin((rotationRef.value.y * Math.PI) / 180) * 0.1
  let ay = Math.sin((rotationRef.value.x * Math.PI) / 180) * 0.1

  // Apply gravity only if not at the bottom
  if (y.value < props.canvas.height - size.value) {
    vy.value += gravity * size.value
  }

  // Apply rotation effects
  vx.value += ax
  vy.value += ay

  vx.value *= friction
  vy.value *= friction

  // Update position
  x.value += vx.value
  y.value += vy.value

  // Boundary check
  if (x.value < size.value) {
    x.value = size.value
    vx.value = 0
  } else if (x.value > props.canvas.width - size.value) {
    x.value = props.canvas.width - size.value
    vx.value = 0
  }

  if (y.value < size.value) {
    y.value = size.value
    vy.value = 0
  } else if (y.value > props.canvas.height - size.value) {
    y.value = props.canvas.height - size.value
    vy.value = 0
  }

  // Simple collision detection with other particles
  particles.forEach((otherParticle) => {
    if (otherParticle !== this) {
      const dx = otherParticle.x.value - x.value
      const dy = otherParticle.y.value - y.value
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDist = size.value + otherParticle.size.value

      if (distance < minDist) {
        const angle = Math.atan2(dy, dx)
        const targetX = x.value + Math.cos(angle) * minDist
        const targetY = y.value + Math.sin(angle) * minDist
        const ax = (targetX - otherParticle.x.value) * 0.05
        const ay = (targetY - otherParticle.y.value) * 0.05

        vx.value -= ax
        vy.value -= ay
        otherParticle.vx.value += ax
        otherParticle.vy.value += ay
      }
    }
  })
}

const draw = () => {
  if (particleRef.value) {
    particleRef.value.style.transform = `translate(${x.value}px, ${y.value}px)`
  }
}

defineExpose({
  update,
  draw,
  x,
  y,
  size,
  vx,
  vy
})
</script>
