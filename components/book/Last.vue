<template>
  <div
    v-visible="{ onVisible: onSlideVisible, onHidden: onSlideHidden, threshold: 0.8 }"
    ref="layerContainer"
    class="layer-on-canvas"
  >
    <div class="boad boad01 row">
      <div class="textline col-xl">
        <p v-for="(script, index) in scripts" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
        <button class="btn btn-dark btn-lg mt-3" @click="($event) => emit('customEvent', { type: 'close' })">
          おしまい
        </button>
      </div>
      <div class="graphics">
        <!--div id="charactor001">
          <TooltipMultiple title="ぼっちだよ" placement="bottom" :ref="setTooltipRef(0)">
            <img src="@/assets/images/labyrinth/unevencircle001.gif" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div-->
        <div id="charactor002">
          <TooltipMultiple title="まっち" placement="bottom" :ref="setTooltipRef(1)">
            <img :src="illustPath002" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div>
        <div id="charactor003">
          <TooltipMultiple title="ぱっち" placement="bottom" :ref="setTooltipRef(2)">
            <img :src="illustPath003" alt="sample" class="diggle" />
          </TooltipMultiple>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject, watch, defineProps, onUnmounted } from "vue";
import * as CANNON from "cannon-es";
import type { Rotation, Permission } from "@/types";
import { debounce } from "@/utils/";
import { handleOrientation, debugOrientation } from "@/utils/orientation"; // 改善されたユーティリティ関数をインポート
import { useConfetti } from "@/components/canvases/class/Confetti";
import illustPath001 from "@/assets/images/labyrinth/unevencircle001b.png";
import illustPath002 from "@/assets/images/labyrinth/unevencircle002b.png";
import illustPath003 from "@/assets/images/labyrinth/unevencircle003b.png";

// -----------------------------------------------
// data
const isActive = ref(false);

const provider = inject("provider") as {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
};

const props = defineProps<{
  pageIndex: number;
}>();

// Emitsの定義
const emit = defineEmits(["customEvent"]);

const scripts = ["ぼっち！こっち、こっち！", "みつかるまで さがしたから であえたんだ\nずっと いっしょにいようね"];

const layerContainer = ref<HTMLElement | null>(null);

let img: HTMLImageElement | null = null;
const imgRect = ref<{ left: number; top: number; right: number; bottom: number }>({
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
});
let animationId: number | null = null;
const currentSpliteFrame = ref(0);
const FRAME_WIDTH = 630; // スプライトの1フレームの幅
const FRAME_HEIGHT = 630; // スプライトの1フレームの高さ
const FRAME_COUNT = 1; // アニメーションの総フレーム数
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
};
// -----------------------------------------------
// マウスドラッグ
const mouse = ref({ x: 0, y: 0 });
const isDragging = ref<boolean>(false);
// -----------------------------------------------
// ジャイロ
const permissionGranted = computed((): Permission => {
  return useUser().isDeviceOrientationAvailable ?? { isChecked: false, available: false };
});
watch(permissionGranted, (permission) => {
  handlePermissionResponse(permission.available);
});
const rotation = ref<Rotation>({ alpha: 0, beta: 90, gamma: 0, absolute: false });

// -----------------------------------------------
// Physics
let world: CANNON.World | null = null;
let body: CANNON.Body | null = null;
let ground: CANNON.Body | null = null;

const physicsPosition = computed(() => {
  const canvasWidth = provider.canvas ? provider.canvas.width : window.innerWidth;
  const canvasHeight = provider.canvas ? provider.canvas.height : window.innerHeight;
  return {
    x: (0 - canvasWidth / 2) / 50,
    y: -1 * ((canvasHeight - canvasHeight / 2) / 50),
  };
});

const setupPhysics = () => {
  // World setup
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // 重力の大きさ

  // Ground setup
  const groundShape = new CANNON.Plane();
  const groundMaterial = new CANNON.Material();
  ground = new CANNON.Body({ mass: 0, material: groundMaterial });
  ground.addShape(groundShape);
  // Groundの位置を設定

  ground.position.set(0, physicsPosition.value.y * 0.7, 0); // 高さ -5 に設定
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 水平に配置
  world.addBody(ground);

  // Image setup
  const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
  const boxMaterial = new CANNON.Material();
  body = new CANNON.Body({ mass: 1, material: boxMaterial });
  body.addShape(boxShape);

  // Start position: off-screen to the left
  body.position.set(physicsPosition.value.x * 0.5, -physicsPosition.value.y * 0.5, 0);

  // Initial velocity to push the body into the screen
  body.velocity.set(5, 0, 0);
  body.angularVelocity.set(0, 0, -5);

  world.addBody(body);

  // 衝突イベントのリッスン
  body.addEventListener("collide", (event: any) => {
    if (!isActive) return;
    if (event.body === ground) {
      body!.velocity.scale(0.8);
      body!.angularVelocity.scale(0.8);
    }
  });
};

