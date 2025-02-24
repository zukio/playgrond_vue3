<template>
  <div class="p-0 m-0">
    <img src="/images/player/close.png" alt="Close" class="close-btn" @click="sendMessageToParent()" />
    <Carousel :pages="components" ref="carouselRef" @onPageChanged="onPageChanged" @customEvent="handleCustomEvent" />
  </div>
</template>

<script setup lang="ts">
// ===============================================
// Pages: 各コンポーネントを全画面表示で横に並べる（閉じるボタン付）
// ===============================================
import Carousel from "@/components/carousels/SlideBySide.vue";
import Page1 from "@/components/book/Read.vue";
import Page2 from "@/components/book/Read002.vue";
import Page3 from "@/components/book/Read003.vue";
import CanvasView from "@/components/samples/canvas-view.vue";
import ThreeView from "@/components/samples/three-view.vue"; // Page1とPage2は同じコンポーネントと仮定

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
  { component: ThreeView, props: { contentNo: 1 } },
  { component: CanvasView, props: { contentNo: 1 } },
];
const currentIndex = computed(() => {
  return useUser().readingState.currentIndex;
});
// -----------------------------------------------
// コンポーネント切り替え(Mount/Unmount)処理
const handleCustomEvent = (eventData: any) => {
  console.log("Custom event received in parent:", currentIndex.value, eventData);
  // ここでイベントデータを処理します
  switch (eventData.type) {
    case "next":
      if (currentIndex.value < components.length - 1) {
        carouselRef.value.moveNext();
      }
      break;
    case "prev":
      if (currentIndex.value > 0) {
        carouselRef.value.movePrev();
      }
      break;
    case "close":
      console.log("close");
      sendMessageToParent();
      break;
    default:
      break;
  }
};
const onPageChanged = (newIndex: number, oldIndex: number) => {
  // ツアー中なら次のステップへ
  if (tourDriver) tourDriver.moveNext();
  // 表示中のコンポーネントに連絡
  const newPageInstance = carouselRef.value.pageRefs[newIndex];
  if (newPageInstance && newPageInstance.activeSelf) {
    newPageInstance.activeSelf(true);
  }
};

// 親ウィンドウ（iFrame）にメッセージを送信
const sendMessageToParent = () => {
  window.parent.postMessage("iframe", "*");
};
// -----------------------------------------------
// Tour
const { $driver }: any = useNuxtApp();
let tourDriver: any = null;
const startTour = () => {
  tourDriver = $driver({
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
      tourDriver.destroy();
    },
  });
  // ツアーを開始
  tourDriver.drive();
};
</script>

<style scoped lang="scss">
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
  z-index: 11; // モーダルより上
}
</style>
