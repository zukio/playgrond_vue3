import { type Ref, computed } from 'vue'

export const isPortrait = (): boolean => {
  return (
    window.screen.orientation?.type.startsWith('portrait') || window.innerWidth < window.innerHeight
  )
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
export const handleOrientation = (event: DeviceOrientationEvent, rotation: Ref<any>) => {
  let alpha, beta, gamma
  if (isPortrait()) {
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

export const handleMotion = (event: DeviceMotionEvent, acceleration: Ref<any>) => {
  let x, y, z
  if (isPortrait()) {
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

export const fallbackOrientation = (
  event: KeyboardEvent,
  tiltAmount: number,
  rotation: Ref<any>
) => {
  if (isPortrait()) {
    switch (event.key) {
      case 'ArrowUp':
        rotation.value.beta = Math.max(-90, rotation.value.beta - tiltAmount)
        break
      case 'ArrowDown':
        rotation.value.beta = Math.min(90, rotation.value.beta + tiltAmount)
        break
      case 'ArrowLeft':
        rotation.value.gamma = Math.max(-90, rotation.value.gamma - tiltAmount)
        break
      case 'ArrowRight':
        rotation.value.gamma = Math.min(90, rotation.value.gamma + tiltAmount)
        break
    }
  } else {
    switch (event.key) {
      case 'ArrowUp':
        rotation.value.beta = Math.max(-90, rotation.value.beta - tiltAmount)
        break
      case 'ArrowDown':
        rotation.value.beta = Math.min(90, rotation.value.beta + tiltAmount)
        break
      case 'ArrowLeft':
        rotation.value.gamma = Math.max(-90, rotation.value.gamma - tiltAmount)
        break
      case 'ArrowRight':
        rotation.value.gamma = Math.min(90, rotation.value.gamma + tiltAmount)
        break
    }
  }

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

export const fallbackMotion = (event: MouseEvent, acceleration: Ref<any>) => {
  // マウスの動きをシミュレートするなどのフォールバック処理

  const sensitivity = 0.01
  acceleration.value = {
    x: event.movementX * sensitivity,
    y: event.movementY * sensitivity,
    z: 0
  }
}
