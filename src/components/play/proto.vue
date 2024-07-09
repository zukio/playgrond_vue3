<template>
  <div>
    <div ref="gameContainer"></div>
    <Permission v-if="!permissionGranted" @click="responcedPermission" ref="gyroDevice" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Permission from '@/components/permission/DeviceOrientation.vue'

const props = defineProps<{
  modelPath: string
}>()

const gyroDevice = ref<any | null>(null)
const permissionGranted = ref(false)
const gameContainer = ref<HTMLDivElement | null>(null)
const scene = ref<THREE.Scene | null>(null)
const camera = ref<THREE.PerspectiveCamera | null>(null)
const renderer = ref<THREE.WebGLRenderer | null>(null)
const labyrinth = ref<THREE.Object3D | null>(null)
const ball = ref<THREE.Mesh | null>(null)
const rotationX = ref(0)
const rotationZ = ref(0)

// デバイス許可の申請結果によって処理を変更
async function responcedPermission(
  isDeviceOrientationAvailable: boolean,
  isDeviceMotionAvailable: boolean
) {
  if (isDeviceOrientationAvailable) {
    permissionGranted.value = true
    initGame()
  }
}

onMounted(async () => {
  if (gyroDevice.value && (await gyroDevice.value.checkOrientation)) {
    permissionGranted.value = true
    initGame()
  }
})

const initGame = () => {
  initScene()
  loadLabyrinth()
  createBall()
  setupCamera()
  startAnimation()
  addEventListeners()
}

const initScene = () => {
  scene.value = new THREE.Scene()
  camera.value = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer.value = new THREE.WebGLRenderer()
  renderer.value.setSize(window.innerWidth, window.innerHeight)
  if (gameContainer.value) {
    gameContainer.value.appendChild(renderer.value.domElement)
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.value.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(10, 10, 10)
  scene.value.add(directionalLight)
}

const loadLabyrinth = async () => {
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(props.modelPath)
    labyrinth.value = gltf.scene
    if (scene.value) {
      scene.value.add(labyrinth.value)
    }
  } catch (error) {
    console.error('ラビリンスモデルの読み込み中にエラーが発生しました:', error)
  }
}

const createBall = () => {
  const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32)
  const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 })
  ball.value = new THREE.Mesh(ballGeometry, ballMaterial)
  ball.value.position.set(0, 1, 0)
  if (scene.value) {
    scene.value.add(ball.value)
  }
}

const setupCamera = () => {
  if (camera.value && scene.value) {
    camera.value.position.set(0, 5, 5)
    camera.value.lookAt(scene.value.position)
  }
}

const startAnimation = () => {
  const animate = () => {
    requestAnimationFrame(animate)

    if (labyrinth.value) {
      labyrinth.value.rotation.x = THREE.MathUtils.degToRad(rotationX.value)
      labyrinth.value.rotation.z = THREE.MathUtils.degToRad(rotationZ.value)
    }

    if (ball.value && labyrinth.value) {
      ball.value.position.x += Math.sin(labyrinth.value.rotation.z) * 0.02
      ball.value.position.z -= Math.sin(labyrinth.value.rotation.x) * 0.02

      const boundaryRadius = 2
      if (ball.value.position.length() > boundaryRadius) {
        ball.value.position.normalize().multiplyScalar(boundaryRadius)
      }
    }

    if (renderer.value && scene.value && camera.value) {
      renderer.value.render(scene.value, camera.value)
    }
  }

  animate()
}

const addEventListeners = () => {
  window.addEventListener('deviceorientation', handleOrientation)
  window.addEventListener('resize', handleResize)
}

const handleOrientation = (event: DeviceOrientationEvent) => {
  rotationX.value = event.beta ?? 0 // X軸周りの回転 (-180 to 180)
  rotationZ.value = event.gamma ?? 0 // Z軸周りの回転 (-90 to 90)
}

const handleResize = () => {
  if (camera.value && renderer.value) {
    camera.value.aspect = window.innerWidth / window.innerHeight
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(window.innerWidth, window.innerHeight)
  }
}

onUnmounted(() => {
  window.removeEventListener('deviceorientation', handleOrientation)
  window.removeEventListener('resize', handleResize)
  if (renderer.value) {
    renderer.value.dispose()
  }
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100vh;
}
</style>
