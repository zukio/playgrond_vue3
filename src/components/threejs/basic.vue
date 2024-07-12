<template>
  <div ref="container" class="layer-on-canvas"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import * as THREE from 'three'

const container = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let cube: THREE.Mesh
let animationFrameId: number | null = null

const provider = inject('provider') as {
  context: WebGL2RenderingContext
  canvas: HTMLCanvasElement
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  controls: any | null
  initProvider: () => void
  setOrbitControls: (camera: THREE.PerspectiveCamera) => void
}

//// プロバイダーの初期化チェック
//const initProvider = () => {
//  if (!provider.context || !provider.canvas) {
//    const canvasElement = document.querySelector('canvas') as HTMLCanvasElement
//    if (canvasElement) {
//      provider.canvas = canvasElement
//      provider.context = canvasElement.getContext('webgl2') as WebGL2RenderingContext
//    }
//  }
//}

const init = () => {
  // プロバイダーの初期化を確認
  provider.initProvider()

  // シーンの作成
  scene = new THREE.Scene()

  // カメラの作成
  provider.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  provider.camera.position.z = 5

  // レンダラーの作成
  if (provider.renderer) {
    // provider.renderer.antialias = false
    provider.renderer.setSize(window.innerWidth, window.innerHeight)
    // 環境光を追加
    provider.renderer.setClearColor(0xf0f0f0) // レンダラーの背景色も設定
  }
  provider.setOrbitControls(provider.camera)

  // キューブの作成
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // アニメーションの開始
  animate()
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  // キューブを回転
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01

  if (provider.controls) {
    provider.controls.update()
  }
  if (provider.renderer && provider.camera) {
    provider.renderer.render(scene, provider.camera as THREE.Camera)
  }
}

// リサイズ処理
//const handleResize = () => {
//  if (provider.camera && provider.renderer) {
//    provider.camera.aspect = window.innerWidth / window.innerHeight
//    provider.camera.updateProjectionMatrix()
//    provider.renderer.setSize(window.innerWidth, window.innerHeight)
//  }
//}

onMounted(() => {
  init()
  // window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // window.removeEventListener('resize', handleResize)
  // リソースの解放
  if (provider.renderer) {
    provider.renderer.dispose()
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.layer-on-canvas {
  width: 100%;
  height: 100vh;
}
</style>
