<template>
  <div ref="container"><canvas id="three-canvas" ref="canvas"></canvas></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

const container = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let cube: THREE.Mesh

let physicsWorld: any
let elemBody: any

const init = () => {
  if (!canvas.value) {
    console.error('Canvas element not found')
    return
  }
  // Three.jsの初期化
  scene = new THREE.Scene()
  // カメラの作成
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5
  // レンダラーの作成
  // renderer = new THREE.WebGLRenderer()
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value?.appendChild(renderer.domElement)

  // Cannon.jsの初期化
  physicsWorld = new CANNON.World()
  physicsWorld.gravity.set(0, -9.82, 0)

  // Three.jsのオブジェクト作成
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // Cannon.jsのボディ作成
  const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  elemBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 5, 0),
    shape: shape
  })
  physicsWorld.addBody(elemBody)

  // アニメーションの開始
  animate()
}

const animate = () => {
  requestAnimationFrame(animate)

  // 物理エンジンの更新
  const deltaTime = 1 / 60
  physicsWorld.step(deltaTime)
  cube.position.copy(elemBody.position as any)

  renderer.render(scene, camera)
}

onMounted(() => {
  init()
})
onUnmounted(() => {
  // リソースの解放
  renderer.dispose()
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100vh;
}
</style>
