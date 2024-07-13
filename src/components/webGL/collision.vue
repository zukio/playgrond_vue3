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
/* この衝突判定方法は簡易的なものです。より精密な判定が必要な場合は、物理エンジン（例：Ammo.js）の使用を検討してください。
1. `walls` 配列を追加して、迷路の壁のメッシュを保存します。
2. `loadLabyrinthAsync` 関数内で、迷路のメッシュをトラバースし、名前に "Wall" が含まれるメッシュを壁として `walls` 配列に追加します。
3. `checkCollision` 関数を新たに追加し、ボールと壁の衝突判定を行います。この関数では、ボールの周囲6方向にレイを飛ばし、壁との交差を確認します。
4. 衝突が検出された場合、ボールの速度を壁の法線方向に反射させ、めり込みを解消します。
5. `animate` 関数内で `checkCollision` を呼び出し、毎フレーム衝突判定を行います。
*/
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
  HemisphereLight,
  Raycaster
  // PlaneGeometry
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
let scene: Scene
let ball: Mesh
let labyrinth: Object3D | null = null

const ballRadius = 0.05 // ボールの半径を定数として定義
const boundaryRadius = 2 // 全体的な境界の半径
const gravity = new Vector3(0, -9.8, 0)
const ballVelocity = new Vector3()

const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })
const permissionGranted = ref(false)
const permissionComponent = ref<any | null>(null)
const gameContainer = ref<HTMLDivElement | null>(null)

// コライダー
let walls: Mesh[] = []
const raycaster = new Raycaster()

const initGame = () => {
  initProvider()
  initScene()
  loadLabyrinthAsync()
  createBall()
  setupCamera()
  animate()
}

// プロバイダーの初期化チェック
const initProvider = () => {
  if (!provider.context || !provider.canvas) {
    const canvasElement = document.querySelector('canvas') as HTMLCanvasElement
    if (canvasElement) {
      provider.canvas = canvasElement
      provider.context = canvasElement.getContext('webgl2') as WebGL2RenderingContext
    }
  }
}

const initScene = () => {
  scene = new Scene()
  provider.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  setupLight()

  // レンダラーの作成
  if (provider.renderer) {
    // provider.renderer.antialias = false
    provider.renderer.setSize(window.innerWidth, window.innerHeight)
    // 環境光を追加
    // provider.renderer.setClearColor(0xf0f0f0) // レンダラーの背景色も設定
    // 初期レンダリングを行う
    provider.renderer.render(scene, provider.camera)
  }
  provider.setOrbitControls(provider.camera)
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

const loadLabyrinthAsync = async () => {
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(props.modelPath)
    labyrinth = gltf.scene
    if (scene && labyrinth) {
      labyrinth.scale.set(50, 1000, 50)
      labyrinth.position.set(-10, 1, 0) // 中心に配置
      labyrinth.rotation.x = -Math.PI / 2 // ラビリンスを水平にする

      // 床を追加
      //const floorGeometry = new PlaneGeometry(5, 5) // サイズは迷路に合わせて調整
      //const floorMaterial = new MeshPhongMaterial({ color: 0xcccccc })
      //const floor = new Mesh(floorGeometry, floorMaterial)
      //floor.rotation.z = -Math.PI / 2
      //floor.position.z = -1 // 壁の下に少し配置
      //scene.add(floor)

      labyrinth.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          walls.push(child)
        }
      })

      scene.add(labyrinth)
      console.log('Labyrinth added to scene')
    }
  } catch (error) {
    console.error('ラビリンスモデルの読み込み中にエラーが発生しました:', error)
  }
}

const createBall = () => {
  const ballGeometry = new SphereGeometry(ballRadius, 32, 32)
  const ballMaterial = new MeshPhongMaterial({ color: 0xff0000 })
  ball = new Mesh(ballGeometry, ballMaterial)
  ball.position.set(0, 0.1, 0)
  ball.castShadow = true
  if (scene) {
    scene.add(ball)
  }
}

const checkCollisionSimple = () => {
  if (ball.position.length() > boundaryRadius - ballRadius) {
    const normal = ball.position.clone().normalize()
    ball.position.setLength(boundaryRadius - ballRadius)
    ballVelocity.reflect(normal)
    ballVelocity.multiplyScalar(0.8) // 反射時に少し減速
  }
}

const checkCollisionWithWalls = () => {
  const directions = [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1)
  ]

  for (const direction of directions) {
    raycaster.set(ball.position, direction)
    const intersects = raycaster.intersectObjects(walls)

    if (intersects.length > 0 && intersects[0].distance < ballRadius) {
      const normal = intersects[0].face?.normal || new Vector3()
      ballVelocity.reflect(normal)
      ballVelocity.multiplyScalar(0.8) // 反射時に少し減速
      ball.position.add(normal.multiplyScalar(ballRadius - intersects[0].distance + 0.01)) // 0.01を追加して少し浮かせる
    }
  }

  // 床との衝突判定
  if (ball.position.y < ballRadius) {
    ball.position.y = ballRadius
    ballVelocity.y = Math.abs(ballVelocity.y) * 0.1 // 床で跳ね返る
  }
}

const setupCamera = () => {
  if (provider.camera && scene) {
    provider.camera.position.set(-5, -5, 8) // カメラ位置を調整
    // camera.lookAt(scene.position)
    // camera.lookAt(new Vector3(0, 0, 0))
    // camera.lookAt(new Vector3(0, 0, 0))
    // カメラを真下向きにする
    provider.camera.up.set(0, -1, 0)
  }
}

const animate = () => {
  requestAnimationFrame(animate)

  if (ball && labyrinth) {
    const gravityStrength = 9.8
    const tiltX = MathUtils.degToRad(rotation.value.beta)
    const tiltZ = MathUtils.degToRad(rotation.value.gamma)
    gravity.set(
      Math.sin(tiltZ) * gravityStrength,
      -gravityStrength, // 常に下向きの重力
      -Math.sin(tiltX) * gravityStrength
    )

    ballVelocity.add(gravity.clone().multiplyScalar(0.016))
    ball.position.add(ballVelocity.clone().multiplyScalar(0.016))

    checkCollisionWithWalls()
    checkCollisionSimple()
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

// デバイス許可の申請結果によって処理を変更
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
    if (isAvailable) {
      handlePermissionResponse(true)
    }
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
<style lang="scss" scoped>
.layer-on-canvas {
  /* position: absolute; カメラコントロールが効かなくなる*/
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
