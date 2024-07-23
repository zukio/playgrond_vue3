<template>
  <div class="p-0 m-0">
    <CanvasContainer :flexStyle="activeContainerStyle">
      <component
        :is="activeComponent.component"
        v-bind="activeComponent.props"
        :ref="(el: any) => (components[currentIndex].ref = el)"
        @custom-event="handleCustomEvent"
      ></component>
    </CanvasContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from "vue";
import CanvasContainer from "@/components/webGL/WebglContainer.vue";
import Labyrinth from "@/components/book/Labyrinth001.vue";

const props = defineProps({
  contentNo: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
});

// Emitsの定義
const emit = defineEmits(["customEvent"]);

const currentIndex = ref(0);

const components = [
  {
    component: Labyrinth,
    props: {
      modelNo: 1,
      ballSize: 16,
      ballPosition: { x: -10, y: 0, z: 0 },
      wallPosition: { x: 1, y: 0.3, z: -0.1 },
      goalPosition: { x: 8, y: -0.5, z: 0 },
    },
    ref: null as any,
  },

  {
    component: Labyrinth,
    props: {
      modelNo: 2,
      ballSize: 12,
      ballPosition: { x: -10, y: 0, z: 0 },
      wallPosition: { x: 0.5, y: -0.2, z: -0.1 },
      goalPosition: { x: 8, y: -0.5, z: 0 },
    },
    ref: null as any,
  },
  {
    component: Labyrinth,
    props: {
      modelNo: 3,
      ballSize: 0.5,
      ballPosition: { x: -7, y: 0, z: 0 },
      wallPosition: { x: 0.2, y: 0.2, z: -0.1 },
      goalPosition: { x: 8, y: -0.5, z: 0 },
    },
    ref: null as any,
  },
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
const handleCustomEvent = (eventData: any) => {
  emit("customEvent", eventData);
};
const activeSelf = (activate: boolean) => {
  if (activeComponent.value && activeComponent.value.ref && activeComponent.value.ref.activeSelf) {
    activeComponent.value.ref.activeSelf(activate);
  }
};
onMounted(() => {
  console.log("Mounted: ThreeView");
  currentIndex.value = props.contentNo || 0;
});
onBeforeUnmount(() => {
  // console.log("Unmount: CanvasView");
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
