<template>
  <div class="p-0 m-0">
    <CanvasContainer :flexStyle="activeContainerStyle">
      <component
        :is="activeComponent.component"
        v-bind="activeComponent.props"
        :ref="(el: any) => (components[currentIndex].ref = el)"
      ></component>
    </CanvasContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from "vue";
import CanvasContainer from "@/components/webGL/WebglContainer.vue";
import Basic from "@/components/webGL/Basic.vue";
import Labyrinth001 from "@/components/webGL/Labyrinth001.vue";
const config = useRuntimeConfig();

const props = defineProps({
  contentNo: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
});
const currentIndex = ref(0);
const modelPath = `${config.public.baseUrl}models/DigitalBook_maze_01_0708.glb`;

const components = [
  { component: Basic, props: { modelPath: modelPath }, ref: null as any },
  { component: Labyrinth001, props: { modelPath: modelPath }, ref: null as any },
];
const activeComponent = computed(() => {
  return components[currentIndex.value] || null;
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
// -----------------------------------------------
// コンポーネント切り替え(Mount/Unmount)処理
const activeSelf = (activate: boolean) => {
  if (activeComponent.value && activeComponent.value.ref && activeComponent.value.ref.activeSelf) {
    activeComponent.value.ref.activeSelf(activate);
  }
};
onMounted(() => {
  console.log("Mounted: ThreeView");
  // currentIndex.value = props.contentNo || 0;
});
defineExpose({
  activeSelf,
});
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.canvas-wrapper {
  position: relative;
}
</style>
