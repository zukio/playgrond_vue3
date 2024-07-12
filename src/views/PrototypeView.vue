<template>
  <div class="p-0 m-0">
    <ProtoType ref="componentRef" :modelPath="modelPath" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProtoType from '@/components/threejs/prototype.vue'

const modelPath = new URL('@/assets/models/labyrinth001.glb', import.meta.url).href

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
