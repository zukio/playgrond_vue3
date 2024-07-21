<template>
  <div v-visible="onVisible" ref="layerContainer" class="layer-on-canvas">
    <PermissionButton v-if="!permissionGranted.isChecked" @click="handlePermissionResponse" ref="permissionComponent" />
    <div class="boad boad01" v-if="props.pageIndex == 0">
      <div class="textline">
        <p v-for="(script, index) in scripts[props.pageIndex ?? 0]" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
      </div>
    </div>
    <HighlightOverlay
      v-if="showOverlay"
      :highlightRect="{
        x: imgRect?.left ?? 0,
        y: imgRect?.top ?? 0,
        width: imgRect?.right - imgRect?.left ?? 0,
        height: imgRect?.bottom - imgRect?.top ?? 0,
      }"
      :title="propsTiltle"
      :description="propsDescription"
      ref="highlightOverlay"
    >
      <div class="text-center">
        <img v-if="tourIndex == 0" :src="illustPath002" ref="gyroscope" width="100" height="auto" />
        <img
          v-else-if="tourIndex == 1 && permissionGranted.available"
          :src="illustPath003"
          ref="touch"
          width="100"
          height="auto"
        />
        <img
          v-else-if="tourIndex == 1 && !permissionGranted.available"
          :src="illustPath004"
          ref="keybord"
          width="100"
          height="auto"
        />
      </div>
    </HighlightOverlay>
    <CompleteOverlay
      id="completeModal"
      ref="completeModal"
      title="じゅんびができた！"
      description="まっちをさがしにいこう"
    >
      <template #image>
        <img :src="illustPath005" width="200" height="auto" />
      </template>
    </CompleteOverlay>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject, watch, defineProps, onUnmounted } from "vue";
import * as CANNON from "cannon-es";
import type { Rotation, Permission } from "@/types";
import { debounce } from "@/utils/";
import { handleOrientation, debugOrientation } from "@/utils/orientation"; // 改善されたユーティリティ関数をインポート
import { useConfetti } from "@/components/canvases/class/Confetti.vue";
import HighlightOverlay from "@/components/lock/Highlight.vue";
import PermissionButton from "@/components/permission/DeviceOrientation.vue";
// import CompleteOverlay from "@/components/book/Layer_Labyrinth000.vue";
import CompleteOverlay from "@/components/modal/Centered.vue";
const illustPath001 = new URL("@/assets/images/labyrinth/unevencircle003.png", import.meta.url).href;
const illustPath002 = new URL("@/assets/images/utils/touch.png", import.meta.url).href;
const illustPath003 = new URL("@/assets/images/utils/gyroscope.png", import.meta.url).href;
const illustPath004 = new URL("@/assets/images/utils/key_arrow.png", import.meta.url).href;
const illustPath005 = new URL("@/assets/images/labyrinth/unevencircle002.png", import.meta.url).href;
const provider = inject("provider") as {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
};

const props = defineProps<{
  pageIndex: number;
}>();

const onVisible = () => {
  console.log("Element is now visible!");
  // Perform any actions you need when the element becomes visible
};

const scripts = [["さいしょは みんな はなれてたんだ", "ぱっち と まっち を さがしにいこう！"]];

const layerContainer = ref<HTMLElement | null>(null);
const highlightOverlay = ref<any>(null);
const completeModal = ref<any>(null);
let img: HTMLImageElement | null = null;
const imgRect = ref<{ left: number; top: number; right: number; bottom: number }>({
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
});
let animationId: number | null = null;
// -----------------------------------------------
// Tour
const showOverlay = ref<boolean>(false);
const tryCount = ref<number>(0);
const tryTimeoutId = ref<NodeJS.Timeout | null>(null);
const tourIndex = ref<number>(-1);
const tourSteps = [
  {
    popover: { title: "ぱっちをうごかしてみよう", description: "タッチしてうごかす" },
  },
  {
    popover: { title: "ぱっちをころがしてみよう", description: "かたむけてころがす" },
  },
];
const propsTiltle = computed(() => {
  const activeStep = tourIndex.value < tourSteps.length ? tourSteps[tourIndex.value] : null;
  if (activeStep && activeStep.popover && activeStep.popover.title) {
    return activeStep.popover.title;
  }
  return "";
});
const propsDescription = computed(() => {
  const activeStep = tourIndex.value < tourSteps.length ? tourSteps[tourIndex.value] : null;

  if (activeStep && activeStep.popover && activeStep.popover.description) {
    if (tourIndex.value == 1) {
      return "キーボードをおしてみて！";
    }
    return activeStep.popover.description;
  }
  return "";
});

const onTour = computed(() => {
  return tourIndex.value >= 0;
});

function driveTour(stepNo: number = 0) {
  if (stepNo < tourSteps.length) {
    tourIndex.value = onTour.value ? stepNo : 0;
    showOverlay.value = true;
    tryTimeoutId.value = setTimeout(() => {
      if (onTour.value) {
        tryTimeoutId.value = null;
        hideTour();
      }
    }, 5000);
  } else if (stepNo == tourSteps.length) {
    triggerConfetti();
    completeModal.value?.show();
  }
}

function hideTour() {
  showOverlay.value = false;
  // チュートリアル試行回数が不足（かつ制限時間以内）
  if (tryCount.value < 3 && tryTimeoutId.value) {
    tryCount.value += 1;
    return;
  }
  // チュートリアル達成（試行回数、制限時間をリセット）
  if (tryTimeoutId.value) {
    clearTimeout(tryTimeoutId.value);
    tryTimeoutId.value = null;
  }
  tryCount.value = 0;
  // NextStep
  tourIndex.value += 1;
  driveTour(tourIndex.value);
}

