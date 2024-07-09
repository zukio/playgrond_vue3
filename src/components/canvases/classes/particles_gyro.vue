<!--デバイスの実際の物理的な向きに基づいて重力と傾きの効果を計算します。
  - デバイスを回転させても、パーティクルは実際の「下」方向に落下し、傾きに応じて動きます。
  - デバイスによっては、`DeviceOrientationEvent` や `DeviceMotionEvent` が利用できない場合があります。その場合は、適切なフォールバック処理を追加する必要があります。
  - iOS 13以降では、これらのイベントの使用にユーザーの許可が必要です。必要に応じて、許可を求める処理を追加してください。
-->
<template>
  <div ref="particleRef" :style="particleStyle"></div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed } from 'vue'

interface CanvasSize {
  width: number
  height: number
}

interface Rotation {
  alpha: number
  beta: number
  gamma: number
  absolute: boolean
}

interface Acceleration {
  x: number
  y: number
  z: number
}

const props = defineProps<{
  canvas: CanvasSize
  rotation: Rotation
  acceleration: Acceleration
  id: number
}>()

const particleRef = ref<HTMLDivElement | null>(null)

const x = ref(Math.random() * props.canvas.width)
const y = ref(0) // Start from the top
const size = ref(Math.random() * 3 + 2) // Slightly larger particles
const color = ref(`rgba(0, 100, 255, ${Math.random() * 0.5 + 0.25})`)

const gravity = 9.81 // m/s^2
const friction = 0.99
// 傾きの感度を調整できるようにしました。
const tiltSensitivity = 0.05

const particleStyle: any = computed(() => ({
  position: 'absolute',
  width: `${size.value * 2}px`,
  height: `${size.value * 2}px`,
  borderRadius: '50%',
  backgroundColor: color.value
}))

const update = (particles: any[]) => {
  const vx = ref(0)
  const vy = ref(0)
  // 回転角度をラジアンに変換し、正弦関数を使って傾きの力を計算します
  const alphaRad = (props.rotation.alpha * Math.PI) / 180
  const betaRad = (props.rotation.beta * Math.PI) / 180
  const gammaRad = (props.rotation.gamma * Math.PI) / 180

  // デバイスの向きに基づいて重力の成分を計算します：
  const gx = -gravity * Math.sin(betaRad) * Math.sin(gammaRad)
  const gy = -gravity * Math.sin(betaRad) * Math.cos(gammaRad)

  // 重力と加速度を速度に適用します
  vx.value += (gx + props.acceleration.x) * tiltSensitivity * size.value
  vy.value += (gy + props.acceleration.y) * tiltSensitivity * size.value

  // Apply friction
  vx.value *= friction
  vy.value *= friction

  // Update position
  x.value += vx.value
  y.value += vy.value

  // Boundary check
  if (x.value < size.value) {
    x.value = size.value
    vx.value *= -0.5 // Bounce with some energy loss
  } else if (x.value > props.canvas.width - size.value) {
    x.value = props.canvas.width - size.value
    vx.value *= -0.5 // Bounce with some energy loss
  }

  if (y.value < size.value) {
    y.value = size.value
    vy.value *= -0.5 // Bounce with some energy loss
  } else if (y.value > props.canvas.height - size.value) {
    y.value = props.canvas.height - size.value
    vy.value *= -0.5 // Bounce with some energy loss
  }

  // Simple collision detection with other particles
  particles.forEach((otherParticle) => {
    if (otherParticle !== this) {
      const dx = otherParticle.x.value - x.value
      const dy = otherParticle.y.value - y.value
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDist = size.value + otherParticle.size.value

      if (distance < minDist) {
        const angle = Math.atan2(dy, dx)
        const targetX = x.value + Math.cos(angle) * minDist
        const targetY = y.value + Math.sin(angle) * minDist
        const ax = (targetX - otherParticle.x.value) * 0.05
        const ay = (targetY - otherParticle.y.value) * 0.05

        vx.value -= ax
        vy.value -= ay
        otherParticle.vx.value += ax
        otherParticle.vy.value += ay
      }
    }
  })
}

const draw = () => {
  if (particleRef.value) {
    particleRef.value.style.transform = `translate(${x.value}px, ${y.value}px)`
  }
}

defineExpose({
  update,
  draw,
  x,
  y,
  size
})
</script>
