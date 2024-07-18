import { type Ref, computed } from "vue";

export const isPortrait = (): boolean => {
  return window.screen.orientation?.type.startsWith("portrait") || window.innerWidth < window.innerHeight;
};

export const defaultOrientationSign = (): number => {
  // デバイスの向きに基づいて変換
  if (isPortrait()) {
    // ポートレイトモード
    if (window.screen.orientation.angle === 0) {
      // 画面が上を向いている場合
      return 1;
    } else if (window.screen.orientation.angle === 180) {
      // 逆さま
      return -1;
    }
  } else {
    // ランドスケープモード
    if (window.screen.orientation.angle === 90) {
      // 画面が右を向いている場合
      return 1;
    } else if (window.screen.orientation.angle === -90 || window.screen.orientation.angle === 270) {
      // 画面が左を向いている場合
      return -1;
    }
  }
  return 1;
};

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
  const alpha = event.alpha || 0;
  let beta = event.beta || 0;
  let gamma = event.gamma || 0;

  // デバイスの向きに基づいて変換
  if (isPortrait()) {
    // ポートレイトモード
    if (window.screen.orientation.angle === 0) {
      // 画面が上を向いている場合
      // 何も変換しない
    } else if (window.screen.orientation.angle === 180) {
      // 逆さま
      beta = -beta;
      gamma = -gamma;
    }
  } else {
    // ランドスケープモード
    if (window.screen.orientation.angle === 90) {
      // 画面が右を向いている場合
      [beta, gamma] = [gamma, -beta];
    } else if (window.screen.orientation.angle === -90 || window.screen.orientation.angle === 270) {
      // 画面が左を向いている場合
      [beta, gamma] = [-gamma, beta];
    }
  }

  rotation.value = {
    alpha,
    beta,
    gamma,
    absolute: event.absolute || false,
  };

  // console.log('Orientation:', { alpha, beta, gamma }) // デバッグ用出力
};

export const handleMotion = (event: DeviceMotionEvent, acceleration: Ref<any>) => {
  let x, y, z;
  if (isPortrait()) {
    // ポートレート
    x = event.accelerationIncludingGravity?.x || 0;
    y = event.accelerationIncludingGravity?.y || 0;
    z = event.accelerationIncludingGravity?.z || 0;
  } else {
    // ランドスケープ
    x = event.accelerationIncludingGravity?.y || 0;
    y = -(event.accelerationIncludingGravity?.x || 0);
    z = event.accelerationIncludingGravity?.z || 0;
  }

  acceleration.value = {
    x,
    y,
    z,
  };
};

//alpha: デバイスの縦軸回転（デバイスが自身の垂直軸を中心に回転ドアのように回転する）
//beta: デバイスの前後の傾き（腰軸を中心にフリップする）
//gamma: デバイスの左右の傾き（平面回転）
export const debugOrientation = (event: KeyboardEvent, tiltAmount: number, rotation: Ref<any>) => {
  let { alpha, beta, gamma } = rotation.value;

  switch (event.key) {
    case "ArrowUp":
      if (event.ctrlKey) {
        // 前後回転 (beta)
        beta = Math.max(-90, beta - tiltAmount);
      } else {
        // 縦軸回転 (gamma)
        gamma = Math.max(-90, gamma - tiltAmount);
      }
      break;
    case "ArrowDown":
      if (event.ctrlKey) {
        // 前後回転 (beta)
        beta = Math.min(90, beta + tiltAmount);
      } else {
        // 縦軸回転 (gamma)
        gamma = Math.min(90, gamma + tiltAmount);
      }
      break;
    case "ArrowLeft":
      // 平面回転 (alpha)
      alpha = (alpha - tiltAmount) % 360;
      if (alpha < 0) alpha += 360;
      break;
    case "ArrowRight":
      // 平面回転 (alpha)
      alpha = (alpha + tiltAmount) % 360;
      break;
  }

  if (!isPortrait()) {
    const temp = beta;
    beta = gamma;
    gamma = -temp;
  }

  rotation.value = { alpha, beta, gamma, absolute: rotation.value.absolute };

  // console.log('Fallback Orientation:', { alpha, beta, gamma })
};

export const fallbackMotion = (event: MouseEvent, acceleration: Ref<any>) => {
  // マウスの動きをシミュレートするなどのフォールバック処理

  const sensitivity = 0.01;
  acceleration.value = {
    x: event.movementX * sensitivity,
    y: event.movementY * sensitivity,
    z: 0,
  };
};
