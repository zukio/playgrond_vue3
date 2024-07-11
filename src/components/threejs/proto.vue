<template>
  <div>
    <div ref="gameContainer" class="game-container"></div>
    <Permission
      v-show="!permissionGranted"
      @click="handlePermissionResponse"
      ref="permissionComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Object3D,
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  AmbientLight,
  DirectionalLight,
  MathUtils
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Permission from '@/components/permission/DeviceOrientation.vue'
import * as CANNON from 'cannon-es'

const props = defineProps<{
  modelPath: string
}>()

const gameContainer = ref<HTMLDivElement | null>(null)
const permissionGranted = ref(false)
const permissionComponent = ref<any | null>(null)

let scene: Scene
let camera: OrthographicCamera
let renderer: WebGLRenderer
let ball: Mesh
let labyrinth: Object3D | null = null
let orbitcontrols: OrbitControls

// Cannon.js variables
let world: CANNON.World
let ballBody: CANNON.Body

interface Rotation {
  alpha: number
  beta: number
  gamma: number
  absolute: boolean
}
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })

const initPhysics = () => {
  world = new CANNON.World()
  world.gravity.set(0, 0, 0) // No gravity since we handle it with device orientation

  // Collision detection
  const solver = new CANNON.GSSolver()
  solver.iterations = 10
  world.solver = solver

  // Broadphaseの設定
  world.broadphase = new CANNON.NaiveBroadphase()
}

const initScene = () => {
  scene = new Scene()
  const aspect = window.innerWidth / window.innerHeight
  const frustumSize = 10 // 値を大きくするとズームアウト、小さくするとズームイン
  camera = new OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  )

  renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  gameContainer.value?.appendChild(renderer.domElement)

  // OrbitControlsの初期化
  orbitcontrols = new OrbitControls(camera, renderer.domElement)
  orbitcontrols.enableDamping = true
  orbitcontrols.dampingFactor = 0.25
  orbitcontrols.screenSpacePanning = false
  orbitcontrols.minDistance = 5
  orbitcontrols.maxDistance = 50
  orbitcontrols.maxPolarAngle = Math.PI / 2

  setupLight()

  camera.position.set(0, 5, 10)
  camera.lookAt(0, 0, 0)
}

const setupLight = () => {
  renderer.setClearColor(0xf0f0f0) // レンダラーの背景色も設定
  const ambientLight = new AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)
}

const loadLabyrinth = async () => {
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(props.modelPath)
    labyrinth = gltf.scene
    if (scene && labyrinth) {
      labyrinth.scale.set(50, 1, 50)
      labyrinth.position.set(0, 0, 0) // 中心に配置
      labyrinth.rotation.x = -Math.PI / 2 // ラビリンスを水平にする

      labyrinth.traverse((child) => {
        if (child instanceof Mesh) {
          const box = new CANNON.Box(
            new CANNON.Vec3(child.scale.x * 0.5, child.scale.y * 0.5, child.scale.z * 0.5)
          )
          const body = new CANNON.Body({
            mass: 0,
            shape: box,
            position: new CANNON.Vec3(child.position.x, child.position.y, child.position.z)
          })
          world.addBody(body)
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
  const ballGeometry = new SphereGeometry(0.5, 16, 16)
  const ballMaterial = new MeshPhongMaterial({ color: 0xff0000 })
  ball = new Mesh(ballGeometry, ballMaterial)
  ball.scale.set(0.5, 0.5, 0.5)
  ball.position.set(0, 0.5, 0) // ボールを迷路の中に配置
  scene.add(ball)

  const shape = new CANNON.Sphere(0.5)
  ballBody = new CANNON.Body({
    mass: 1,
    shape: shape,
    position: new CANNON.Vec3(0, 0.5, 0), // Cannon.jsのボディの位置も同じに設定
    linearDamping: 0.9, // 強めの減衰設定
    angularDamping: 0.9 // 回転の減衰設定
  })
  world.addBody(ballBody)
}

const animate = () => {
  requestAnimationFrame(animate)

  const deltaTime = 1 / 60
  world.step(deltaTime)

  updatePhysics()
  orbitcontrols.update()
  renderer.render(scene, camera)
}

const updatePhysics = () => {
  // ボールの位置と回転をThree.jsのメッシュに反映
  ball.position.copy(ballBody.position)
  ball.quaternion.copy(ballBody.quaternion)

  // デバイスの傾きを力に変換
  const gravityStrength = 0.5 // 力の適用強度を減少
  const tiltX = MathUtils.degToRad(rotation.value.beta || 0)
  const tiltZ = MathUtils.degToRad(rotation.value.gamma || 0)

  // 適用する力を計算
  const forceX = Math.sin(tiltZ) * gravityStrength
  const forceZ = -Math.sin(tiltX) * gravityStrength

  // ボールに力を適用
  ballBody.applyForce(new CANNON.Vec3(forceX, 0, forceZ), ballBody.position)
}

const handleOrientation = (event: DeviceOrientationEvent) => {
  if (permissionComponent.value && permissionComponent.value.handleOrientation) {
    permissionComponent.value.handleOrientation(event, rotation)
  } else {
    // 手動でrotation変数を更新
    rotation.value.beta = event.beta || 0
    rotation.value.gamma = event.gamma || 0
  }
}

const fallbackOrientation = (event: KeyboardEvent) => {
  const forceStrength = 0.5 // 力の強さを調整
  switch (event.key) {
    case 'ArrowUp':
      rotation.value.beta -= forceStrength
      break
    case 'ArrowDown':
      rotation.value.beta += forceStrength
      break
    case 'ArrowLeft':
      rotation.value.gamma -= forceStrength
      break
    case 'ArrowRight':
      rotation.value.gamma += forceStrength
      break
  }
}

const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    window.addEventListener('deviceorientation', handleOrientation)
  } else {
    window.addEventListener('keydown', fallbackOrientation)
  }
  permissionGranted.value = true
  initGame()
}

const initGame = async () => {
  initPhysics()
  initScene()
  await loadLabyrinth()
  createBall()
  animate()
}

const handleResize = () => {
  if (camera && renderer) {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 10 // 値を大きくするとズームアウト、小さくするとズームイン
    camera.left = (frustumSize * aspect) / -2
    camera.right = (frustumSize * aspect) / 2
    camera.top = frustumSize / 2
    camera.bottom = frustumSize / -2
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

onMounted(async () => {
  if (permissionComponent.value) {
    try {
      const isAvailable = await permissionComponent.value.checkOrientation()
      handlePermissionResponse(isAvailable)
    } catch (error) {
      console.error('Error checking orientation availability:', error)
    }
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', handleOrientation)
  window.removeEventListener('keydown', fallbackOrientation)
  window.removeEventListener('resize', handleResize)
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100vh;
}
</style>
