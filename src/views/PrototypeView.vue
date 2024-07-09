<template>
  <div class="p-0 m-0">
    <ProtoType ref="componentRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
//import Canvas from '@/components/canvases/CanvasContainer.vue'
import ProtoType from '@/components/play/proto.vue?raw'

const componentRef: any = ref(null)
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
