<template>
  <div div ref="layerContainer" class="layer-on-canvas">
    <div class="boad boad01" v-if="props.pageIndex == 0">
      <div class="textline">
        <p v-for="(script, index) in scripts[props.pageIndex ?? 0]" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
      </div>
      <div class="graphics">
        <img src="/images/unevencircle001.png" alt="sample" class="diggle" id="charactor001" ref="test" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject, watch, defineProps, onUnmounted } from "vue";
import { debounce } from "@/utils";

const provider = inject("provider") as {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
};

const props = defineProps<{
  pageIndex: number;
}>();

const scripts = [
  ["line1", "line2"],
  ["line1", "line2"],
];
let requestId: number | null = null;
const layerContainer = ref<HTMLElement | null>(null);
const test = ref<HTMLElement | null>(null);
let img: HTMLImageElement | null = null;
const imgRect = ref<{ left: number; top: number; right: number; bottom: number }>({
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
});
const mouse = ref({ x: 0, y: 0 });
const isDragging = ref<boolean>(false);

const calculateImageSize = (sample: HTMLImageElement): { width: number; height: number } => {
  // 画面の短かい方の長さを取得
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  // 画像のアスペクト比
  const aspectRatio = sample.width / sample.height;
  // 画像の長い方を画面の短い方の長さの0.3倍にする
  if (sample.width > sample.height) {
    return {
      width: minDimension * 0.3,
      height: (minDimension * 0.3) / aspectRatio,
    };
  } else {
    return {
      width: minDimension * 0.3 * aspectRatio,
      height: minDimension * 0.3,
    };
  }
};

const onMouseDown = (evt: MouseEvent | TouchEvent) => {
  if (!img || !provider) return;
  const isMouseEvent = evt instanceof MouseEvent;
  const x = isMouseEvent ? (evt as MouseEvent).clientX : (evt as TouchEvent).touches[0].clientX;
  const y = isMouseEvent ? (evt as MouseEvent).clientY : (evt as TouchEvent).touches[0].clientY;
  if (x >= imgRect.value.left && x <= imgRect.value.right && y >= imgRect.value.top && y <= imgRect.value.bottom) {
    isDragging.value = true;
    startAnimation();
  }
};
const onMouseUp = () => {
  isDragging.value = false;
  stopAnimation();
};

const onMousemove = (evt: MouseEvent | TouchEvent) => {
  if (!isDragging.value) {
    return;
  }
  const isMouseEvent = evt instanceof MouseEvent;
  const x = isMouseEvent ? evt.clientX : (evt as TouchEvent).touches[0].clientX;
  const y = isMouseEvent ? evt.clientY : (evt as TouchEvent).touches[0].clientY;

  mouse.value = { x, y };
};

const startAnimation = () => {
  if (requestId === null) {
    animate();
  }
};

const stopAnimation = () => {
  if (requestId !== null) {
    cancelAnimationFrame(requestId);
    requestId = null;
  }
};

const animate = () => {
  if (!provider || !provider.canvas || !provider.context) {
    console.error("Canvas provider is not available");
    return;
  }
  if (img) {
    const canvas = provider.canvas;
    const ctx = provider.context;
    const imageSize = calculateImageSize(img);
    imgRect.value = {
      left: mouse.value.x - imageSize.width / 2,
      top: mouse.value.y - imageSize.height / 2,
      right: mouse.value.x + imageSize.width / 2,
      bottom: mouse.value.y + imageSize.height / 2,
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      mouse.value.x - imageSize.width / 2,
      mouse.value.y - imageSize.height / 2,
      imageSize.width,
      imageSize.height
    );
  }
  requestId = requestAnimationFrame(animate);
};

const loadImage = () => {
  console.log("loadImage");
  if (!provider || !provider.canvas || !provider.context) {
    console.error("Canvas provider is not available");
    return;
  }

  img = new Image();
  img.src = "/images/unevencircle001.png";

  img.onload = function () {
    if (!img) return;
    const canvas = provider.canvas;
    const ctx = provider.context;

    const x = (canvas.width - img.width) / 2;
    const y = (canvas.height - img.height) / 2;
    const imageSize = calculateImageSize(img);
    // 初期化
    imgRect.value = {
      left: x,
      top: y,
      right: x + imageSize.width,
      bottom: y + imageSize.height,
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, imageSize.width, imageSize.height);

    //ctx.font = "20px Arial";
    //ctx.fillStyle = "white";
    //ctx.fillText("My Canvas Image", 10, 30);

    // アニメーション関数の呼び出し
    // animate();
  };

  img.onerror = function () {
    console.error("画像の読み込みに失敗しました。");
    if (provider && provider.context) {
      const ctx = provider.context;
      ctx.clearRect(0, 0, provider.canvas.width, provider.canvas.height);
      ctx.font = "20px Arial";
      ctx.fillStyle = "red";
      ctx.fillText("画像の読み込みに失敗しました。", 10, 50);
    }
  };

  if (layerContainer.value) {
    layerContainer.value.addEventListener("mousemove", onMousemove);
    layerContainer.value.addEventListener("touchmove", onMousemove);
    layerContainer.value.addEventListener("mousedown", onMouseDown);
    layerContainer.value.addEventListener("touchstart", onMouseDown);
    layerContainer.value.addEventListener("mouseup", onMouseUp);
    layerContainer.value.addEventListener("touchend", onMouseUp);
  }
};
watch(
  provider,
  () => {
    if (provider.canvas) {
      loadImage();
    }
  },
  { immediate: true }
);

const animateCancel = () => {
  if (requestId !== null) {
    cancelAnimationFrame(requestId);
    requestId = null;
  }
  if (layerContainer.value) {
    layerContainer.value.removeEventListener("mousemove", onMousemove);
    layerContainer.value.removeEventListener("touchmove", onMousemove);
    layerContainer.value.removeEventListener("mousedown", onMouseDown);
    layerContainer.value.removeEventListener("touchstart", onMouseDown);
    layerContainer.value.removeEventListener("mouseup", onMouseUp);
    layerContainer.value.removeEventListener("touchend", onMouseUp);
  }
};

// 画面リサイズでアスペクト比が崩れないように画像を再描画
const onResize = () => {
  if (provider && provider.context && img && imgRect.value) {
    const ctx = provider.context;
    const canvas = provider.canvas;
    const imageSize = calculateImageSize(img);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, imgRect.value.left, imgRect.value.top, imageSize.width, imageSize.height);
  }
};
// 画面リサイズイベントが連続して呼ばれるのでデバウンス
const debouncedOnResize = debounce(onResize, 200);

onMounted(() => {
  if (props.pageIndex === 0 && provider.canvas) {
    loadImage();
  }
  window.addEventListener("resize", debouncedOnResize);
});

onUnmounted(() => {
  animateCancel();
  window.removeEventListener("resize", debouncedOnResize);
});

const activeSelf = (activate: boolean) => {
  // Future logic for activation if needed
};

defineExpose({
  activeSelf,
});
</script>

<style scoped lang="scss">
.layer-on-canvas {
  position: absolute;
  top: 0;
  /* left:0; カルーセルで１番左へ配置される*/
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

h2.center {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0;
}

.boad {
  position: relative;
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
      top: 5%;
      #charactor001 {
        width: 25svh;
        max-width: calc(1.25 * 25svw);
        height: auto;
      }
      #charactor002 {
        width: 33svh;
        max-width: calc(1.25 * 33svw);
        height: auto;
      }
      #charactor003 {
        width: 40svh;
        max-width: 50svw;
        height: auto;
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
