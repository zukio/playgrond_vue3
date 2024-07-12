<template>
  <div>
    <div ref="gameContainer" class="game-container"></div>
    <Permission
      v-if="!permissionGranted"
      @click="handlePermissionResponse"
      ref="permissionComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
  MathUtils
} from 'three'
import Permission from '@/components/permission/DeviceOrientation.vue' // パスは実際の場所に合わせて調整してください

const gameContainer = ref<HTMLDivElement | null>(null)
// const permissionComponent = ref<InstanceType<typeof Permission> | null>(null)
const permissionComponent = ref<any | null>(null)
const permissionGranted = ref(false)

let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer
let ball: Mesh

// `Rotation` インターフェースを追加し、デバイスの向きを追跡します。
interface Rotation {
  alpha: number
  beta: number
  gamma: number
  absolute: boolean
}
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })

const initScene = () => {
  scene = new Scene()
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  gameContainer.value?.appendChild(renderer.domElement)

  const ambientLight = new AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)

  // const geometry = new SphereGeometry(0.5, 32, 32)
  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshPhongMaterial({ color: 0xff0000 })
  ball = new Mesh(geometry, material)
  scene.add(ball)

  camera.position.z = 5
}

const animate = () => {
  requestAnimationFrame(animate)

  // デバイスの向きに応じてシーンを傾ける
  scene.rotation.x = MathUtils.degToRad(rotation.value.beta)
  scene.rotation.z = MathUtils.degToRad(rotation.value.gamma)

  renderer.render(scene, camera)
}

const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const handleOrientation = (event: DeviceOrientationEvent) => {
  permissionComponent.value.handleOrientation(event, rotation)
  // rotationX.value = event.beta ?? 0 // X軸周りの回転 (-180 to 180)
  // rotationZ.value = event.gamma ?? 0 // Z軸周りの回転 (-90 to 90)
}
const fallbackOrientation = (event: KeyboardEvent) => {
  permissionComponent.value.fallbackOrientation(event, 5, rotation)
}

// デバイス許可の申請結果によって処理を変更
const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    permissionGranted.value = true
    window.addEventListener('deviceorientation', handleOrientation)
  } else {
    window.addEventListener('keydown', fallbackOrientation)
  }
  initScene()
  animate()
}

onMounted(async () => {
  if (permissionComponent.value) {
    const isAvailable = await permissionComponent.value.checkOrientation()
    if (isAvailable) {
      handlePermissionResponse(true)
    }
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', handleOrientation)
  window.removeEventListener('resize', handleResize)
  renderer?.dispose()
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
</style>