const updateGravity = () => {
  if (!world || !rotation.value) return;
  const beta = rotation.value.beta || 0;
  const gamma = rotation.value.gamma || 0;

  // 傾きに基づいて重力を計算
  const gravityMagnitude = 9.82; // 重力の大きさ
  const gravityX = Math.sin((gamma / 180) * Math.PI) * gravityMagnitude;
  const gravityY = Math.sin((beta / 180) * Math.PI) * gravityMagnitude;

  // 重力を適用
  world.gravity.set(gravityX, -gravityY, 0);
};

// -----------------------------------------------
// Canvas Animation Helper
const calculateImageSize = (sampleW: number, sampleH: number): { width: number; height: number } => {
  // 画面の短かい方の長さを取得
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  // 画像のアスペクト比
  const aspectRatio = sampleW / sampleH;
  // 画像の長い方を画面の短い方の長さの0.3倍にする
  if (sampleW > sampleH) {
    return {
      width: minDimension * 0.2,
      height: (minDimension * 0.2) / aspectRatio,
    };
  } else {
    return {
      width: minDimension * 0.2 * aspectRatio,
      height: minDimension * 0.2,
    };
  }
};
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const keepInBounds = (
  x: number,
  y: number,
  imageSize: { width: number; height: number },
  canvas: HTMLCanvasElement
) => {
  const halfWidth = imageSize.width / 2;
  const halfHeight = imageSize.height / 2;

  // 画像の中央がキャンバスの境界内に収まるように制約
  x = clamp(x, halfWidth, canvas.width - halfWidth);
  y = clamp(y, halfHeight, canvas.height - halfHeight);

  return { x, y };
};
const { initConfetti, setConfettiCanvas, triggerConfetti, updateAndDrawConfetti, isConfettiActive } = useConfetti();

// ----------------
// Canvas Animation
const startAnimation = () => {
  if (animationId === null) {
    if (body) {
      body.position.set(physicsPosition.value.x * 0.5, -physicsPosition.value.y * 0.5, 0);
      body.velocity.set(5, 0, 0);
      body.angularVelocity.set(0, 0, -5);
    }
    animate();
  }
};

const stopAnimation = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

const animate = () => {
  if (!isActive || !provider || !provider.canvas || !provider.context) {
    console.error("Canvas provider is not available");
    return;
  }

  if (img && body) {
    const canvas = provider.canvas;
    const ctx = provider.context;
    const imageSize = calculateImageSize(img.width / FRAME_COUNT, img.height);

    // Physics step
    if (world) {
      world.step(1 / 60);
    }

    // Update image position from physics body
    let x = body.position.x * 50 + canvas.width / 2; // Convert from physics units to pixels
    let y = canvas.height - (body.position.y * 50 + canvas.height / 2); // Convert from physics units to pixels and flip y-axis

    // 境界チェックを適用
    const clampedPosition = keepInBounds(x, y, imageSize, canvas);

    // Update body position if it's outside bounds
    if (x !== clampedPosition.x || y !== clampedPosition.y) {
      body.position.x = (clampedPosition.x - canvas.width / 2) / 50;
      body.position.y = (canvas.height - clampedPosition.y - canvas.height / 2) / 50;
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0); // Stop rotation when hitting bounds
    }

    x = clampedPosition.x;
    y = clampedPosition.y;

    imgRect.value = {
      left: x - imageSize.width / 2,
      top: y - imageSize.height / 2,
      right: x + imageSize.width / 2,
      bottom: y + imageSize.height / 2,
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Save the current context state
    ctx.save();

    ctx.drawImage(
      img,
      currentSpliteFrame.value * FRAME_WIDTH,
      0,
      FRAME_WIDTH,
      FRAME_HEIGHT,
      imgRect.value.left,
      imgRect.value.top,
      imageSize.width,
      imageSize.height
    );
    // Restore the context to its original state
    ctx.restore();
    currentSpliteFrame.value = (currentSpliteFrame.value + 1) % FRAME_COUNT;
  }
  // 紙吹雪を更新して描画
  updateAndDrawConfetti(provider.context);

  animationId = requestAnimationFrame(animate);
};