function resetTour() {
  tourIndex.value = -1;
  showOverlay.value = false;
  tryCount.value = 0;
  if (tryTimeoutId.value) {
    clearTimeout(tryTimeoutId.value);
    tryTimeoutId.value = null;
  }
}

const { initConfetti, setConfettiCanvas, triggerConfetti, updateAndDrawConfetti, isConfettiActive } = useConfetti();

// -----------------------------------------------
// マウスドラッグ
const mouse = ref({ x: 0, y: 0 });
const isDragging = ref<boolean>(false);
// -----------------------------------------------
// ジャイロ
const permissionGranted = computed((): Permission => {
  return useUser().isDeviceOrientationAvailable ?? { isChecked: false, available: false };
});
const permissionComponent = ref<any | null>(null);
const rotation = ref<Rotation>({ alpha: 0, beta: 90, gamma: 0, absolute: false });

// -----------------------------------------------
// Physics
let world: CANNON.World | null = null;
let body: CANNON.Body | null = null;
let ground: CANNON.Body | null = null;

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
  ground.position.set(0, -6, 0); // 高さ -5 に設定
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
      // stopAnimation();
      if (!onTour.value) {
        driveTour(tourIndex.value);
      }
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

const startAnimation = () => {
  if (animationId === null) {
    animate();
  }
};

const stopAnimation = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
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
      if (isDragging.value || !world) {
        body.position.x = (mouse.value.x - canvas.width / 2) / 50; // Convert from pixels to physics units
        body.position.y = (canvas.height - mouse.value.y - canvas.height / 2) / 50; // Convert and flip y-axis
        body.velocity.set(0, 0, 0); // Reset velocity to prevent drifting
        body.angularVelocity.set(0, 0, 0); // Reset angular velocity
      } else {
        // Physics step
        world.step(1 / 60);

        // Update image position from physics body
        x = body.position.x * 50 + canvas.width / 2; // Convert from physics units to pixels
        y = canvas.height - (body.position.y * 50 + canvas.height / 2); // Convert from physics units to pixels and flip y-axis

        // 境界チェックを適用
        const clampedPosition = keepInBounds(x, y, imageSize, canvas);

        // 物体の位置が境界を超える場合、速度をゼロにリセット
        if (x !== clampedPosition.x || world.gravity.x == 0) {
          body.velocity.x = 0;
          body.position.x = (clampedPosition.x - canvas.width / 2) / 50; // Update position to keep within bounds
        }
        if (y !== clampedPosition.y || world.gravity.y == 0) {
          body.velocity.y = 0;
          body.position.y = (canvas.height - clampedPosition.y - canvas.height / 2) / 50; // Update position to keep within bounds
        }

        x = clampedPosition.x;
        y = clampedPosition.y;
      }
    }
    if (x && y) {
      imgRect.value = {
        left: x - imageSize.width / 2,
        top: y - imageSize.height / 2,
        right: x + imageSize.width / 2,
        bottom: y + imageSize.height / 2,
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, imgRect.value.left, imgRect.value.top, imageSize.width, imageSize.height);
    }
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
  if (!img || !provider) return;
  const isMouseEvent = evt instanceof MouseEvent;
  const x = isMouseEvent ? (evt as MouseEvent).clientX : (evt as TouchEvent).touches[0].clientX;
  const y = isMouseEvent ? (evt as MouseEvent).clientY : (evt as TouchEvent).touches[0].clientY;
  mouse.value = { x, y };
  if (x >= imgRect.value.left && x <= imgRect.value.right && y >= imgRect.value.top && y <= imgRect.value.bottom) {
    isDragging.value = true;
    startAnimation();
    // チュートリアル（タッチ・マウスで動かす）を達成
    if (onTour.value && tourIndex.value == 0) {
      hideTour();
    }
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

const localHandleOrientation = (event: DeviceOrientationEvent) => {
  handleOrientation(event, rotation);
  updateGravity();
  // チュートリアル（ジャイロで動かす）を達成
  if (onTour.value && tourIndex.value == 1) hideTour();
};

const localFallbackOrientation = (event: KeyboardEvent) => {
  // ヘルパー関数はデバッグ用のフォールバックでプレイ用とは異なる
  debugOrientation(event, 90, rotation);
  updateGravity();
  // チュートリアル（キーボードで動かす）を達成
  if (onTour.value && tourIndex.value == 1) hideTour();
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

async function checkOrientationAvailability() {
  if (permissionComponent.value) {
    try {
      const isAvailable = await permissionComponent.value.checkDeviceOrientationAvailability();
      handlePermissionResponse(isAvailable);
    } catch (error) {
      console.error("Error checking orientation availability:", error);
      handlePermissionResponse(false); // フォールバックを設定
    }
  }
}
// -----------------------------------------------
// Lifecycle
onMounted(async () => {
  await checkOrientationAvailability();
  window.addEventListener("resize", debouncedOnResize);
});

onUnmounted(() => {
  animateCancel();
  window.removeEventListener("resize", debouncedOnResize);
});

const activeSelf = (activate: boolean) => {
  // animateCancel();
  stopAnimation();
  resetTour();
  if (activate) {
    startAnimation();
  }
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
      left: 50%;
      transform: translateX(-50%);
      bottom: 5%;
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
