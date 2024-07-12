<template>
  <div class="layer-on-canvas">
    <!--div ref="gameContainer" class="game-container"></div-->
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
import * as CANNON from 'cannon-es'
import type { Rotation } from '@/types/index'
import { isPortrait, handleOrientation, fallbackOrientation } from '@/utils/orientation'
import Permission from '@/components/permission/DeviceOrientation.vue'

const props = defineProps<{
  modelPath: string
}>()

const provider = inject('provider') as {
  context: WebGL2RenderingContext
  canvas: HTMLCanvasElement
  camera: OrthographicCamera | null
  renderer: WebGLRenderer | null
  controls: any | null
  initProvider: () => void
  setOrbitControls: (camera: OrthographicCamera) => void
}
// const gameContainer = ref<HTMLDivElement | null>(null)
const permissionGranted = ref(false)
const permissionComponent = ref<any | null>(null)

let scene: Scene
let ball: Mesh
let labyrinth: Object3D | null = null
let animationFrameId: number | null = null

let world: CANNON.World
let ballBody: CANNON.Body

const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false })

const initPhysics = () => {
  world = new CANNON.World()
  world.gravity.set(0, 0, 0)

  const solver = new CANNON.GSSolver()
  solver.iterations = 10
  world.solver = solver
  world.broadphase = new CANNON.NaiveBroadphase()
}

const initScene = () => {
  scene = new Scene()
  const aspect = window.innerWidth / window.innerHeight
  const frustumSize = 50

  provider.camera = new OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  )
  provider.camera.position.set(0, 0, 50)
  provider.camera.lookAt(0, 0, 0)

  if (provider.renderer) {
    provider.renderer.setSize(window.innerWidth, window.innerHeight)
    provider.renderer.setClearColor(0xf0f0f0) // レンダラーの背景色も設定
  }

  setupLight()
  provider.setOrbitControls(provider.camera)
}

const setupLight = () => {
  //if (!provider.renderer) {
  //  console.error('Renderer is not initialized')
  //  return
  //}
  //provider.renderer.setClearColor(0xf0f0f0) // レンダラーの背景色も設定
  const ambientLight = new AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

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

          let vertices: number[], indices: number[]

          // メッシュがインデックス化されているかどうかを確認
          if (child.geometry.index) {
            // 頂点情報を取得
            vertices = child.geometry.attributes.position.array
            indices = child.geometry.index.array
          } else {
            // メッシュを三角形に変換
            const geometry = child.geometry.toNonIndexed()
            // 頂点情報を取得
            vertices = geometry.attributes.position.array
            //indices = new Uint32Array(vertices.length / 3).map((_, index) => index)
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
  animationFrameId = requestAnimationFrame(animate)

  const deltaTime = 1 / 60
  world.step(deltaTime, 1 / 60, 10)

  updatePhysics()
  if (provider.controls) {
    provider.controls.update()
  }
  if (provider.renderer && provider.camera) {
    provider.renderer.render(scene, provider.camera)
  }
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

const localHandleOrientation = (event: DeviceOrientationEvent) => {
  handleOrientation(event, rotation)

  if (isPortrait()) {
    const temp = rotation.value.beta
    rotation.value.beta = rotation.value.gamma
    rotation.value.gamma = temp
  } else {
    const temp = rotation.value.alpha
    rotation.value.alpha = rotation.value.gamma
    rotation.value.gamma = temp
  }
}

const localFallbackOrientation = (event: KeyboardEvent) => {
  const tiltAmount = 5
  fallbackOrientation(event, tiltAmount, rotation)

  if (isPortrait()) {
    const temp = rotation.value.beta
    rotation.value.beta = rotation.value.gamma
    rotation.value.gamma = temp
  } else {
    const temp = rotation.value.alpha
    rotation.value.alpha = rotation.value.gamma
    rotation.value.gamma = temp
  }
}

const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    window.addEventListener('deviceorientation', localHandleOrientation)
  } else {
    window.addEventListener('keydown', localFallbackOrientation)
  }
  permissionGranted.value = true
  initGame()
}

const initGame = async () => {
  initPhysics()
  initScene()
  await loadLabyrinthAsync()
  createBall()
  animate()
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
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', localHandleOrientation)
  window.removeEventListener('keydown', localFallbackOrientation)

  if (provider.renderer) {
    provider.renderer.dispose()
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100vh;
}
</style>
