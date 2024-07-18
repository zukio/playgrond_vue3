<template>
  <div class="m-0 p-0 content-wrapper">
    <div class="boad boad01" v-if="props.pageIndex == 0">
      <h2 class="center" ref="titleElement">TITLE</h2>
      <div class="textline">
        <p v-for="(script, index) in scripts[props.pageIndex ?? 0]" :key="script" :class="{ h1: index == 0 }">
          {{ script }}
        </p>
      </div>
      <div class="graphics">
        <img src="/images/unevencircle001.png" alt="sample" class="diggle" id="charactor001" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject, watch, defineProps } from "vue";

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

const titleElement = ref<HTMLElement | null>(null);

const loadImage = () => {
  if (!provider || !provider.canvas || !provider.context) {
    console.error("Canvas provider is not available");
    return;
  }

  const img = new Image();
  img.src = "/images/unevencircle001.png";

  img.onload = function () {
    const canvas = provider.canvas;
    const ctx = provider.context;

    const x = (canvas.width - img.width) / 2;
    const y = (canvas.height - img.height) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.drawImage(img, x, y);

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("My Canvas Image", 10, 30);
  };

  img.onerror = function () {
    console.error("画像の読み込みに失敗しました。");
    if (provider && provider.context) {
      const ctx = provider.context;
      ctx.clearRect(0, 0, provider.canvas.width, provider.canvas.height); // Clear the canvas
      ctx.font = "20px Arial";
      ctx.fillStyle = "red";
      ctx.fillText("画像の読み込みに失敗しました。", 10, 50);
    }
  };
};

watch(provider, () => {
  console.log("pageIndex changed");
  if (provider.canvas) {
    loadImage();
  }
});

onMounted(() => {
  console.log("onMounted", props.pageIndex, provider.canvas);
  if (props.pageIndex === 0 && provider.canvas) {
    loadImage();
  }
});
</script>

<style scoped lang="scss">
.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
