<template>
  <div class="layer-on-canvas">
    <ParticleClass
      v-for="particle in particleArray"
      v-bind:key="particle.id"
      ref="particles"
      :mouse="mouse"
      :canvas="canvasSize"
      :collision="collisionRect"
    >
    </ParticleClass>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, inject } from 'vue'
import ParticleClass from '@/components/canvases/classes/particles_shower.vue'

const props = defineProps<{
  contentBackgroud: string
}>()

const provider = inject('provider') as { context: CanvasRenderingContext2D }

const mouse = reactive({ x: undefined as number | undefined, y: undefined as number | undefined })
const canvasSize = reactive({ width: window.innerWidth, height: window.innerHeight })
const particleArray = ref<any[]>([])
const numberOfParticles = 200
let requestId: number | null = null

const particles = ref<any[]>([])

const ctx = computed(() => provider.context)

const collisionRect = computed(() => {
  const collisionMesurements = document.querySelector('.listContainer')?.getBoundingClientRect()
  return collisionMesurements
    ? toRectangle(collisionMesurements)
    : { x: 0, y: 0, width: 0, height: 0 }
})

const onMousemove = (evt: MouseEvent) => {
  mouse.x = evt.clientX
  mouse.y = evt.clientY
}

const toRectangle = (clientRect: DOMRect) => {
  return {
    x: clientRect.left,
    y: clientRect.top,
    width: clientRect.width,
    height: 10
  }
}

const init = () => {
  particleArray.value = []
  for (let i = 0; i < numberOfParticles; i++) {
    particleArray.value.push({ id: i })
  }
  nextTick(() => {
    for (let i = 0; i < numberOfParticles; i++) {
      const x = Math.random() * canvasSize.width
      const y = Math.random() * canvasSize.height
      particles.value[i].constructor(x, y)
    }
    nextTick(() => {
      animate()
    })
  })
}

const animate = () => {
  if (ctx.value) {
    ctx.value.lineCap = 'round'
    ctx.value.fillStyle = `rgba(${props.contentBackgroud}, 0.01)`
    ctx.value.fillRect(0, 0, canvasSize.width, canvasSize.height)

    particles.value.forEach((particle) => {
      particle.update()
      particle.draw()
    })
    requestId = requestAnimationFrame(animate)
  }
}

const animateCancel = () => {
  if (requestId !== null) {
    cancelAnimationFrame(requestId)
  }
}

onMounted(() => {
  setInterval(() => {
    mouse.x = undefined
    mouse.y = undefined
  }, 200)
  window.addEventListener('mousemove', onMousemove)
  init()
})

onUnmounted(() => {
  animateCancel()
  window.removeEventListener('mousemove', onMousemove)
})
</script>

<style lang="scss" scoped>
.layer-on-canvas {
  /* position: absolute; カメラコントロールが効かなくなる*/
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
