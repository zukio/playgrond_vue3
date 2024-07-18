<template>
  <div class="p-0 m-0">
    <Canvas class="p-0 m-0" :flexStyle="activeContainerStyle">
      <component :is="activeComponent" :pageIndex="writableContentNo"></component>
    </Canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from "vue";
import Canvas from "@/components/canvases/CanvasContainer.vue";
import Basic from "@/components/canvases/BasicAnim.vue";
import WelcomeAnim from "@/components/canvases/WelcomeAnim.vue";

const props = defineProps<{
  // contentNo: number;
  // modelPath: string
  //
}>();
const writableContentNo = ref(0);
const backgroundColor = (index: number) => {
  const array = ["211, 97, 21", "211, 97, 21", "211, 97, 21"];
  return array[index];
};

const activeComponent = computed(() => {
  const components = [Basic, WelcomeAnim];
  return components[writableContentNo.value] || null;
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
  if (writableContentNo.value !== 2) {
    //flexStyle.position = "absolute";
  }
  return flexStyle;
});
onMounted(() => {
  //writableContentNo.value = props.contentNo || 0;
  writableContentNo.value = 0;
});
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
