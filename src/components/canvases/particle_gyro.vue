<template>
  <div class="layer-on-canvas">
    <ParticleClass
      v-for="particle in particleArray"
      :key="particle.id"
      :id="particle.id"
      :rotation="rotation"
      :acceleration="acceleration"
      :canvas="canvasSize"
      ref="particles"
    />
    <div class="debug-info">
      Rotation: X: {{ rotation.alpha.toFixed(2) }}, Y: {{ rotation.beta.toFixed(2) }}, Z:
      {{ rotation.gamma.toFixed(2) }}
    </div>
  </div>
  <Permission @click="responcedPermission" ref="gyroDevice" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, inject } from 'vue'
import ParticleClass from '@/components/canvases/classes/particles_gyro.vue'
import Permission from '@/components/permission/DeviceOrientation.vue'

const props = defineProps<{
  contentBackgroud: string
}>()

// `Rotation` インターフェースを追加し、デバイスの向きを追跡します。
interface Rotation {
  alpha: number
  beta: number
  gamma: number
  absolute: boolean
}
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })

// `Acceleration` インターフェースを追加し、デバイスの加速度を追跡します。
interface Acceleration {
  x: number
  y: number
  z: number
}
const acceleration = ref<Acceleration>({ x: 0, y: -90, z: 0 })

const gyroDevice: any = ref(null)

const provider = inject('provider') as {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
}

const canvasSize = reactive({ width: window.innerWidth * 0.98, height: window.innerHeight * 0.98 })
const particleArray = ref<{ id: number }[]>([])
const numberOfParticles = 200
let requestId: number | null = null

const particles = ref<any[]>([])

const ctx = computed(() => provider.context)

// デバイス許可の申請結果によって処理を変更
async function responcedPermission(
  isDeviceOrientationAvailable: boolean,
  isDeviceMotionAvailable: boolean
) {
  if (isDeviceOrientationAvailable) {
    window.addEventListener('deviceorientation', (event) =>
      gyroDevice.value.handleOrientation(event, rotation)
    )
  } else {
    window.addEventListener('keydown', (event) =>
      gyroDevice.value.fallbackOrientation(event, rotation)
    )
  }
  if (isDeviceMotionAvailable) {
    window.addEventListener('devicemotion', (event) =>
      gyroDevice.value.handleMotion(event, acceleration)
    )
  } else {
    window.addEventListener('mousemove', (event) =>
      gyroDevice.value.fallbackMotion(event, acceleration)
    )
    acceleration.value.y = -50
  }
  init()
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
    ctx.value.clearRect(0, 0, canvasSize.width, canvasSize.height)
    //ctx.value.fillStyle = `rgba(${props.contentBackgroud}, 1)`
    //ctx.value.fillRect(0, 0, canvasSize.width, canvasSize.height)

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

const onResize = () => {
  canvasSize.width = window.innerWidth * 0.98
  canvasSize.height = window.innerHeight * 0.98
  if (requestId !== null) init()
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
  window.removeEventListener('resize', onResize)
  cleanupGyroEvents()

  function cleanupGyroEvents() {
    if (gyroDevice.value) {
      if (gyroDevice.value.isDeviceMotionAvailable.value) {
        window.removeEventListener('devicemotion', (event) =>
          gyroDevice.value.handleMotion(event, acceleration)
        )
      } else {
        window.removeEventListener('mousemove', (event) =>
          gyroDevice.value.fallbackMotion(event, acceleration)
        )
      }
    }
    if (gyroDevice.value) {
      if (gyroDevice.value.isDeviceOrientationAvailable.value) {
        window.removeEventListener('deviceorientation', (event) =>
          gyroDevice.value.handleOrientation(event, rotation)
        )
      } else {
        window.removeEventListener('keydown', (event) =>
          gyroDevice.value.fallbackOrientation(event, rotation)
        )
      }
    }
  }
})

defineExpose({
  init
})
</script>

<style lang="scss" scoped>
.layer-on-canvas {
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  // pointer-events: none;
  overflow: hidden;
  z-index: -1;
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
