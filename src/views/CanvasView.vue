<template>
  <div class="p-0 m-0">
    <h2>{{ contentNo }}</h2>
    <Canvas class="canvas-wrapper" :bgColor="getBackgroundColor">
      <component :is="activeComponent" :contentBackgroud="backgroundColor(contentNo)"></component>
    </Canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Canvas from '@/components/canvases/CanvasContainer.vue'
import ParticleSvg from '@/components/canvases/particle_svg.vue'
import ParticleShower from '@/components/canvases/particle_shower.vue'
import ParticleGyro from '@/components/canvases/particle_gyro.vue'

const props = defineProps<{
  // contentNo: number
  // contentBackgroud: string
}>()

const contentNo = ref(0)
const backgroundColor = (index: number) => {
  const array = ['211, 97, 21', '211, 97, 21', '211, 97, 21']
  return array[index]
}
const getBackgroundColor = computed(() => {
  return `rgba(${backgroundColor(contentNo.value)},1)`
})

const activeComponent = computed(() => {
  const components = [ParticleSvg, ParticleShower, ParticleGyro]
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
  z-index: -1;
}
</style>
