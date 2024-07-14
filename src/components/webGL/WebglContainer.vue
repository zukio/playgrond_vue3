<template>
  <div :style="props.flexStyle">
    <canvas ref="canvas"></canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, provide, onMounted, onUnmounted, type CSSProperties } from 'vue'
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
provider.setOrbitControls = (camera: OrthographicCamera | PerspectiveCamera | null) => {
  if (camera) {
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      if (!provider.renderer) return
      provider.controls = new OrbitControls(camera, provider.renderer.domElement)
      provider.controls.enableDamping = true
      provider.controls.dampingFactor = 0.25
      provider.controls.screenSpacePanning = false
      provider.controls.minDistance = 5
      provider.controls.maxDistance = 50
      provider.controls.maxPolarAngle = Math.PI / 2
    })
  }
  onResize()
}

const props = defineProps<{
  flexStyle: CSSProperties | undefined
}>()

const onResize = () => {
  if (canvas.value) {
    const parentElement = canvas.value.parentElement

    if (parentElement) {
      // 解像度
      canvas.value.width = parentElement.clientWidth
      canvas.value.height = parentElement.clientHeight
      // 表示サイズ
      canvas.value.style.width = `${parentElement.clientWidth}px`
      canvas.value.style.height = `${parentElement.clientHeight}px`
    }

    if (provider.camera && provider.renderer) {
      const aspect = canvas.value ? canvas.value.clientWidth / canvas.value.clientHeight : 1
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
      provider.renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)
    }
  }
}

onMounted(() => {
  provider.initProvider()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (provider.renderer) {
    provider.renderer.dispose()
  }
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped>
// 親（呼び出し元）で指定
.canvas-wrapper {
  position: relative;
}
// 親サイズいっぱいに依存
canvas {
  display: block; /* This removes the default inline-block behavior */
  width: 100%;
  height: 100%;
}

@media screen and (max-width: 600px) {
  .game-container {
    background-color: pink;
  }
}

@media screen and (min-width: 601px) and (max-width: 1200px) {
  .game-container {
    background-color: khaki;
  }
}

@media screen and (min-width: 1201px) {
  .game-container {
    border-color: aquamarine;
  }
}
</style>
