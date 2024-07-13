<template>
  <div class="p-0 m-0">
    <h2>{{ contentNo }}</h2>
    <Canvas :flexStyle="activeContainerStyle">
      <component
        :is="activeComponent"
        :contentBackgroud="activeContainerStyle.backgroundColor ?? ''"
      ></component>
    </Canvas>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
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

const activeComponent = computed(() => {
  const components = [ParticleSvg, ParticleShower, ParticleGyro]
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
  if (contentNo.value !== 2) {
    flexStyle.position = 'absolute'
  }
  if (backgroundColor(contentNo.value)) {
    flexStyle.backgroundColor = `rgba(${backgroundColor(contentNo.value)},1)`
  }
  return flexStyle
})
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h2 {
  margin: 30px 0 0;
}
</style>
