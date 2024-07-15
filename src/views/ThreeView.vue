<template>
  <div class="p-0 m-0">
    <Canvas :flexStyle="activeContainerStyle">
      <component :is="activeComponent" :modelPath="modelPath"></component>
    </Canvas>
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
import Labyrinth2 from '@/components/webGL/modelSyncImage.vue'

const props = defineProps<{
  // contentNo: number
  // modelPath: string
}>()
const contentNo = ref(5)
const modelPath = `${import.meta.env.BASE_URL}models/DigitalBook_maze_01_0708.glb`
// const modelPath = new URL('@/assets/models/labyrinth001.glb', import.meta.url).href

const activeComponent = computed(() => {
  const components = [Basic, Loadmodel, GyroTest, CollisionTest, Labyrinth, Labyrinth2]
  return components[contentNo.value] || null
})
const activeContainerStyle = computed(() => {
  let innerWidth = '100%'
  let innerHeight = '100%'
  const headeElem: HTMLElement | null = document.getElementsByTagName('header')[0]
  if (headeElem) {
    // canvasのpositionを固定するとカメラオービットが効かないのでヘッダーを固定
    // headeElem.style.position = 'absolute'
    if (headeElem.clientWidth < headeElem.clientHeight) {
      innerWidth = window.innerWidth - headeElem.clientWidth + 'px'
    } else {
      innerHeight = window.innerHeight - headeElem.clientHeight + 'px'
    }
  }
  let flexStyle: CSSProperties = {
    width: innerWidth,
    height: innerHeight,
    overflow: 'hidden'
  }
  // position固定にするとカメラオービットが効かないのでコメントアウト
  //if (contentNo.value !== 2) {
  //  flexStyle.position = 'absolute'
  //}
  return flexStyle
})
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.canvas-wrapper {
  position: relative;
}
</style>
