<template>
  <div class="p-0 m-0">
    <img src="/images/player/close.png" alt="Close" class="close-btn" @click="sendMessageToParent()" />
    <Carousel :pages="components" ref="carouselRef" @onPageChanged="onPageChanged" />
  </div>
</template>

<script setup lang="ts">
// ===============================================
// Pages: 各コンポーネントを全画面表示で横に並べる（閉じるボタン付）
// ===============================================
import Carousel from "@/components/carousels/SlideBySide.vue";
import Page1 from "@/components/book/Read.vue";
import Page2 from "@/components/book/Read.vue";
import CanvasView from "@/pages/canvas-view.vue";
import ThreeView from "@/pages/three-view.vue"; // Page1とPage2は同じコンポーネントと仮定

onMounted(() => {
  startTour();
  // localSetInterval();
});
onBeforeUnmount(() => {
  // localClearInterval();
});
// -----------------------------------------------
// Carousel Slider
const carouselRef: any = ref(null);
const components = [
  { component: Page1, props: { pageIndex: 0 } },
  { component: Page2, props: { pageIndex: 1 } },
  { component: CanvasView, props: { contentNo: 0 } },
  { component: ThreeView, props: { contentNo: 0 } },
  //{{ component: ThreeView, props: { contentNo: 1 } },
];
const activeIndex = computed(() => {
  return carouselRef?.currentIndex || 0;
});
// -----------------------------------------------
// コンポーネント切り替え(Mount/Unmount)処理
const onPageChanged = (newIndex: number, oldIndex: number) => {
  //for (let i = 0; i < components.length; i++) {
  //  if (i === newIndex) {
  //    components[i].props.isActive = true;
  //  } else {
  //    components[i].props.isActive = false;
  //  }
  //}
  switch (newIndex) {
    case 0:
    case 1:
      setGsapAnimation(newIndex, oldIndex);
      break;
    case 2:
    case 3:
      const newPageInstance = carouselRef.value.pageRefs[newIndex];
      if (newPageInstance && newPageInstance.activeSelf) {
        newPageInstance.activeSelf(true);
      }
      break;
    default:
      break;
  }
  switch (oldIndex) {
    case 0:
    case 1:
      hideAllTooltips(newIndex, oldIndex);
      break;
    default:
      break;
  }
};

const hideAllTooltips = (newIndex: number, oldIndex: number) => {
  if (!carouselRef.value) return;
  const oldPageInstance = carouselRef.value.pageRefs[oldIndex]; // Get the instance of the current page
  if (oldPageInstance && oldPageInstance.hideAllTooltips) {
    oldPageInstance.hideAllTooltips();
  } else {
    console.log("pageInstance is not found");
  }
};

const setGsapAnimation = (newIndex: number, oldIndex: number) => {
  if (!carouselRef.value) return;
  const newPageInstance = carouselRef.value.pageRefs[newIndex];
  if (newPageInstance && newPageInstance.setAnimation) {
    newPageInstance.setAnimation();
  } else {
    console.log("pageInstance is not found");
  }
};

// 親ウィンドウ（iFrame）にメッセージを送信
const sendMessageToParent = () => {
  window.parent.postMessage("iframe", "*");
};
// -----------------------------------------------
// Tour
const { $driver }: any = useNuxtApp();

const startTour = () => {
  const driverObj = $driver({
    popoverClass: "driverjs-theme",
    showButtons: ["next", "close"],
    nextBtnText: "わかった！",
    doneBtnText: "OK!",
    showProgress: false,
    steps: [
      {
        element: ".carousel-control-next-btn",
        popover: { title: "スワイプですすむ", description: "つかいかたのせつめい" },
      },
      {
        element: ".carousel-control-prev-btn",
        popover: { title: "もどるのはこっち", description: "つかいかたのせつめい" },
      },
      {
        element: ".close-btn",
        popover: { title: "ばってんでとじる", description: "つかいかたのせつめい" },
      },
    ],
    onDestroyed: () => {
      const carouselInstance: any = carouselRef.value;
      if (carouselInstance) {
        const page1Instance = carouselInstance.pageRefs[0]; // Get the instance of Page1
        if (page1Instance && page1Instance.toggleTimeline) {
          page1Instance.toggleTimeline();
        } else {
          console.log("page1Instance is not found");
        }
      } else {
        console.log("carouselInstance is not found");
      }
      // 本来の処理を明示的に呼び出す必要がある
      driverObj.destroy();
    },
  });
  // ツアーを開始
  driverObj.drive();
};
</script>

<style scoped>
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0;
  width: 64px;
  height: 64px;
  border: #fff 2px solid;
  border-radius: 50%;
  cursor: pointer;
  z-index: 3;
}
</style>
