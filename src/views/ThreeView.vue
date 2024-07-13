<template>
  <div class="p-0 m-0">
    <Canvas :flexStyle="activeContainerStyle">
      <component :is="activeComponent" :modelPath="modelPath"></component>
    </Canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import Canvas from '@/components/webGL/WebglContainer.vue'
import Basic from '@/components/webGL/basic.vue'
import Loadmodel from '@/components/webGL/loadmodel.vue'
import GyroTest from '@/components/webGL/gyro.vue'
import CollisionTest from '@/components/webGL/collision.vue'
import Labyrinth from '@/components/webGL/prototype.vue'

const props = defineProps<{
  // contentNo: number
  // modelPath: string
}>()
const contentNo = ref(4)
const modelPath = `${import.meta.env.BASE_URL}models/labyrinth001.glb`
// const modelPath = new URL('@/assets/models/labyrinth001.glb', import.meta.url).href

const activeComponent = computed(() => {
  const components = [Basic, Loadmodel, GyroTest, CollisionTest, Labyrinth]
  return components[contentNo.value] || null
})
const activeContainerStyle = computed(() => {
  let flexStyle: CSSProperties = {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: -1
  }
  // position固定にするとカメラオービットが効かないのでコメントアウト
  //if (contentNo.value !== 2) {
  //  flexStyle.position = 'absolute'
  //}
  return flexStyle
})
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h2 {
  margin: 30px 0 0;
}
</style>
