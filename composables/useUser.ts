// ===============================================
// セッション中のユーザーの情報・状態を保存・管理する
// ===============================================
import { useState } from "nuxt/app";
import type { Permission } from "@/types";
interface ReadingState {
  contentId: number;
  currentIndex: number;
}
export const useUser = () => {
  const isDeviceOrientationAvailable = useState<Permission>("userDeviceOrientationAvailable", () => {
    return {
      isChecked: false,
      available: false,
    };
  });
  const isDeviceMotionAvailable = useState<Permission>("userDeviceMotionAvailable", () => {
    return {
      isChecked: false,
      available: false,
    };
  });
  const readingState = useState<ReadingState>("userReadingState", () => ({
    contentId: 0,
    currentIndex: 0,
  }));

  // -----------------------------------------------
  // getters

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
  const setContentId = (id: number) => {
    readingState.value.contentId = id;
  };

  const setCurrentIndex = (index: number) => {
    readingState.value.currentIndex = index;
  };
  // -----------------------------------------------
  return {
    isDeviceOrientationAvailable: readonly(isDeviceOrientationAvailable.value),
    setDeviceOrientationAvailable: setDeviceOrientationAvailable,
    isDeviceMotionAvailable: readonly(isDeviceMotionAvailable.value),
    setDeviceMotionAvailable: setDeviceMotionAvailable,
    readingState: readonly(readingState.value),
    setContentId: setContentId,
    setCurrentIndex: setCurrentIndex,
  };
};
