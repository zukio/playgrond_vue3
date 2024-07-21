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
import { debounce } from "@/utils/";
import * as CANNON from "cannon-es";

let world: CANNON.World | null = null;
let body: CANNON.Body | null = null;
let ground: CANNON.Body | null = null;

const setupPhysics = () => {
  // World setup
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  // Ground setup
  const groundShape = new CANNON.Plane();
  const groundMaterial = new CANNON.Material();
  ground = new CANNON.Body({ mass: 0, material: groundMaterial });
  ground.addShape(groundShape);
  // Groundの位置を設定
  ground.position.set(0, -5, 0); // 高さ -1 に設定
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 水平に配置
  world.addBody(ground);

  // Image setup
  const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
  const boxMaterial = new CANNON.Material();
  body = new CANNON.Body({ mass: 1, material: boxMaterial });
  body.addShape(boxShape);
  body.position.set(0, 5, 0); // Start position
  world.addBody(body);

  // 衝突イベントのリッスン
  body.addEventListener("collide", (event: any) => {
    if (event.body === ground) {
      stopAnimation();
    }
  });
};

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

const calculateImageSize = (sampleW: number, sampleH: number): { width: number; height: number } => {
  // 画面の短かい方の長さを取得
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  // 画像のアスペクト比
  const aspectRatio = sampleW / sampleH;
  // 画像の長い方を画面の短い方の長さの0.3倍にする
  if (sampleW > sampleH) {
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
  //stopAnimation();
  if (body) {
    body.applyForce(new CANNON.Vec3(0, -50, 0), body.position);
  }
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
    const imageSize = calculateImageSize(img.width, img.height);

    let x: number = mouse.value.x;
    let y: number = mouse.value.y;
    if (body) {
      if (isDragging.value) {
        body.position.x = (mouse.value.x - canvas.width / 2) / 50; // Convert from pixels to physics units
        body.position.y = (canvas.height - mouse.value.y - canvas.height / 2) / 50; // Convert and flip y-axis
        body.velocity.set(0, 0, 0); // Reset velocity to prevent drifting
        body.angularVelocity.set(0, 0, 0); // Reset angular velocity
      } else {
        // Physics step
        if (world) world.step(1 / 60);
        // Update image position from physics body
        x = body.position.x * 50 + canvas.width / 2; // Convert from physics units to pixels
        y = canvas.height - (body.position.y * 50 + canvas.height / 2); // Convert and flip y-axis
      }
    }
    imgRect.value = {
      left: x - imageSize.width / 2,
      top: y - imageSize.height / 2,
      right: x + imageSize.width / 2,
      bottom: y + imageSize.height / 2,
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, imgRect.value.left, imgRect.value.top, imageSize.width, imageSize.height);
  }
  requestId = requestAnimationFrame(animate);
};

const loadImage = () => {
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
    const imageSize = calculateImageSize(img.width, img.height);
    // 初期化
    imgRect.value = {
      left: x,
      top: y,
      right: x + imageSize.width,
      bottom: y + imageSize.height,
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, imageSize.width, imageSize.height);

    setupPhysics();

    //ctx.font = "20px Arial";
    //ctx.fillStyle = "white";
    //ctx.fillText("My Canvas Image", 10, 30);

    // アニメーション関数の呼び出し
    animate();
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
    const imageSize = calculateImageSize(
      imgRect.value.right - imgRect.value.left,
      imgRect.value.bottom - imgRect.value.top
    );
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
