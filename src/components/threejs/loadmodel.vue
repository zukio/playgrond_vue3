<template>
  <div ref="container" class="layer-on-canvas">
    <Permission
      v-show="!permissionGranted"
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
  Object3D,
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  AmbientLight,
  DirectionalLight,
  MathUtils,
  Vector3,
  HemisphereLight
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Permission from '@/components/permission/DeviceOrientation.vue'
import type { Rotation } from '@/types/index'
import { handleOrientation, fallbackOrientation } from '@/utils/orientation'

const props = defineProps<{
  modelPath: string
}>()

const provider = inject('provider') as {
  context: WebGL2RenderingContext
  canvas: HTMLCanvasElement
  camera: any
  renderer: WebGLRenderer | null
  controls: any | null
  initProvider: () => void
  setOrbitControls: (camera: any) => void
}
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })
const gravity = new Vector3(0, -9.8, 0)
const ballVelocity = new Vector3()
const permissionGranted = ref(false)
const permissionComponent = ref<any | null>(null)
const gameContainer = ref<HTMLDivElement | null>(null)

let scene: Scene
let ball: Mesh
let labyrinth: Object3D | null = null

const initGame = () => {
  provider.initProvider()
  initScene()
  loadLabyrinthAsync()
  createBall()
  animate()
}

const initScene = () => {
  scene = new Scene()
  provider.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  provider.camera.position.set(-5, -5, 8) // カメラ位置を調整
  provider.camera.lookAt(new Vector3(0, 0, 0))
  setupLightDebug()

  if (provider.renderer) {
    provider.renderer.setSize(window.innerWidth, window.innerHeight)
    provider.renderer.render(scene, provider.camera)
  }
  provider.setOrbitControls(provider.camera)
}

const setupLight = () => {
  const ambientLight = new AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)
}

const setupLightDebug = () => {
  if (!provider.renderer) {
    return
  }
  provider.renderer.setClearColor(0xf0f0f0)
  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6)
  hemiLight.color.setHSL(0.6, 1, 0.6)
  hemiLight.groundColor.setHSL(0.095, 1, 0.75)
  hemiLight.position.set(0, 50, 0)
  scene.add(hemiLight)

  const ambientLight = new AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  const directionalLight = new DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7.5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  if (provider.renderer) {
    provider.renderer.shadowMap.enabled = true
  }
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 1
  directionalLight.shadow.camera.far = 50
}

const loadLabyrinthAsync = async () => {
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(props.modelPath)
    labyrinth = gltf.scene
    if (scene && labyrinth) {
      labyrinth.scale.set(10, 10, 10)
      labyrinth.position.set(0, 0, 0)
      labyrinth.rotation.x = 0

      labyrinth.traverse((child) => {
        if (child instanceof Mesh) {
          child.visible = true
          child.updateMatrixWorld(true)
          const worldPosition = new Vector3()
          child.getWorldPosition(worldPosition)
          const worldScale = new Vector3()
          child.getWorldScale(worldScale)
        }
      })
      scene.add(labyrinth)
      console.log('Labyrinth added to scene and physics world')
    }
  } catch (error) {
    console.error('ラビリンスモデルの読み込み中にエラーが発生しました:', error)
  }
}

const createBall = () => {
  const ballGeometry = new SphereGeometry(0.05, 32, 32)
  const ballMaterial = new MeshPhongMaterial({ color: 0xff0000 })
  ball = new Mesh(ballGeometry, ballMaterial)
  ball.position.set(0, 0.1, 0)
  ball.castShadow = true
  if (scene) {
    scene.add(ball)
  }
}

const animate = () => {
  requestAnimationFrame(animate)

  if (ball && labyrinth) {
    const gravityStrength = 9.8
    const tiltX = MathUtils.degToRad(rotation.value.beta)
    const tiltZ = MathUtils.degToRad(rotation.value.gamma)
    gravity.set(
      -Math.sin(tiltZ) * gravityStrength,
      -Math.cos(tiltX) * gravityStrength,
      Math.sin(tiltX) * gravityStrength
    )

    ballVelocity.add(gravity.clone().multiplyScalar(0.016))
    ball.position.add(ballVelocity.clone().multiplyScalar(0.016))

    const boundaryRadius = 2
    if (ball.position.length() > boundaryRadius) {
      const normal = ball.position.clone().normalize()
      ball.position.setLength(boundaryRadius)
      ballVelocity.reflect(normal)
      ballVelocity.multiplyScalar(0.8)
    }
  }

  if (provider.controls) {
    provider.controls.update()
  }
  if (provider.renderer && provider.camera) {
    provider.renderer.render(scene, provider.camera)
  }
}

const localHandleOrientation = (event: DeviceOrientationEvent) => {
  handleOrientation(event, rotation)
}

const localFallbackOrientation = (event: KeyboardEvent) => {
  fallbackOrientation(event, 5, rotation)
}

const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    permissionGranted.value = true
    window.addEventListener('deviceorientation', localHandleOrientation)
  } else {
    window.addEventListener('keydown', localFallbackOrientation)
  }
  initGame()
}

onMounted(async () => {
  if (permissionComponent.value) {
    const isAvailable = await permissionComponent.value.checkOrientation()
    handlePermissionResponse(isAvailable)
  }
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', localHandleOrientation)
  window.removeEventListener('keydown', localFallbackOrientation)
  if (provider.renderer) {
    provider.renderer.dispose()
  }
})
</script>

<style scoped>
.layer-on-canvas {
  width: 100%;
  height: 100vh;
}
</style>
