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

  console.log('Orientation:', { alpha, beta, gamma }) // デバッグ用出力
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
        if (event.ctrlKey) {
          // 前後回転 (beta)
          rotation.value.beta = Math.max(-90, rotation.value.beta - tiltAmount)
        } else {
          // 縦回転 (gamma)
          rotation.value.gamma = Math.max(-90, rotation.value.gamma - tiltAmount)
        }
        break
      case 'ArrowDown':
        if (event.ctrlKey) {
          // 前後回転 (beta)
          rotation.value.beta = Math.min(90, rotation.value.beta + tiltAmount)
        } else {
          // 縦回転 (gamma)
          rotation.value.gamma = Math.min(90, rotation.value.gamma + tiltAmount)
        }
        break
      case 'ArrowLeft':
        // 横回転 (alpha)
        rotation.value.alpha = (rotation.value.alpha - tiltAmount) % 360
        if (rotation.value.alpha < 0) rotation.value.alpha += 360
        break
      case 'ArrowRight':
        // 横回転 (alpha)
        rotation.value.alpha = (rotation.value.alpha + tiltAmount) % 360
        break
    }
  } else {
    switch (event.key) {
      case 'ArrowUp':
        if (event.ctrlKey) {
          // 前後回転 (beta)
          rotation.value.beta = Math.max(-90, rotation.value.beta - tiltAmount)
        } else {
          // 縦回転 (gamma)
          rotation.value.gamma = Math.max(-90, rotation.value.gamma - tiltAmount)
        }
        break
      case 'ArrowDown':
        if (event.ctrlKey) {
          // 前後回転 (beta)
          rotation.value.beta = Math.min(90, rotation.value.beta + tiltAmount)
        } else {
          // 縦回転 (gamma)
          rotation.value.gamma = Math.min(90, rotation.value.gamma + tiltAmount)
        }
        break
      case 'ArrowLeft':
        // 横回転 (alpha)
        rotation.value.alpha = (rotation.value.alpha - tiltAmount) % 360
        if (rotation.value.alpha < 0) rotation.value.alpha += 360
        break
      case 'ArrowRight':
        // 横回転 (alpha)
        rotation.value.alpha = (rotation.value.alpha + tiltAmount) % 360
        break
    }
  }

  //alpha: デバイスの水平回転（デバイスが自身の垂直軸を中心に回転ドアのように回転する）
  //beta: デバイスの前後の傾き（腰軸を中心にフリップする）
  //gamma: デバイスの左右の傾き
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
