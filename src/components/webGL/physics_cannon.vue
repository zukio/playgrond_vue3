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
import { ref, onMounted, onUnmounted, computed, inject } from 'vue'
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
  MathUtils,
  Vector3
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
// 画面の向きを確認するための追加処理
const isPortrait = computed((): boolean => {
  return (
    window.screen.orientation?.type.startsWith('portrait') || window.innerWidth < window.innerHeight
  )
})
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
  const frustumSize = 50 // 値を大きくするとズームアウト、小さくするとズームイン
  camera = new OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  )

  // レンダラーの初期化
  renderer = new WebGLRenderer({
    antialias: true
  })
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

  camera.position.set(0, 0, 50)
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
      labyrinth.scale.set(10, 10, 10)
      labyrinth.position.set(0, 0, 5) // 中心に配置
      labyrinth.rotation.x = 0 // 水平に配置

      labyrinth.traverse((child) => {
        if (child instanceof Mesh) {
          // メッシュを非表示にする
          child.visible = true
          // 子オブジェクトのスケールと位置を親オブジェクトのスケールと位置に合わせる
          child.updateMatrixWorld(true)
          const worldPosition = new Vector3()
          child.getWorldPosition(worldPosition)
          const worldScale = new Vector3()
          child.getWorldScale(worldScale)

          let vertices, indices
          // メッシュがインデックス化されているかどうかを確認
          if (child.geometry.index) {
            // インデックスの数が3の倍数かどうかを確認
            if (child.geometry.index.count % 3 === 0) {
              // 頂点情報を取得
              vertices = child.geometry.attributes.position.array
              indices = child.geometry.index.array
            } else {
              // メッシュを三角形に変換
              const geometry = child.geometry.toNonIndexed()
              // 頂点情報を取得
              vertices = geometry.attributes.position.array
              indices = Object.keys(vertices).map((index) => parseInt(index, 10))
            }
          } else {
            // 既に非インデックス化されたジオメトリの場合
            vertices = child.geometry.attributes.position.array
            indices = Object.keys(vertices).map((index) => parseInt(index, 10))
          }

          // 頂点情報のスケールを適用
          for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] *= worldScale.x
            vertices[i + 1] *= worldScale.y
            vertices[i + 2] *= worldScale.z
          }

          // 三角形メッシュの形状を作成
          const trimeshShape = new CANNON.Trimesh(vertices, indices)
          const body = new CANNON.Body({
            mass: 0,
            shape: trimeshShape,
            position: new CANNON.Vec3(worldPosition.x, worldPosition.y, worldPosition.z)
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
  ball.scale.set(1, 1, 1)
  ball.position.set(0, 0.5, 0) // ボールを迷路の中に配置
  scene.add(ball)

  // ボールの質量を調整することで、物理エンジンがボールの動きをより正確にシミュレートできるようにします。
  const shape = new CANNON.Sphere(0.5)
  ballBody = new CANNON.Body({
    mass: 1, // ボールの質量を小さくする
    shape: shape,
    position: new CANNON.Vec3(0, 0.5, 0),
    linearDamping: 0.9, // 強めの減衰設定
    angularDamping: 0.9 // 回転の減衰設定
  })
  // ボールとコライダーの間で衝突の反発係数（リスティチューション）を設定し、衝突後にボールが跳ね返るようにします。
  ballBody.material = new CANNON.Material()
  ballBody.material.restitution = 0.7 // 反発係数を設定
  world.addBody(ballBody)
}

const animate = () => {
  requestAnimationFrame(animate)

  // 物理エンジンのステップ時間を短くすることで、より精密な衝突検出と反応を実現できます。ボールがコライダーに埋まるのを防ぎます。
  const deltaTime = 1 / 60 // ステップ時間を短く設定
  world.step(deltaTime, 1 / 60, 10) // ステップ時間、サブステップ、最大サブステップ数

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

  const forceX = Math.sin(tiltZ) * gravityStrength
  const forceY = -Math.sin(tiltX) * gravityStrength

  // XZ平面での力の適用を確認
  ballBody.applyForce(new CANNON.Vec3(forceX, forceY, 0), ballBody.position)
  // これだとY軸方向に力を加えてしまう
  // ballBody.applyForce(new CANNON.Vec3(forceX, 0, forceY), ballBody.position)
}

const handleOrientation = (event: DeviceOrientationEvent) => {
  if (permissionComponent.value && permissionComponent.value.handleOrientation) {
    permissionComponent.value.handleOrientation(event, rotation)
  } else {
    // 手動でrotation変数を更新
    rotation.value.beta = event.beta || 0
    rotation.value.gamma = event.alpha || 0
  }

  // XZ平面での値の入れ替え
  if (isPortrait.value) {
    // ポートレート
    const temp = rotation.value.beta
    rotation.value.beta = rotation.value.gamma
    rotation.value.gamma = temp
  } else {
    // ランドスケープ
    const temp = rotation.value.alpha
    rotation.value.alpha = rotation.value.gamma
    rotation.value.gamma = temp
  }
}

const fallbackOrientation = (event: KeyboardEvent) => {
  const tiltAmount = 5
  if (permissionComponent.value && permissionComponent.value.handleOrientation) {
    permissionComponent.value.fallbackOrientation(event, tiltAmount, rotation)
  } else {
    // キーボード入力で傾きをシミュレートする
    switch (event.key) {
      case 'ArrowRight':
        rotation.value.gamma = Math.min(90, rotation.value.gamma + tiltAmount)
        break
      case 'ArrowLeft':
        rotation.value.gamma = Math.max(-90, rotation.value.gamma - tiltAmount)
        break
      case 'ArrowUp':
        rotation.value.beta = Math.max(-90, rotation.value.beta - tiltAmount)
        break
      case 'ArrowDown':
        rotation.value.beta = Math.min(90, rotation.value.beta + tiltAmount)
        break
    }
  }

  // XZ平面での値の入れ替え
  if (isPortrait.value) {
    // ポートレート
    const temp = rotation.value.beta
    rotation.value.beta = rotation.value.gamma
    rotation.value.gamma = temp
  } else {
    // ランドスケープ
    const temp = rotation.value.alpha
    rotation.value.alpha = rotation.value.gamma
    rotation.value.gamma = temp
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
  height: 100%;
}
</style>
