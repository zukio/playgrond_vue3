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
/* この衝突判定方法は簡易的なものです。より精密な判定が必要な場合は、物理エンジン（例：Ammo.js）の使用を検討してください。
1. `walls` 配列を追加して、迷路の壁のメッシュを保存します。
2. `loadLabyrinthAsync` 関数内で、迷路のメッシュをトラバースし、名前に "Wall" が含まれるメッシュを壁として `walls` 配列に追加します。
3. `checkCollision` 関数を新たに追加し、ボールと壁の衝突判定を行います。この関数では、ボールの周囲6方向にレイを飛ばし、壁との交差を確認します。
4. 衝突が検出された場合、ボールの速度を壁の法線方向に反射させ、めり込みを解消します。
5. `animate` 関数内で `checkCollision` を呼び出し、毎フレーム衝突判定を行います。
*/
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
  HemisphereLight,
  Raycaster
  // PlaneGeometry
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Permission from '@/components/permission/DeviceOrientation.vue'

const props = defineProps<{
  modelPath: string
}>()
const ballRadius = 0.05 // ボールの半径を定数として定義
const boundaryRadius = 2 // 全体的な境界の半径

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

// コライダー
let walls: Mesh[] = []
const raycaster = new Raycaster()

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

  renderer.render(scene, camera)
}
//const animate = () => {
//  requestAnimationFrame(animate)

//  if (ball && labyrinth) {
//    const gravityStrength = 9.8
//    const tiltX = MathUtils.degToRad(rotation.value.beta)
//    const tiltZ = MathUtils.degToRad(rotation.value.gamma)
//    gravity.set(
//      -Math.sin(tiltZ) * gravityStrength,
//      -Math.cos(tiltX) * gravityStrength,
//      Math.sin(tiltX) * gravityStrength
//    )

//    ballVelocity.add(gravity.clone().multiplyScalar(0.016))
//    ball.position.add(ballVelocity.clone().multiplyScalar(0.016))

//    checkCollisionSimple()
//    checkCollisionWithWalls()
//  }

//  renderer.render(scene, camera)
//}

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
