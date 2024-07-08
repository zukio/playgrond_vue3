<template>
  <div id="permissionOverlay" ref="permissionOverlay">
    <button id="permissionButton" @click="requestOrientationPermission" class="btn btn-primary">
      センサーの使用を許可する
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineEmits } from 'vue'

// Vueで親コンポーネントへクリックイベントをEmitする関数
const emit = defineEmits(['click'])

const permissionOverlayRef = ref<HTMLDivElement | null>(null)

// DeviceOrientationEvent に requestPermission メソッドを追加する型定義
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

// window に DeviceOrie を追加
interface WindowWithDeviceOrientation extends Window {
  DeviceOrientationEvent: {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
}

function requestOrientationPermission() {
  const windowWithDeviceOrientation = window as WindowWithDeviceOrientation

  if (
    typeof windowWithDeviceOrientation.DeviceOrientationEvent !== 'undefined' &&
    typeof windowWithDeviceOrientation.DeviceOrientationEvent.requestPermission === 'function'
  ) {
    windowWithDeviceOrientation.DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === 'granted') {
          // window.addEventListener('deviceorientation', updateRotation)
          if (permissionOverlayRef.value !== null) {
            permissionOverlayRef.value.style.display = 'none'
          }
          //initializeParticles()
          //animate()
          emit('click')
        } else {
          alert('センサーの使用が許可されませんでした。')
        }
      })
      .catch(console.error)
  } else {
    // 許可が必要ないデバイスやブラウザの場合
    // window.addEventListener('deviceorientation', updateRotation)
    if (permissionOverlayRef.value) {
      permissionOverlayRef.value.style.display = 'none'
    }
    emit('click')
    //initializeParticles()
    //animate()
  }
}
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
