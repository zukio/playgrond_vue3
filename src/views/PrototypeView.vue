<template>
  <div class="p-0 m-0">
    <ProtoType ref="componentRef" :modelPath="modelPath" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
//import Canvas from '@/components/canvases/CanvasContainer.vue'
import ProtoType from '@/components/threejs/proto.vue'

const componentRef: any = ref(null)
const modelPath = '/models/labyrinth001.glb'
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
