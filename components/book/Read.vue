<template>
  <section
    v-visible="{ onVisible: onSlideVisible, onHidden: onSlideHidden, threshold: 0.8 }"
    class="boxes-container"
    ref="main"
  >
    <div class="boad boad01">
      <div class="textline">
        <p v-for="(script, index) in scripts" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
      </div>
      <div class="graphics">
        <TooltipMultiple title="ぼっちだよ" placement="top" :ref="setTooltipRef(0)">
          <img
            src="@/assets/images/labyrinth/unevencircle001.gif"
            alt="sample"
            class="diggle"
            id="charactor001"
            @click="toggleTimeline"
          />
        </TooltipMultiple>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import TooltipMultiple from "@/components/tooltip/BootstrapMultiple.vue";
import gsap from "gsap";
// -----------------------------------------------
// data
const isActive = ref(false);
const props = defineProps<{
  pageIndex: number;
}>();

const scripts = ["はじめまして", "ぼっちだよ！"];
// -----------------------------------------------
// Tooltip
const tooltipRefs = ref<Array<any>>([]); // Array to hold references to tooltip components
const setTooltipRef = (index: number) => (el: any) => {
  tooltipRefs.value[index] = el;
};

const showAllTooltips = () => {
  tooltipRefs.value.forEach((tooltip) => {
    tooltip.show();
  });
};

const hideAllTooltips = () => {
  tooltipRefs.value.forEach((tooltip) => {
    tooltip.hide();
  });
  if (gsapCtx) gsapCtx.revert();
};
// -----------------------------------------------
// Animation
const main = ref<HTMLElement | null>(null);
let gsapCtxTL: gsap.core.Timeline;
let gsapCtx: gsap.Context;

const toggleTimeline = () => {
  gsapCtxTL.reversed(!gsapCtxTL.reversed());
};
const setAnimation = () => {
  if (gsapCtx) gsapCtx.revert();
  if (!main.value) return;
  gsapCtx = gsap.context((self) => {
    const boxes: HTMLElement[] = gsap.utils.toArray(".diggle");
    if (boxes.length > 0) {
      gsapCtxTL = gsap.timeline().to(boxes[0], { x: 100, rotation: 360 }).reverse();
    }
  }, main.value); // <- Scope!
};
// -----------------------------------------------
// Page Visibility
const onSlideVisible = () => {
  isActive.value = true;
  setAnimation();
  toggleTimeline();
};
const onSlideHidden = () => {
  hideAllTooltips();
  if (gsapCtx) gsapCtx.revert(); // <- Easy Cleanup!
  isActive.value = false;
};
// -----------------------------------------------
// LifeCycle
onMounted(() => {
  setAnimation();
});

onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert(); // <- Easy Cleanup!
});

defineExpose({
  toggleTimeline,
  setAnimation,
  hideAllTooltips,
  // onPageIndexChanged,
});
</script>

<style scoped lang="scss">
.boad {
  position: relative;
  background-color: #f0f0f0;
  background-image: url("@/assets/images/labyrinth/texture_01.png");
  background-repeat: repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  user-select: none;
  width: 100%;
  min-height: 100svh;
  margin: 0;
  padding: 0;
  color: black;

  &.boad01 {
    .textline {
      position: absolute;
      left: 10%;
      top: 20%;
      text-align: left;
      white-space: pre-wrap;
      // transform: translateY(-50%);
    }
    .graphics {
      position: absolute;
      right: 15%;
      bottom: 5%;
      #charactor001 {
        width: 40svh;
        height: 40svh;
      }
    }
  }
  p {
    height: fit-content;
    margin: 0 0 1rem 1rem;
    padding: 0;
    &.h1 {
      font-weight: 600;
      font-size: 2.6rem;
    }
  }
}
</style>
