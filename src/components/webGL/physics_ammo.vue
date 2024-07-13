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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
  HemisphereLight
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Permission from '@/components/permission/DeviceOrientation.vue'
declare const Ammo: any
// import * as Ammo from 'ammo.js'
/* import Ammo from 'ammojs-typed'
 * ammojs-typed パッケージには、Ammo.jsの内部に依存する fs や path モジュールが含まれている
 * Viteは、これらのNode.jsモジュールを外部化するためうまく動作しない
 * Viteでammojs-typedを使用するには、ammojs-typedではなく、Ammo.jsを直接読み込むことが推奨されている
 * 「import * as Ammo from 'ammo.js'」のようにして、型定義ファイル(ammo.d.ts)を自作し、declare module 'ammo.js';` とする
 * */

const props = defineProps<{
  modelPath: string
}>()

const gameContainer = ref<HTMLDivElement | null>(null)
const permissionGranted = ref(false)
const permissionComponent = ref<any | null>(null)

let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer
let ball: Mesh
let labyrinth: Object3D | null = null

// Ammo.js variables
// let AmmoLib: typeof Ammo | any
let physicsWorld: any
let tmpTrans: any
let ballBody: any

interface Rotation {
  alpha: number
  beta: number
  gamma: number
  absolute: boolean
}
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })

const initPhysics = () => {
  const collisionConfiguration = new (Ammo as any).btDefaultCollisionConfiguration()
  const dispatcher = new (Ammo as any).btCollisionDispatcher(collisionConfiguration)
  const overlappingPairCache = new (Ammo as any).btDbvtBroadphase()
  const solver = new (Ammo as any).btSequentialImpulseConstraintSolver()

  physicsWorld = new (Ammo as any).btDiscreteDynamicsWorld(
    dispatcher,
    overlappingPairCache,
    solver,
    collisionConfiguration
  )
  physicsWorld.setGravity(new (Ammo as any).btVector3(0, -9.8, 0))

  tmpTrans = new (Ammo as any).btTransform()
}

const initScene = () => {
  scene = new Scene()
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  gameContainer.value?.appendChild(renderer.domElement)

  setupLightDebug()

  camera.position.set(0, 5, 10)
  camera.lookAt(0, 0, 0)
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

const setupLightDebug = () => {
  renderer.setClearColor(0xf0f0f0) // レンダラーの背景色も設定
  // 半球光源を追加（空からの柔らかい光）
  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6)
  hemiLight.color.setHSL(0.6, 1, 0.6)
  hemiLight.groundColor.setHSL(0.095, 1, 0.75)
  hemiLight.position.set(0, 50, 0)
  scene.add(hemiLight)

  // 全体的な環境光を追加
  const ambientLight = new AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  // メインの指向性光源
  const directionalLight = new DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7.5)
  directionalLight.castShadow = true // 影を有効化
  scene.add(directionalLight)

  // 影の設定
  renderer.shadowMap.enabled = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 1
  directionalLight.shadow.camera.far = 50
}

const loadLabyrinth = async () => {
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(props.modelPath)
    labyrinth = gltf.scene
    if (scene && labyrinth) {
      labyrinth.scale.set(50, 1000, 50)
      labyrinth.position.set(-10, 1, 0) // 中心に配置
      labyrinth.rotation.x = -Math.PI / 2 // ラビリンスを水平にする

      // Add physics to labyrinth
      labyrinth.traverse((child) => {
        if (child instanceof Mesh) {
          const shape = new (Ammo as any).btBoxShape(
            new (Ammo as any).btVector3(
              child.scale.x * 0.5,
              child.scale.y * 0.5,
              child.scale.z * 0.5
            )
          )
          const transform = new (Ammo as any).btTransform()
          transform.setIdentity()
          transform.setOrigin(
            new (Ammo as any).btVector3(child.position.x, child.position.y, child.position.z)
          )
          const motionState = new (Ammo as any).btDefaultMotionState(transform)
          const localInertia = new (Ammo as any).btVector3(0, 0, 0)
          const rbInfo = new (Ammo as any).btRigidBodyConstructionInfo(
            0,
            motionState,
            shape,
            localInertia
          )
          const body = new (Ammo as any).btRigidBody(rbInfo)
          physicsWorld.addRigidBody(body)
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
  ball.position.set(0, 0.5, 0)
  scene.add(ball)

  // Add physics to ball
  const shape = new (Ammo as any).btSphereShape(0.05)
  const transform = new (Ammo as any).btTransform()
  transform.setIdentity()
  transform.setOrigin(new (Ammo as any).btVector3(0, 0.5, 0))
  const motionState = new (Ammo as any).btDefaultMotionState(transform)
  const localInertia = new (Ammo as any).btVector3(0, 0, 0)
  shape.calculateLocalInertia(1, localInertia)
  const rbInfo = new (Ammo as any).btRigidBodyConstructionInfo(1, motionState, shape, localInertia)
  ballBody = new (Ammo as any).btRigidBody(rbInfo)
  physicsWorld.addRigidBody(ballBody)
}

const updatePhysics = () => {
  // Update ball position
  const ms = ballBody.getMotionState()
  if (ms) {
    ms.getWorldTransform(tmpTrans)
    const p = tmpTrans.getOrigin()
    const q = tmpTrans.getRotation()
    ball.position.set(p.x(), p.y(), p.z())
    ball.quaternion.set(q.x(), q.y(), q.z(), q.w())
  }

  // Apply tilt force to the ball
  const gravityStrength = 5 // Adjust this value to change the tilt sensitivity
  const tiltX = MathUtils.degToRad(rotation.value.beta)
  const tiltZ = MathUtils.degToRad(rotation.value.gamma)
  const force = new Ammo.btVector3(
    Math.sin(tiltZ) * gravityStrength,
    -9.8, // Constant downward gravity
    -Math.sin(tiltX) * gravityStrength
  )
  ballBody.applyCentralForce(force)

  // Update gravity based on device orientation
  //const gravityX = Math.sin(MathUtils.degToRad(rotation.value.gamma)) * 9.8
  //const gravityZ = -Math.sin(MathUtils.degToRad(rotation.value.beta)) * 9.8
  //physicsWorld.setGravity(new (Ammo as any).btVector3(gravityX, -9.8, gravityZ))
}

const animate = () => {
  requestAnimationFrame(animate)

  const deltaTime = 1 / 60
  physicsWorld.stepSimulation(deltaTime, 10)
  // Update physics
  updatePhysics()

  renderer.render(scene, camera)
}

const handleOrientation = (event: DeviceOrientationEvent) => {
  if (permissionComponent.value && permissionComponent.value.handleOrientation) {
    permissionComponent.value.handleOrientation(event, rotation)
  }
}

const fallbackOrientation = (event: KeyboardEvent) => {
  if (permissionComponent.value && permissionComponent.value.fallbackOrientation) {
    permissionComponent.value.fallbackOrientation(event, 5, rotation)
  }
}

const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    window.addEventListener('deviceorientation', handleOrientation)
  } else {
    console.log('keydown top, bottom, left, right')
    window.addEventListener('keydown', fallbackOrientation)
  }
  permissionGranted.value = true
  initGame()
}

const initGame = async () => {
  initPhysics()
  initScene()
  loadLabyrinth()
  createBall()
  animate()
}

const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

onMounted(async () => {
  if (permissionComponent.value) {
    try {
      const isAvailable = await permissionComponent.value.checkOrientation()
      if (!isAvailable) {
        console.log('Start with fallback orientation')
        handlePermissionResponse(isAvailable)
      }
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
  height: 100%;
}
</style>
