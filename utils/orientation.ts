import { type Ref, computed } from "vue";

export const isPortrait = (): boolean => {
  return window.screen.orientation?.type.startsWith("portrait") || window.innerWidth < window.innerHeight;
};

export const defaultOrientationSign = (): number => {
  const angle = window.screen.orientation?.angle || window.orientation || 0;
  if (isPortrait()) {
    return angle === 180 ? -1 : 1;
  } else {
    return angle === -90 || angle === 270 ? -1 : 1;
  }
};

const convertOrientation = (beta: number, gamma: number, angle: number): [number, number] => {
  if (angle === 180) {
    return [-beta, -gamma];
  } else if (angle === 90) {
    return [gamma, -beta];
  } else if (angle === -90 || angle === 270) {
    return [-gamma, beta];
  }
  return [beta, gamma];
};

export const handleOrientation = (event: DeviceOrientationEvent, rotation: Ref<any>) => {
  const alpha = event.alpha || 0;
  let beta = event.beta || 0;
  let gamma = event.gamma || 0;

  const angle = window.screen.orientation?.angle || window.orientation || 0;
  if (isPortrait()) {
    [beta, gamma] = convertOrientation(beta, gamma, angle);
  } else {
    [beta, gamma] = convertOrientation(beta, gamma, angle);
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
  const acc = event.accelerationIncludingGravity;
  if (acc) {
    if (isPortrait()) {
      x = acc.x || 0;
      y = acc.y || 0;
      z = acc.z || 0;
    } else {
      x = acc.y || 0;
      y = -(acc.x || 0);
      z = acc.z || 0;
    }
    acceleration.value = { x, y, z };
  }
};

// alpha: デバイスの縦軸回転（デバイスが自身の垂直軸を中心に回転ドアのように回転する）
// beta: デバイスの前後の傾き（腰軸を中心にフリップする）
// gamma: デバイスの左右の傾き（平面回転）
export const debugOrientation = (event: KeyboardEvent, tiltAmount: number, rotation: Ref<any>) => {
  let { alpha, beta, gamma } = rotation.value;

  switch (event.key) {
    case "ArrowUp":
      beta = Math.max(-90, beta - tiltAmount); // 前に傾ける
      break;
    case "ArrowDown":
      beta = Math.min(90, beta + tiltAmount); // 後ろに傾ける
      break;
    case "ArrowLeft":
      gamma = Math.max(-90, gamma - tiltAmount); // 左に傾ける
      break;
    case "ArrowRight":
      gamma = Math.min(90, gamma + tiltAmount); // 右に傾ける
      break;
  }
  //if (!isPortrait()) {
  //  const temp = beta;
  //  beta = gamma;
  //  gamma = -temp;
  //}

  rotation.value = { alpha: alpha, beta: beta, gamma: gamma, absolute: rotation.value.absolute };
};

export const fallbackMotion = (event: MouseEvent, acceleration: Ref<any>) => {
  const sensitivity = 0.01;
  acceleration.value = {
    x: event.movementX * sensitivity,
    y: event.movementY * sensitivity,
    z: 0,
  };
};
