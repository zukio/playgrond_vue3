<template>
  <div class="p-0 m-0">
    <h2>{{ contentNo }}</h2>
    <Canvas class="canvas-wrapper">
      <component :is="activeComponent" :modelPath="modelPath"></component>
    </Canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Canvas from '@/components/threejs/WebglContainer.vue'
import Basic from '@/components/threejs/basic.vue'
import Loadmodel from '@/components/threejs/loadmodel.vue'
import GyroTest from '@/components/threejs/gyro.vue'
import CollisionTest from '@/components/threejs/collision.vue'
import Labyrinth from '@/components/threejs/proto.vue'

const props = defineProps<{
  // contentNo: number
  // modelPath: string
}>()
const contentNo = ref(4)
const modelPath = '/models/labyrinth001.glb'

const activeComponent = computed(() => {
  const components = [Basic, Loadmodel, GyroTest, CollisionTest, Labyrinth]
  return components[contentNo.value] || null
})
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h2 {
  margin: 30px 0 0;
}
.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: top right / cover repeat-y;
  z-index: 1;
}
</style>
