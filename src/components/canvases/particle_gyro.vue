<template>
  <div class="canvas-fluid position-absolute">
    <ParticleClass
      v-for="particle in particleArray"
      :key="particle.id"
      :id="particle.id"
      :rotation="rotation"
      :canvas="canvas"
      ref="particles"
    />
    <div class="debug-info">
      Rotation: X: {{ rotation.x.toFixed(2) }}, Y: {{ rotation.y.toFixed(2) }}, Z:
      {{ rotation.z.toFixed(2) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, inject } from 'vue'
import ParticleClass from '@/components/canvases/classes/particles_gyro.vue'

const provider = inject('provider') as {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
}

const canvas = reactive({ width: window.innerWidth, height: window.innerHeight })
const particleArray = ref<{ id: number }[]>([])
const numberOfParticles = 200
let requestId: number | null = null

const particles = ref<any[]>([])

const ctx = computed(() => provider.context)

const rotation = ref({ x: 0, y: 0, z: 0 })
const updateRotation = (event: DeviceOrientationEvent) => {
  rotation.value.x = event.beta ?? 0
  rotation.value.y = event.gamma ?? 0
  rotation.value.z = event.alpha ?? 0
}

const init = () => {
  particleArray.value = Array.from({ length: numberOfParticles }, (_, i) => ({ id: i }))
  nextTick(() => {
    if (provider.canvas) {
      provider.canvas.style.filter = "url('#goo')"
    }
    animate()
  })
}

const animate = () => {
  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvas.width, canvas.height)

    particles.value.forEach((particle) => {
      if (particle && particle.update && particle.draw) {
        particle.update(particles.value)
        particle.draw()
      }
    })

    requestId = requestAnimationFrame(animate)
  }
}

const animateCancel = () => {
  if (requestId !== null) {
    cancelAnimationFrame(requestId)
    requestId = null
  }
}

const initializeParticles = () => {
  window.addEventListener('deviceorientation', updateRotation)

  init()
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  particles.value = particleArray.value.map(() => null)
  nextTick(() => {
    particles.value = particleArray.value.map((_, index) => ({
      update: () => {},
      draw: () => {},
      ...particles.value[index]
    }))
  })
  onResize()
})

onUnmounted(() => {
  animateCancel()
  window.removeEventListener('deviceorientation', updateRotation)
  window.removeEventListener('resize', onResize)
})

const onResize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  if (requestId !== null) init()
}

defineExpose({
  initializeParticles
})
</script>

<style lang="scss" scoped>
.canvas-fluid {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  z-index: -1;
  // pointer-events: none;
  overflow: hidden;
}
.debug-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 5px;
  font-family: monospace;
  z-index: 1000;
  color: black;
}
</style>
