// ===============================================
// セッション中のユーザーの情報・状態を保存・管理する
// ===============================================
import { useState } from "nuxt/app";
import type { Permission } from "@/types";

export const useUser = () => {
  const isDeviceOrientationAvailable = useState<Permission>(() => {
    return {
      isChecked: false,
      available: false,
    };
  });
  const isDeviceMotionAvailable = useState<Permission>(() => {
    return {
      isChecked: false,
      available: false,
    };
  });

  // -----------------------------------------------
  // getters
  const getDeviceOrientationAvailable = (): Permission => {
    return isDeviceOrientationAvailable.value;
  };
  const getDeviceMotionAvailable = (): Permission => {
    return isDeviceMotionAvailable.value;
  };
  // -----------------------------------------------
  // Setters
  const setDeviceOrientationAvailable = (status: boolean) => {
    isDeviceOrientationAvailable.value = {
      isChecked: true,
      available: status,
    };
  };
  const setDeviceMotionAvailable = (status: boolean) => {
    isDeviceMotionAvailable.value = {
      isChecked: true,
      available: status,
    };
  };
  // -----------------------------------------------
  return {
    isDeviceOrientationAvailable: readonly(isDeviceOrientationAvailable.value),
    setDeviceOrientationAvailable: setDeviceOrientationAvailable,
    isDeviceMotionAvailable: readonly(isDeviceMotionAvailable.value),
    setDeviceMotionAvailable: setDeviceMotionAvailable,
  };
};
