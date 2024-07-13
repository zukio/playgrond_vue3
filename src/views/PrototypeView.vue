<template>
  <div class="p-0 m-0">
    <h2>Prototype</h2>
    <Canvas :flexStyle="activeContainerStyle">
      <ProtoType ref="componentRef" :modelPath="modelPath" />
    </Canvas>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'
import Canvas from '@/components/webGL/WebglContainer.vue'
import ProtoType from '@/components/webGL/proto.vue'

const props = defineProps<{
  //
}>()
const modelPath = new URL('@/assets/models/labyrinth001.glb', import.meta.url).href

const componentRef: any = ref(null)
const activeContainerStyle = computed(() => {
  let flexStyle: CSSProperties = {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1
  }
  return flexStyle
})
</script>

<style lang="scss" scoped>
h2 {
  margin: 30px 0 0;
  position: absolute;
  color: #000;
}
</style>