const loadImage = () => {
  if (!provider || !provider.canvas || !provider.context) {
    console.error("Canvas provider is not available");
    return;
  }

  img = new Image();
  img.src = illustPath001;

  currentSpliteFrame.value = 0;

  img.onload = function () {
    if (!img) return;
    const canvas = provider.canvas;
    const ctx = provider.context;

    const x = 0;
    const y = (canvas.height - img.height) / 2;
    const imageSize = calculateImageSize(img.width / FRAME_COUNT, img.height);
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

const animateCancel = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
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
// -----------------------------------------------
// Event handlers
watch(
  provider,
  () => {
    if (provider.canvas) {
      loadImage();
      initConfetti(1, 3, false); // ベース速度、速度範囲、フェードアウトを設定
      setConfettiCanvas(provider.canvas); // キャンバス要素を設定
    }
  },
  { immediate: true }
);
const onMouseDown = (evt: MouseEvent | TouchEvent) => {
  // 非表示時は処理しない
  if (!isActive.value || !img || !provider) return;
  const isMouseEvent = evt instanceof MouseEvent;
  const x = isMouseEvent ? (evt as MouseEvent).clientX : (evt as TouchEvent).touches[0].clientX;
  const y = isMouseEvent ? (evt as MouseEvent).clientY : (evt as TouchEvent).touches[0].clientY;
  mouse.value = { x, y };
  if (x >= imgRect.value.left && x <= imgRect.value.right && y >= imgRect.value.top && y <= imgRect.value.bottom) {
    isDragging.value = true;
    startAnimation();
  }
};
const onMouseUp = () => {
  // 非表示時は処理しない
  if (!isActive.value) return;
  isDragging.value = false;
  //stopAnimation();
  if (body) {
    body.applyForce(new CANNON.Vec3(0, -50, 0), body.position);
  }
};

const onMousemove = (evt: MouseEvent | TouchEvent) => {
  // 非表示時は処理しない
  if (!isActive.value || !isDragging.value) {
    return;
  }
  const isMouseEvent = evt instanceof MouseEvent;
  const x = isMouseEvent ? evt.clientX : (evt as TouchEvent).touches[0].clientX;
  const y = isMouseEvent ? evt.clientY : (evt as TouchEvent).touches[0].clientY;
  mouse.value = { x, y };
};

// 画面リサイズでアスペクト比が崩れないように画像を再描画
const onResize = () => {
  // 非表示時は処理しない
  if (!isActive.value) return;
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

const localHandleOrientation = (event: DeviceOrientationEvent) => {
  // 非表示時は処理しない
  if (!isActive.value) return;
  handleOrientation(event, rotation);
  updateGravity();
};

const localFallbackOrientation = (event: KeyboardEvent) => {
  // 非表示時は処理しない
  if (!isActive.value) return;
  // ヘルパー関数はデバッグ用のフォールバックでプレイ用とは異なる
  debugOrientation(event, 90, rotation);
  updateGravity();
  // デバッグ用出力
  // console.log("Fallback Orientation:", rotation.value.alpha, rotation.value.beta, rotation.value.gamma);
};

const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    window.addEventListener("deviceorientation", localHandleOrientation);
  } else {
    window.addEventListener("keydown", localFallbackOrientation);
  }
};

// -----------------------------------------------
// Page Visibility
const onSlideVisible = () => {
  console.log("Element is now visible!");
  startAnimation();
  isActive.value = true;
};
const onSlideHidden = () => {
  stopAnimation();
  isActive.value = false;
};
const activeSelf = (activate: boolean) => {
  console.log("Element is now activeSelf!");
  if (activate) {
    startAnimation();
  }
};
// -----------------------------------------------
// Lifecycle
onMounted(async () => {
  window.addEventListener("resize", debouncedOnResize);
});

onUnmounted(() => {
  animateCancel();
  window.removeEventListener("resize", debouncedOnResize);
});

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
  max-width: 100svw;
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
.clamp-in-page {
  width: 100svw !important;
  max-width: 100svw;
}
/* カルーセル内のモーダル用カスタムスタイル */
</style>
