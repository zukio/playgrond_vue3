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
const modelPath = new URL('@/assets/models/DigitalBook_maze_01_0708.glb', import.meta.url).href

const componentRef: any = ref(null)
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

<style lang="scss" scoped>
h2 {
  margin: 30px 0 0;
  position: absolute;
  color: #000;
}
</style>
