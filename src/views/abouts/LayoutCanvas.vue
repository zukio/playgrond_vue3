<template>
  <div>
    <h2>{{ contentNo }}</h2>
    <Canvas class="canvas-wrapper" :style="{ backgroundColor: `rgba(${contentBackgroud},1)` }">
      <component :is="activeComponent" :contentBackgroud="contentBackgroud"></component>
    </Canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Canvas from '@/components/canvases/CanvasContainer.vue'
import ParticleSvg from '@/components/canvases/particle_svg.vue'
import ParticleShower from '@/components/canvases/particle_shower.vue'
import ParticleGyro from '@/components/canvases/particle_gyro.vue'

const props = defineProps<{
  contentNo: number
  contentBackgroud: string
}>()

const activeComponent = computed(() => {
  const components = [ParticleSvg, ParticleShower, ParticleGyro]
  return components[props.contentNo] || null
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
  z-index: -100;
}
</style>
