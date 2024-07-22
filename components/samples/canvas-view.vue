<template>
  <div class="p-0 m-0">
    <CanvasContainer class="p-0 m-0" :flexStyle="activeContainerStyle">
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
import CanvasContainer from "@/components/canvases/CanvasContainer.vue";
import Tutorial from "@/components/book/Tutorial.vue";
import WelcomeAnim from "@/components/canvases/WelcomeAnim.vue";

const props = defineProps({
  contentNo: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
});

// Emitsの定義
const emit = defineEmits(["customEvent"]);

const backgroundColor = (index: number) => {
  const array = ["211, 97, 21", "211, 97, 21", "211, 97, 21"];
  return array[index];
};
const currentIndex = ref(0);
const components = [
  { component: Tutorial, props: { pageIndex: 0 }, ref: null },
  { component: WelcomeAnim, props: { pageIndex: 0 }, ref: null },
];
const activeComponent: any = computed(() => {
  return components[currentIndex.value] || null;
});
const activeContainerStyle = computed(() => {
  let flexStyle: CSSProperties = {
    top: 0,
    left: 0,
    width: "100%",
    height: "100svh",
    // overflow: "hidden",
    zIndex: -1,
  };
  if (currentIndex.value !== 2) {
    //flexStyle.position = "absolute";
  }
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
// -----------------------------------------------
// Lyfe Cycle
onMounted(() => {
  console.log("Mounted: CanvasView");
  currentIndex.value = props.contentNo;
});
onBeforeUnmount(() => {
  // console.log("Unmount: CanvasView");
});
defineExpose({
  currentIndex,
  activeComponent,
  activeSelf,
});
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
