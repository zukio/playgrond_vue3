<template>
  <div class="layer-on-canvas">
    <ParticleClass
      v-for="(particle, index) in particleArray"
      v-bind:key="particle.id"
      ref="particles"
      :mouse="mouse"
      :canvas="canvasSize"
      @thaw="thaw_snow(index)"
      class="position-absolute"
    >
    </ParticleClass>
    <svg>
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 19 -9"
            result="goo"
          ></feColorMatrix>
          <feComposite in="SourceGraphic" in2="goo" operator="atop"></feComposite>
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, inject } from 'vue'
// import { ref, reactive, computed, onMounted, nextTick, inject } from 'vue'
import ParticleClass from '@/components/canvases/classes/particles_drop.vue'

const props = defineProps<{
  contentBackgroud: string
}>()

const provider = inject('provider') as {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
}

const canvasSize = reactive({ width: window.innerWidth, height: window.innerHeight })
const particleArray = ref<any[]>([])
const numberOfParticles = 200
let requestId: number | null = null

const particles = ref<any[]>([])

const ctx = computed(() => provider.context)

//const mouse = reactive({ x: undefined as number | undefined, y: undefined as number | undefined })
//const onMousemove = (evt: MouseEvent) => {
//  mouse.x = evt.clientX
//  mouse.y = evt.clientY
//}

const mouse = ref({ x: 0, y: 0 })
const onMousemove = (evt: MouseEvent) => {
  mouse.value = {
    x: evt.clientX,
    y: evt.clientY
  }
}

const init = () => {
  particleArray.value = []
  for (let i = 0; i < numberOfParticles; i++) {
    particleArray.value.push({ id: i })
  }
  nextTick(() => {
    particles.value = particleArray.value.map(() => {
      let x = Math.random() * canvasSize.width
      let y = Math.random() * canvasSize.height
      let size = Math.random() * 10 + 5
      let color = 'white'
      let weight = 1
      return { x, y, size, color, weight }
    })
    nextTick(() => {
      if (provider.canvas) {
        provider.canvas.style.filter = "url('#goo')"
      }
      animate()
    })
  })
}

const animate = () => {
  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvasSize.width, canvasSize.height)
    // ctx.value.fillStyle = `rgba(${props.contentBackgroud}, 1)`
    // ctx.value.fillRect(0, 0, canvasSize.width, canvasSize.height)
    particles.value.forEach((particle) => {
      if (particle.update) particle.update()
      if (particle.draw) particle.draw()
    })
    //connect()
    requestId = requestAnimationFrame(animate)
  }
}

const animateCancel = () => {
  if (requestId !== null) {
    cancelAnimationFrame(requestId)
    requestId = null
  }
}

const connect = () => {
  if (ctx.value) {
    let opacityValue = 1
    for (let a = 0; a < particleArray.value.length; a++) {
      for (let b = a; b < particleArray.value.length; b++) {
        let dx = particles.value[a].x - particles.value[b].x
        let dy = particles.value[a].y - particles.value[b].y
        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          opacityValue = 1 - distance / 10000
          ctx.value.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`
          ctx.value.lineWidth = 1
          ctx.value.beginPath()
          ctx.value.moveTo(particles.value[a].x, particles.value[a].y)
          ctx.value.lineTo(particles.value[b].x, particles.value[b].y)
          ctx.value.stroke()
        }
      }
    }
  }
}

const thaw_snow = (index: number) => {
  particleArray.value.splice(index, 1)
}

const onResize = () => {
  canvasSize.width = window.innerWidth
  canvasSize.height = window.innerHeight

  init()
}
onMounted(() => {
  window.addEventListener('mousemove', onMousemove)
  window.addEventListener('resize', onResize)

  onResize()
  init()
})

onUnmounted(() => {
  animateCancel()
  window.removeEventListener('mousemove', onMousemove)
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped>
.layer-on-canvas {
  //
}
</style>
