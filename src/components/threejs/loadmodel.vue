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

const props = defineProps<{
  modelPath: string
}>()

interface Rotation {
  alpha: number
  beta: number
  gamma: number
  absolute: boolean
}
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })

const permissionGranted = ref(false)
const permissionComponent = ref<any | null>(null)
const gameContainer = ref<HTMLDivElement | null>(null)

let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer
let ball: Mesh
let labyrinth: Object3D | null = null

const gravity = new Vector3(0, -9.8, 0)
const ballVelocity = new Vector3()

const initGame = () => {
  initScene()
  loadLabyrinthAsync()
  createBall()
  setupCamera()
  animate()
}

const initScene = () => {
  scene = new Scene()
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  setupLightDebug()
  if (gameContainer.value) {
    gameContainer.value.appendChild(renderer.domElement)
    // 初期レンダリングを行う
    renderer.render(scene, camera)
  }
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

const loadLabyrinthAsync = async () => {
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(props.modelPath)
    labyrinth = gltf.scene
    if (scene && labyrinth) {
      // スケールと位置を調整
      labyrinth.scale.set(50, 50, 50) // スケールを小さくする
      labyrinth.position.set(-10, 0, 0) // 中心に配置
      labyrinth.rotation.x = -Math.PI / 2 // ラビリンスを水平にする

      // ラビリンスの全ての子オブジェクトに影の設定を適用
      labyrinth.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.add(labyrinth)
      console.log('Labyrinth added to scene')
    }
  } catch (error) {
    console.error('ラビリンスモデルの読み込み中にエラーが発生しました:', error)
  }
}

const loadLabyrinth = () => {
  const loader = new GLTFLoader()
  loader.load(
    props.modelPath, // GLTFファイルへのパスを指定
    (gltf) => {
      labyrinth = gltf.scene
      labyrinth.scale.set(0.5, 0.5, 0.5) // モデルのスケールを調整
      labyrinth.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      scene.add(labyrinth)
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error: Error | any) => {
      console.error('An error happened', error)
      console.log('Error type:', error.constructor.name)
      console.log('Error message:', error.message)
      // エラーレスポンスの内容を表示
      if (error.target && error.target.response) {
        console.log('Error response:', error.target.response)
      }
    }
  )
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

const setupCamera = () => {
  if (camera && scene) {
    camera.position.set(-5, -5, 8) // カメラ位置を調整
    // camera.lookAt(scene.position)
    // camera.lookAt(new Vector3(0, 0, 0))
    // camera.lookAt(new Vector3(0, 0, 0))
    // カメラを真下向きにする
    camera.up.set(0, -1, 0)
  }
}

const animate = () => {
  requestAnimationFrame(animate)

  if (ball && labyrinth) {
    // 重力の方向を傾きに応じて変更
    const gravityStrength = 9.8
    const tiltX = MathUtils.degToRad(rotation.value.beta)
    const tiltZ = MathUtils.degToRad(rotation.value.gamma)
    gravity.set(
      -Math.sin(tiltZ) * gravityStrength,
      -Math.cos(tiltX) * gravityStrength,
      Math.sin(tiltX) * gravityStrength
    )

    // ボールの速度と位置を更新
    ballVelocity.add(gravity.clone().multiplyScalar(0.016)) // 0.016は1フレームの時間（60FPS想定）
    ball.position.add(ballVelocity.clone().multiplyScalar(0.016))

    // 簡易的な衝突判定と反射
    const boundaryRadius = 2
    if (ball.position.length() > boundaryRadius) {
      const normal = ball.position.clone().normalize()
      ball.position.setLength(boundaryRadius)
      ballVelocity.reflect(normal)
      ballVelocity.multiplyScalar(0.8) // 反射時に少し減速
    }
  }

  renderer.render(scene, camera)
}

const handleOrientation = (event: DeviceOrientationEvent) => {
  if (permissionComponent.value && permissionComponent.value.handleOrientation) {
    permissionComponent.value.handleOrientation(event, rotation)
  }
}

const fallbackOrientation = (event: KeyboardEvent) => {
  if (permissionComponent.value && permissionComponent.value.fallbackOrientation) {
    permissionComponent.value.fallbackOrientation(event, rotation)
  }
}

// デバイス許可の申請結果によって処理を変更
const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    permissionGranted.value = true
    window.addEventListener('deviceorientation', handleOrientation)
  } else {
    window.addEventListener('keydown', fallbackOrientation)
  }
  initGame()
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
    const isAvailable = await permissionComponent.value.checkOrientation()
    if (isAvailable) {
      handlePermissionResponse(true)
    } else {
      handlePermissionResponse(false)
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
