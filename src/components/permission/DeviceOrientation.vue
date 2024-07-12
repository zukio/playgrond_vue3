<!--
 1. デバイスモーションとオリエンテーションの可用性をチェックします。
 2. iOS デバイスの場合、必要な許可を要求します。
-->
<template>
  <div id="permissionOverlay" ref="permissionOverlay">
    <button
      v-if="!isChecked"
      id="permissionButton"
      @click="requestPermission"
      class="btn btn-primary"
    >
      センサーの使用を許可する
    </button>
    <p v-if="isChecked">
      デバイスオリエンテーション: {{ isDeviceMotionAvailable ? '利用可能' : '利用不可' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'

// Vueで親コンポーネントへクリックイベントをEmitする関数
const emit = defineEmits(['click'])

// iOS 13以降のデバイスに特別な処理が必要なため、iOS 13+特有の requestPermission が定義されているかチェック
interface WindowWithDeviceOrientation extends Window {
  DeviceOrientationEvent: {
    requestPermission?: () => Promise<PermissionState>
  }
}

const isChecked = ref(false)
const isDeviceOrientationAvailable = ref(false)
const isDeviceMotionAvailable = ref(false)
// 画面の向きを確認するための追加処理
const isPortrait = computed((): boolean => {
  return (
    window.screen.orientation?.type.startsWith('portrait') || window.innerWidth < window.innerHeight
  )
})
// `Rotation` インターフェースを追加し、デバイスの向きを追跡します。
interface Rotation {
  alpha: number
  beta: number
  gamma: number
  absolute: boolean
}
// absolute が true の場合は、絶対座標系でのデバイスの向きが取得できる
// absolute が false の場合は、前回の状態からの相対的な変化量が取得できる
// `Acceleration` インターフェースを追加し、デバイスの加速度を追跡します。
interface Acceleration {
  x: number
  y: number
  z: number
}

// クリックイベントを受けてデバイスの許可をリクエスト
async function requestPermission() {
  checkDeviceMotionAvailability()
  await checkDeviceOrientationAvailability()
  isChecked.value = true
  emit('click', isDeviceOrientationAvailable.value, isDeviceMotionAvailable.value)
  // responcedPermission(rotation, acceleration)
}

const checkDeviceOrientationAvailability = async () => {
  const windowWithOrientation = window as WindowWithDeviceOrientation

  // iOS 13+ での許可要求
  if (typeof windowWithOrientation.DeviceOrientationEvent?.requestPermission === 'function') {
    try {
      const permission = await windowWithOrientation.DeviceOrientationEvent.requestPermission()
      if (permission === 'granted') {
        isDeviceMotionAvailable.value = await checkOrientation()
      } else {
        console.warn('DeviceOrientation permission denied')
        isDeviceMotionAvailable.value = false
      }
    } catch (error) {
      console.error('Error requesting DeviceOrientation permission:', error)
      isDeviceMotionAvailable.value = false
    }
  } else {
    // 他のデバイスでの可用性チェック
    isDeviceMotionAvailable.value = await checkOrientation()
  }
}

// 一般的なデバイスオリエンテーションの可用性チェック
const checkOrientation = () => {
  return new Promise<boolean>((resolve) => {
    if ('DeviceOrientationEvent' in window) {
      const timeout = setTimeout(() => {
        window.removeEventListener('deviceorientation', orientationListener)
        console.warn('DeviceOrientation event not fired within timeout')
        resolve(false)
      }, 1000)

      const orientationListener = (event: DeviceOrientationEvent) => {
        clearTimeout(timeout)
        window.removeEventListener('deviceorientation', orientationListener)

        if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
          resolve(true)
        } else {
          console.warn('DeviceOrientation available but not providing data')
          resolve(false)
        }
      }

      window.addEventListener('deviceorientation', orientationListener, { once: true })
    } else {
      console.warn('DeviceOrientation not supported')
      resolve(false)
    }
  }).catch((error) => {
    console.error('Error checking DeviceOrientation availability:', error)
    return false
  })
}

/* デバイスの向きとセンサーの値の関係
 * ポートレート
 * - XYの場合
 *   - alpha: デバイスの水平回転（画面の左右）
 *   - beta: デバイスの前後の傾き（2次元の場合無視できる）
 *   - gamma: デバイスの左右の傾き（画面の上下）
 * - XZの場合
 *   - alpha: デバイスの水平回転（画面の上下）
 *   - beta: デバイスの左右の傾き（2次元の場合無視できる）
 *   - gamma: デバイスの前後の傾き（画面の左右）
 * ランドスケープ
 * - XYの場合
 *   - alpha: デバイスの水平回転（画面の上下）
 *   - beta: デバイスの左右の傾き（2次元の場合無視できる）
 *   - gamma: デバイスの前後の傾き（画面の左右）
 * - XZの場合
 *   - alpha: デバイスの水平回転（画面の左右）
 *   - beta: デバイスの前後の傾き（2次元の場合無視できる）
 *   - gamma: デバイスの左右の傾き（画面の上下）
 * */
const handleOrientation = (event: DeviceOrientationEvent, rotation: Ref<Rotation>) => {
  let alpha, beta, gamma
  if (isPortrait.value) {
    // ポートレート
    alpha = event.alpha || 0
    beta = event.beta || 0
    gamma = event.gamma || 0
  } else {
    // ランドスケープ
    alpha = event.alpha || 0
    beta = event.beta || 0
    gamma = event.gamma || 0

    // Adjust for landscape orientation
    const temp = alpha
    alpha = gamma
    gamma = -temp
  }

  rotation.value = {
    alpha,
    beta,
    gamma,
    absolute: event.absolute || false
  }
}

const fallbackOrientation = (event: KeyboardEvent, tiltAmount: number, rotation: Ref<Rotation>) => {
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

function handleMotion(event: DeviceMotionEvent, acceleration: Ref<Acceleration>) {
  let x, y, z
  if (isPortrait.value) {
    // ポートレート
    x = event.accelerationIncludingGravity?.x || 0
    y = event.accelerationIncludingGravity?.y || 0
    z = event.accelerationIncludingGravity?.z || 0
  } else {
    // ランドスケープ
    x = event.accelerationIncludingGravity?.y || 0
    y = -(event.accelerationIncludingGravity?.x || 0)
    z = event.accelerationIncludingGravity?.z || 0
  }

  acceleration.value = {
    x,
    y,
    z
  }
}

const fallbackMotion = (event: MouseEvent, acceleration: Ref<Acceleration>) => {
  // マウスの動きをシミュレートするなどのフォールバック処理

  const sensitivity = 0.01
  acceleration.value = {
    x: event.movementX * sensitivity,
    y: event.movementY * sensitivity,
    z: 0
  }
}

const checkDeviceMotionAvailability = async () => {
  // DeviceMotionEventが存在する
  if ('DeviceMotionEvent' in window) {
    // 使用可能かチェック
    isDeviceMotionAvailable.value = await checkMotion()
  }
}

const checkMotion = () => {
  return new Promise<boolean>((resolve) => {
    // 実際にデータが取得できるか確認
    const EventVerification = (event: DeviceMotionEvent) => {
      if (
        event.acceleration &&
        (event.acceleration.x !== null ||
          event.acceleration.y !== null ||
          event.acceleration.z !== null)
      ) {
        window.removeEventListener('devicemotion', EventVerification)
        resolve(true)
      } else {
        console.warn('DeviceMotion available but not providing data')
        window.removeEventListener('devicemotion', EventVerification)
        resolve(false)
      }
    }
    try {
      // イベントリスナーを一度だけ実行
      window.addEventListener('devicemotion', EventVerification, { once: true })
    } catch (error) {
      console.error('Error checking DeviceMotion availability:', error)
      resolve(false)
    }
  })
}

defineExpose({
  isChecked,
  isDeviceMotionAvailable,
  isDeviceOrientationAvailable,
  handleOrientation,
  fallbackOrientation,
  handleMotion,
  fallbackMotion,
  requestPermission,
  checkOrientation
})
</script>

<style scoped>
#permissionOverlay {
  position: fixed;
  bottom: 30px;
  right: 0;
  z-index: 100;
  width: 100%;
  /*height: 100%;*/
  display: flex;
  justify-content: center;
  /*align-items: center;*/
}
#permissionButton {
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
}
</style>
