<template>
  <div ref="container" class="layer-on-canvas">
    <!--div ref="gameContainer" class="game-container"></div-->
    <Permission
      v-if="!permissionGranted"
      @click="handlePermissionResponse"
      ref="permissionComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  DirectionalLight,
  MathUtils,
  Camera
} from 'three'
import Permission from '@/components/permission/DeviceOrientation.vue' // パスは実際の場所に合わせて調整してください
import type { Rotation } from '@/types/index'
import { handleOrientation, fallbackOrientation } from '@/utils/orientation'

const provider = inject('provider') as {
  context: WebGL2RenderingContext
  canvas: HTMLCanvasElement
  camera: any
  renderer: WebGLRenderer | null
  controls: any | null
  initProvider: () => void
  setOrbitControls: (camera: any) => void
}
const gameContainer = ref<HTMLDivElement | null>(null)
const permissionComponent = ref<any | null>(null)
const permissionGranted = ref(false)

let scene: Scene
let renderer: WebGLRenderer
let ball: Mesh

const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })

const initScene = () => {
  scene = new Scene()
  provider.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  // レンダラーの作成
  if (provider.renderer) {
    // provider.renderer.antialias = false
    provider.renderer.setSize(window.innerWidth, window.innerHeight)
    // 環境光を追加
    provider.renderer.setClearColor(0xf0f0f0) // レンダラーの背景色も設定
    // 初期レンダリングを行う
    provider.renderer.render(scene, provider.camera)
  }

  setupLight()

  // const geometry = new SphereGeometry(0.5, 32, 32)
  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshPhongMaterial({ color: 0xff0000 })
  ball = new Mesh(geometry, material)
  scene.add(ball)

  provider.camera.position.z = 5
  provider.setOrbitControls(provider.camera)
  animate()
}

const setupLight = () => {
  // 全体的な環境光を追加
  const ambientLight = new AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // メインの指向性光源
  const directionalLight = new DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)
}

const animate = () => {
  requestAnimationFrame(animate)

  // デバイスの向きに応じてシーンを傾ける
  scene.rotation.x = MathUtils.degToRad(rotation.value.beta)
  scene.rotation.z = MathUtils.degToRad(rotation.value.gamma)

  if (provider.controls) {
    provider.controls.update()
  }
  if (provider.renderer && provider.camera) {
    provider.renderer.render(scene, provider.camera)
  }
}

const localHandleOrientation = (event: DeviceOrientationEvent) => {
  handleOrientation(event, rotation)
  // rotationX.value = event.beta ?? 0 // X軸周りの回転 (-180 to 180)
  // rotationZ.value = event.gamma ?? 0 // Z軸周りの回転 (-90 to 90)
}
const localFallbackOrientation = (event: KeyboardEvent) => {
  fallbackOrientation(event, 5, rotation)
}

// デバイス許可の申請結果によって処理を変更
const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    permissionGranted.value = true
    window.addEventListener('deviceorientation', localHandleOrientation)
  } else {
    window.addEventListener('keydown', localFallbackOrientation)
  }
  initScene()
}

onMounted(async () => {
  if (permissionComponent.value) {
    const isAvailable = await permissionComponent.value.checkOrientation()
    if (isAvailable) {
      handlePermissionResponse(true)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', localHandleOrientation)
  window.removeEventListener('keydown', localFallbackOrientation)
  renderer?.dispose()
})
</script>

<style lang="scss" scoped>
.layer-on-canvas {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
