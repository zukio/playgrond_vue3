<!--
 1. デバイスモーションとオリエンテーションの可用性をチェックします。
 2. iOS デバイスの場合、必要な許可を要求します。
-->
<template>
  <div id="permissionOverlay" ref="permissionOverlay">
    <button v-if="!isChecked" id="permissionButton" @click="requestPermission" class="btn btn-primary">
      センサーの使用を許可する
    </button>
    <p v-if="isChecked">デバイスオリエンテーション: {{ isDeviceOrientationAvailable ? "利用可能" : "利用不可" }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from "vue";
//import type { Permission } from "@/types";

// Vueで親コンポーネントへクリックイベントをEmitする関数
const emit = defineEmits(["click"]);

// iOS 13以降のデバイスに特別な処理が必要なため、iOS 13+特有の requestPermission が定義されているかチェック
interface WindowWithDeviceOrientation extends Window {
  DeviceOrientationEvent: {
    requestPermission?: () => Promise<PermissionState>;
  };
}

const isChecked = computed(() => useUser().isDeviceOrientationAvailable.isChecked);
const isDeviceOrientationAvailable = computed(() => useUser().isDeviceOrientationAvailable.available);
const isDeviceMotionAvailable = computed(() => useUser().isDeviceMotionAvailable.available);

// クリックイベントを受けてデバイスの許可をリクエスト
async function requestPermission() {
  checkDeviceMotionAvailability();
  await checkDeviceOrientationAvailability();
  emit("click", useUser().isDeviceOrientationAvailable, useUser().isDeviceMotionAvailable);
  // responcedPermission(rotation, acceleration)
}

const checkDeviceOrientationAvailability = async (): Promise<boolean> => {
  const windowWithOrientation = window as WindowWithDeviceOrientation;

  // iOS 13+ での許可要求
  if (typeof windowWithOrientation.DeviceOrientationEvent?.requestPermission === "function") {
    try {
      const permission = await windowWithOrientation.DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        useUser().setDeviceOrientationAvailable(await checkOrientation());
      } else {
        console.warn("DeviceOrientation permission denied");
        useUser().setDeviceOrientationAvailable(false);
      }
    } catch (error) {
      console.error("Error requesting DeviceOrientation permission:", error);
      useUser().setDeviceOrientationAvailable(false);
    }
  } else {
    // 他のデバイスでの可用性チェック
    useUser().setDeviceOrientationAvailable(await checkOrientation());
  }
  return useUser().isDeviceOrientationAvailable.available;
};

// 一般的なデバイスオリエンテーションの可用性チェック
const checkOrientation = () => {
  return new Promise<boolean>((resolve) => {
    if ("DeviceOrientationEvent" in window) {
      let timeout: NodeJS.Timeout | number = setTimeout(() => {
        if ((timeout as number) > 0) {
          clearTimeout(timeout);
          timeout = -1;
          window.removeEventListener("deviceorientation", orientationListener);
          console.warn("DeviceOrientation event not fired within timeout");
          resolve(false);
        }
      }, 1000);

      const orientationListener = (event: DeviceOrientationEvent) => {
        clearTimeout(timeout);
        timeout = -1;
        window.removeEventListener("deviceorientation", orientationListener);

        if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
          resolve(true);
        } else {
          console.warn("DeviceOrientation available but not providing data");
          resolve(false);
        }
      };

      window.addEventListener("deviceorientation", orientationListener, { once: true });
    } else {
      console.warn("DeviceOrientation not supported");
      resolve(false);
    }
  });
};

const checkDeviceMotionAvailability = async () => {
  // DeviceMotionEventが存在する
  if ("DeviceMotionEvent" in window) {
    // 使用可能かチェック
    useUser().setDeviceMotionAvailable(await checkMotion());
  } else {
    console.warn("DeviceMotion not supported");
    useUser().setDeviceMotionAvailable(false);
  }
  return useUser().isDeviceMotionAvailable.available;
};

const checkMotion = () => {
  return new Promise<boolean>((resolve) => {
    // 実際にデータが取得できるか確認
    const EventVerification = (event: DeviceMotionEvent) => {
      if (
        event.acceleration &&
        (event.acceleration.x !== null || event.acceleration.y !== null || event.acceleration.z !== null)
      ) {
        window.removeEventListener("devicemotion", EventVerification);
        resolve(true);
      } else {
        console.warn("DeviceMotion available but not providing data");
        window.removeEventListener("devicemotion", EventVerification);
        resolve(false);
      }
    };
    try {
      // イベントリスナーを一度だけ実行
      window.addEventListener("devicemotion", EventVerification, { once: true });
    } catch (error) {
      console.error("Error checking DeviceMotion availability:", error);
      resolve(false);
    }
  });
};

defineExpose({
  isDeviceMotionAvailable,
  isDeviceOrientationAvailable,
  requestPermission,
  checkDeviceOrientationAvailability,
});
</script>

<style scoped>
#permissionOverlay {
  position: absolute;
  bottom: 30px;
  right: 0;
  z-index: 1000;
  width: 100%;
  max-width: 100svw;
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
