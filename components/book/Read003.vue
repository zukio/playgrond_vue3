<template>
  <section
    v-visible="{ onVisible: onSlideVisible, onHidden: onSlideHidden, threshold: 0.8 }"
    class="boxes-container"
    ref="main"
  >
    <div class="boad boad01 row">
      <div class="textline col-xl">
        <p v-for="(script, index) in scripts" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
        <button class="btn btn-dark btn-lg mt-3" @click="($event) => emit('customEvent', 'close')">おしまい</button>
      </div>
      <div class="graphics" @click="toggleTimeline">
        <!--div id="charactor001">
          <TooltipMultiple title="ぼっちだよ" placement="bottom" :ref="setTooltipRef(0)">
            <img src="@/assets/images/labyrinth/unevencircle001.gif" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div-->
        <div id="charactor002">
          <TooltipMultiple title="こっちがまっち" placement="bottom" :ref="setTooltipRef(1)">
            <img src="@/assets/images/labyrinth/unevencircle002b.png" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div>
        <div id="charactor003">
          <TooltipMultiple title="こっちがぱっち" placement="bottom" :ref="setTooltipRef(2)">
            <img src="@/assets/images/labyrinth/unevencircle003b.png" alt="sample" class="diggle" />
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

// Emitsの定義
const emit = defineEmits(["customEvent"]);

const scripts = ["ぼっち！こっち、こっち！", "みつかるまで さがしたから であえたんだ\nずっと いっしょにいようね"];
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
        .to(boxes[0], { x: 100, rotation: 360 })
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
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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
      top: 20%;
      text-align: center;
      white-space: pre-wrap;
    }
    .graphics {
      position: absolute;
      right: 5svw;
      bottom: 5%;
      display: flex;
      justify-content: end;
      flex-wrap: wrap;
      #charactor001 {
        width: 40svh;
        height: 40svh;
        animation: rotate 2s linear infinite; // 2秒間で1回転、無限に繰り返し
      }
      #charactor002 {
        img {
          width: 20svh;
          max-width: calc(1.25 * 20svw);
          height: auto;
          animation: rotate 3s ease-in-out infinite; // 3秒間で1回転、イーズイン・アウト、無限に繰り返し
        }
      }
      #charactor003 {
        img {
          width: 26svh;
          max-width: calc(1.35 * 20svw);
          height: auto;
          animation: rotate 4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite; // 4秒間で1回転、カスタムイージング、無限に繰り返し
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
