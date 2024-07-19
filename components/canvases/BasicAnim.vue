<template>
  <div class="m-0 p-0 content-wrapper">
    <div class="boad boad01" v-if="props.pageIndex == 0">
      <div class="textline">
        <p v-for="(script, index) in scripts[props.pageIndex ?? 0]" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
      </div>
      <div class="graphics"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject, watch, defineProps, onUnmounted, nextTick } from "vue";

const provider = inject("provider") as {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
};

const props = defineProps<{
  pageIndex: number;
}>();

const scripts = [
  ["さいしょは みんな はなれてたんだ", "ぱっち と まっち を さがしにいこう！"],
  ["line1", "line2"],
];

const playCue = ref<Array<boolean>>([false]);
const imagesRef = ref<any[]>([]);
const titleElement = ref<HTMLElement | null>(null);

let animationFrameId: number;

const drawImages = (images: any[]) => {
  const canvas = provider.canvas;
  const ctx = provider.context;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach(({ img, scale, x, y, width, height }) => {
    ctx.drawImage(img, 0, 0, img.width, img.height, x, y, width * scale, height * scale);
  });
};

const loadImages = (imagePaths: string[]) => {
  if (!provider || !provider.canvas || !provider.context) {
    console.error("Canvas provider is not available");
    return;
  }

  const images: any[] = Array(imagePaths.length).fill(null);
  let loadedCount = 0;

  imagePaths.forEach((src, index) => {
    const img = new Image();
    img.src = src;

    img.onload = function () {
      loadedCount += 1;

      const { parentWidth, parentHeight } = getParentSize();

      const x = parentWidth / 2 + (index % 2);
      const y = parentHeight / 2 + Math.floor(index / 2);

      images[index] = { img, x, y, width: img.width, height: img.height, scale: 1 };

      if (loadedCount === imagePaths.length) {
        imagesRef.value = images;
        if (playCue.value.length && playCue.value[0]) {
          animateImages(images);
        }
      }
    };

    img.onerror = function () {
      console.error(`画像の読み込みに失敗しました: ${src}`);
    };
  });
};

const getParentSize = () => {
  const parentElement = provider.canvas.parentElement;
  const parentWidth = parentElement ? parentElement.clientWidth : window.innerWidth;
  const parentHeight = parentElement ? parentElement.clientHeight : window.innerHeight;
  return { parentWidth, parentHeight };
};

const getAdjustSize = (image: any) => {
  const { parentWidth, parentHeight } = getParentSize();
  const aspectRatio = image.width / image.height;
  const canvasAspectRatio = parentWidth / parentHeight;
  let newWidth, newHeight;

  if (canvasAspectRatio > aspectRatio) {
    newHeight = parentHeight * image.scale;
    newWidth = newHeight * aspectRatio;
  } else {
    newWidth = parentWidth * image.scale;
    newHeight = newWidth / aspectRatio;
  }

  return { newWidth, newHeight };
};
let defaultWidth = -1;
let defaultHeight = -1;
const animateImages = (images: any[]) => {
  if (!provider || !provider.canvas || !provider.context || !images.length) {
    console.error("Canvas provider is not available");
    return;
  }
  if (defaultWidth <= 0) {
    defaultWidth = images[0].width;
    defaultHeight = images[0].height;
  }
  images[0].scale = 9; // 2752,2064
  const { parentWidth, parentHeight } = getParentSize();
  const targetScale = Math.max(parentWidth / defaultWidth, parentHeight / defaultHeight);
  console.log(targetScale);
  const update = () => {
    images.forEach((image, index) => {
      if (index === 0) {
        const { newWidth, newHeight } = getAdjustSize(image);

        image.x = (parentWidth - newWidth) / 2;
        image.y = (parentHeight - newHeight) / 2;
        image.width = newWidth;
        image.height = newHeight;

        if (image.scale > targetScale) {
          image.scale -= 0.05;
        }
      }
    });

    drawImages(images);

    if (images[0].scale > targetScale) {
      animationFrameId = requestAnimationFrame(update);
    }
  };
  update();
};

const onResize = () => {
  if (provider.canvas && provider.context) {
    const parentElement = provider.canvas.parentElement;
    const parentWidth = parentElement ? parentElement.clientWidth : window.innerWidth;
    const parentHeight = parentElement ? parentElement.clientHeight : window.innerHeight;

    const imgData = provider.context.getImageData(0, 0, parentWidth, parentHeight);
    provider.context.putImageData(imgData, 0, 0);
  }
};

watch(provider, () => {
  const config = useRuntimeConfig();
  const baseUrl = config ? config.public.baseUrl : "/";
  if (provider.canvas) {
    const imagePaths = [
      `${baseUrl}images/book/DigitalBook_maze_01_0708.png`,
      `${baseUrl}images/unevencircle001.png`,
      `${baseUrl}images/unevencircle002.png`,
      `${baseUrl}images/unevencircle003.png`,
    ];
    loadImages(imagePaths);
  }
});

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", onResize);
});

const activeSelf = (activate: boolean) => {
  cancelAnimationFrame(animationFrameId);
  if (activate) {
    animateImages(imagesRef.value);
  }
};

defineExpose({
  activeSelf,
});
</script>

<style scoped lang="scss">
.content-wrapper {
  position: absolute;
  top: 0;
  width: 100svw;
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
