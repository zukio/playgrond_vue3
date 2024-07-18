<template>
  <div class="p-0 m-0">
    <Canvas :flexStyle="activeContainerStyle">
      <component :is="activeComponent" :modelPath="modelPath"></component>
    </Canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from "vue";
import Canvas from "@/components/webGL/WebglContainer.vue";
import Basic from "@/components/webGL/Basic.vue";
import Labyrinth001 from "@/components/webGL/Labyrinth001.vue";
const config = useRuntimeConfig().public;

const props = defineProps<{
  contentNo: number;
  // modelPath: string
}>();
const contentNo = ref(0);
const modelPath = `${config.baseUrl}models/DigitalBook_maze_01_0708.glb`;
// const modelPath = new URL('@/assets/models/labyrinth001.glb', import.meta.url).href

const activeComponent = computed(() => {
  const components = [Labyrinth001, Basic];
  return components[contentNo.value] || null;
});
const activeContainerStyle = computed(() => {
  let innerWidth = "100%";
  let innerHeight = "100%";

  let flexStyle: CSSProperties = {
    width: innerWidth,
    height: innerHeight,
    overflow: "hidden",
  };
  // position固定にするとカメラオービットが効かないのでコメントアウト
  //if (contentNo.value !== 2) {
  //  flexStyle.position = 'absolute'
  //}
  return flexStyle;
});
onMounted(() => {
  contentNo.value = props.contentNo || 0;
});
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.canvas-wrapper {
  position: relative;
}
</style>
