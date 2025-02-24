<template>
  <section
    v-visible="{ onVisible: onSlideVisible, onHidden: onSlideHidden, threshold: 0.8 }"
    class="boxes-container"
    ref="main"
  >
    <div class="boad boad02 row">
      <div class="textline col-xl">
        <p v-for="(script, index) in scripts" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
      </div>
      <div class="graphics" @click="toggleTimeline">
        <div id="charactor001">
          <TooltipMultiple title="ぼっちだよ" placement="bottom" :ref="setTooltipRef(0)">
            <img src="@/assets/images/labyrinth/unevencircle001.gif" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div>
        <div id="charactor002">
          <TooltipMultiple title="こっちがまっち" placement="bottom" :ref="setTooltipRef(1)">
            <img src="@/assets/images/labyrinth/unevencircle002.gif" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div>
        <div id="charactor003">
          <TooltipMultiple title="こっちがぱっち" placement="bottom" :ref="setTooltipRef(2)">
            <img src="@/assets/images/labyrinth/unevencircle003.gif" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div>
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

const scripts = ["ぱっちと\nまっちと\nいつもいっしょ", "いったい いつから いっしょに いるんだろう？"];
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
      gsapCtxTL = gsap
        .timeline()
        .to(boxes[0], { x: 100, y: -130, rotation: 360 })
        .to(boxes[1], { x: -100, y: 100, rotation: -360 }, "<")
        .to(boxes[2], { x: -166 }, "<")
        .reverse();
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
  nextTick(() => {
    setAnimation();
  });
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

  &.boad02 {
    .textline {
      position: absolute;
      right: 5%;
      bottom: 10%;
      text-align: right;
      white-space: pre-wrap;
    }
    .graphics {
      position: absolute;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      // align-items: center;
      // left: 3%;
      top: 7%;
      #charactor001 {
        margin-top: 10svh;
        img {
          width: 25svh;
          max-width: calc(1.25 * 25svw);
          height: auto;
        }
      }
      #charactor002 {
        img {
          width: 33svh;
          max-width: calc(1.25 * 33svw);
          height: auto;
        }
      }
      #charactor003 {
        margin-right: 10svh;
        img {
          width: 40svh;
          max-width: 50svw;
          height: auto;
        }
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
