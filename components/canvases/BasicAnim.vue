<template>
  <div class="m-0 p-0 content-wrapper">
    <div class="boad boad01" v-if="props.pageIndex == 0">
      <!--h2 class="center" ref="titleElement">TITLE</h2-->
      <div class="textline">
        <p v-for="(script, index) in scripts[props.pageIndex ?? 0]" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
      </div>
      <div class="graphics">
        <!--img src="/images/unevencircle001.png" alt="sample" class="diggle" id="charactor001" @click="toggleTimeline" /-->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject, watch, defineProps, onUnmounted } from "vue";

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

const titleElement = ref<HTMLElement | null>(null);

let animationFrameId: number;

const drawImages = (images: any[]) => {
  const canvas = provider.canvas;
  const ctx = provider.context;

  // 背景を白く塗りつぶす
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach(({ img, scale, x, y, width, height }) => {
    ctx.drawImage(img, 0, 0, img.width, img.height, x, y, width * scale, height * scale);
  });

  //ctx.font = "20px Arial";
  //ctx.fillStyle = "black"; // テキストの色を黒にする
  //ctx.fillText("My Canvas Image", 10, 30);
};

const loadImages = (imagePaths: string[]) => {
  if (!provider || !provider.canvas || !provider.context) {
    console.error("Canvas provider is not available");
    return;
  }

  const images: any[] = [];
  let loadedCount = 0;

  imagePaths.forEach((src, index) => {
    const img = new Image();
    img.src = src;

    img.onload = function () {
      loadedCount += 1;

      const canvas = provider.canvas;
      const aspectRatio = img.width / img.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      let newWidth, newHeight;

      if (index === 0) {
        // 最初の画像は背景として設定
        if (canvasAspectRatio > aspectRatio) {
          newHeight = canvas.height;
          newWidth = newHeight * aspectRatio;
        } else {
          newWidth = canvas.width;
          newHeight = newWidth / aspectRatio;
        }
        images.push({ img, x: 0, y: 0, width: newWidth, height: newHeight, scale: 3 });
      } else {
        // 他の画像は通常の設定
        if (canvasAspectRatio > aspectRatio) {
          newHeight = canvas.height / 2; // Adjust this value based on your layout
          newWidth = newHeight * aspectRatio;
        } else {
          newWidth = canvas.width / 2; // Adjust this value based on your layout
          newHeight = newWidth / aspectRatio;
        }
        const x = (canvas.width - newWidth) / 2 + (index % 2) * newWidth; // Adjust position based on index
        const y = (canvas.height - newHeight) / 2 + Math.floor(index / 2) * newHeight; // Adjust position based on index

        images.push({ img, x, y, width: newWidth, height: newHeight, scale: 0.5 });
      }

      if (loadedCount === imagePaths.length) {
        animateImages(images); // Animate all images when all are loaded
      }
    };

    img.onerror = function () {
      console.error(`画像の読み込みに失敗しました: ${src}`);
    };
  });
};

const animateImages = (images: any[]) => {
  const canvas = provider.canvas;
  const targetScale = Math.max(canvas.width / images[0].width, canvas.height / images[0].height);

  const update = () => {
    images.forEach((image, index) => {
      if (index === 0) {
        // 最初の画像は背景としてアニメーション
        const aspectRatio = image.width / image.height;
        const canvasAspectRatio = canvas.width / canvas.height;
        let newWidth, newHeight;

        if (canvasAspectRatio > aspectRatio) {
          newHeight = canvas.height * image.scale;
          newWidth = newHeight * aspectRatio;
        } else {
          newWidth = canvas.width * image.scale;
          newHeight = newWidth / aspectRatio;
        }

        image.x = (canvas.width - newWidth) / 2;
        image.y = (canvas.height - newHeight) / 2;
        image.width = newWidth;
        image.height = newHeight;

        if (image.scale > targetScale) {
          image.scale -= 0.05; // Adjust speed as necessary
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
    // Save the current image data
    const imgData = provider.context.getImageData(0, 0, provider.canvas.width, provider.canvas.height);

    // Restore the image data
    provider.context.putImageData(imgData, 0, 0);
  }
};

watch(provider, () => {
  const config = useRuntimeConfig();
  const baseUrl = config ? config.public.baseUrl : "/";
  if (provider.canvas) {
    const imagePaths = [
      "`${baseUrl}images/book/DigitalBook_maze_01_0708.png`",
      "`${baseUrl}images/unevencircle001.png`",
      "`${baseUrl}images/unevencircle002.png`",
      "`${baseUrl}images/unevencircle003.png`",
      //`@/assets/images/DigitalBook_maze_01_0708.png`,
      //`@/assets/images/unevencircle001.png`,
      //`@/assets/images/unevencircle002.png`,
      //`@/assets/images/unevencircle003.png`,
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
</script>

<style scoped lang="scss">
.content-wrapper {
  position: absolute;
  top: 0;
  //left: 0;
  width: 100svw;
  //height: 100%;
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
