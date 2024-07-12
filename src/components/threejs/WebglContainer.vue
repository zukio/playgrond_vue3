<template>
  <div>
    <canvas ref="canvas" class="game-container"></canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, provide, onMounted, onUnmounted } from 'vue'
import { OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three'

const canvas = ref<HTMLCanvasElement | null>(null)

interface Provider {
  canvas: HTMLCanvasElement | null
  context: WebGL2RenderingContext | null
  camera: OrthographicCamera | PerspectiveCamera | null
  renderer: WebGLRenderer | null
  controls: any | null
  initProvider: () => void
  setOrbitControls: (camera: OrthographicCamera | PerspectiveCamera) => void
}

const provider = reactive<Provider>({
  canvas: null,
  context: null,
  camera: null,
  renderer: null,
  controls: null,
  initProvider: () => {},
  setOrbitControls: () => {}
})

provide('provider', provider)

provider.initProvider = () => {
  if (canvas.value) {
    provider.canvas = canvas.value
    provider.context = canvas.value.getContext('webgl2') as WebGL2RenderingContext

    // レンダラーの作成
    provider.renderer = new WebGLRenderer({
      canvas: provider.canvas,
      context: provider.context,
      antialias: true
    })
    provider.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

provider.setOrbitControls = (camera: OrthographicCamera | PerspectiveCamera) => {
  import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
    if (!camera || !provider.renderer) return
    provider.controls = new OrbitControls(camera, provider.renderer.domElement)
    provider.controls.enableDamping = true
    provider.controls.dampingFactor = 0.25
    provider.controls.screenSpacePanning = false
    provider.controls.minDistance = 5
    provider.controls.maxDistance = 50
    provider.controls.maxPolarAngle = Math.PI / 2
  })
}

const handleResize = () => {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
  }
  if (provider.camera && provider.renderer) {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 10
    if (provider.camera instanceof OrthographicCamera) {
      provider.camera.left = (frustumSize * aspect) / -2
      provider.camera.right = (frustumSize * aspect) / 2
      provider.camera.top = frustumSize / 2
      provider.camera.bottom = frustumSize / -2
    } else if (provider.camera instanceof PerspectiveCamera) {
      provider.camera.aspect = aspect
    }
    provider.camera.updateProjectionMatrix()
    provider.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

onMounted(() => {
  provider.initProvider()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (provider.renderer) {
    provider.renderer.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* styles.css */
@media screen and (max-width: 600px) {
  .game-container {
    width: 100%;
    height: 100vh;
    background-color: pink;
  }
}

@media screen and (min-width: 601px) and (max-width: 1200px) {
  .game-container {
    width: 100%;
    height: 100vh;
    background-color: khaki;
  }
}

@media screen and (min-width: 1201px) {
  .game-container {
    width: 100%;
    height: 100vh;
    border-color: aquamarine;
  }
}
</style>
