<template>
  <div class="p-0 m-0">
    <h2>{{ medialistactive.index }}</h2>
    <Canvas class="canvas-wrapper" :bgColor="`rgba(${backgroundColor(0)}, 1)`">
      <ParticleGyro ref="componentRef" :contentBackgroud="backgroundColor(0)" />
    </Canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Canvas from '@/components/canvases/CanvasContainer.vue'
import ParticleGyro from '@/components/canvases/particle_gyro.vue'

const componentRef: any = ref(null)

const medialistactive = ref({
  index: 0,
  head: 'Demos',
  text: 'デバイスのジャイロセンサを使用する例'
})

const backgroundColor = (index: number) => {
  const colorList = ['211, 97, 21', 'darkorange']
  return colorList[index]
}
</script>

<style lang="scss" scoped>
h2 {
  margin: 30px 0 0;
}
.canvas-wrapper {
  // position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: top right / cover repeat-y;
  z-index: -1;
}
</style>
