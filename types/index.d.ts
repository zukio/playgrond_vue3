export interface Rotation {
  alpha: number;
  beta: number;
  gamma: number;
  absolute: boolean;
}

export interface Acceleration {
  x: number;
  y: number;
  z: number;
}

export interface Permission {
  isChecked: boolean;
  available: boolean;
}
