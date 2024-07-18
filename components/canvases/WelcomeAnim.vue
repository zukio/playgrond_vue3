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
        <img src="/images/unevencircle001.png" alt="sample" class="diggle" id="charactor001" @click="toggleTimeline" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject } from "vue";

const provider = inject("provider") as {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
};

const props = defineProps<{
  pageIndex: number;
  // contentBackgroud: string;
}>();
const onPageIndexChanged = (pageIndex: number) => {
  // console.log(pageIndex, props.pageIndex);
};

const scripts = [
  ["line1", "line2"],
  ["line1", "line2"],
];

const titleElement = ref<HTMLElement | null>(null);
// const canvasElement = ref<HTMLElement | null>(null);
watch(provider, () => {
  if (provider.canvas) {
    provider.canvas.classList.add("canvas-fluid");
    startAnimation();
  }
});

const fadeIn = (element: HTMLElement, duration: number, delay: number) => {
  element.style.opacity = "0";
  element.style.transition = `opacity ${duration}ms ease-in-out ${delay}ms`;
  setTimeout(() => {
    element.style.opacity = "1";
  }, delay);
};

const startAnimation = () => {
  if (titleElement.value && provider.canvas) {
    fadeIn(titleElement.value, 3000, 100);
    startCanvasAnimation(provider.canvas, 3000);
  }
};

const startCanvasAnimation = (element: HTMLElement, duration: number) => {
  // CanvasContainerコンポーネントのアニメーションロジックを呼び出す
  if (provider.canvas) {
    provider.canvas.classList.add("animate");
    setTimeout(() => {
      provider.canvas.classList.remove("animate");
    }, duration);
  }
};

onMounted(() => {
  //
});
</script>

<style>
.canvas-fluid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  background: url("/images/dammy.jpg") top right / cover repeat-y #d36015;
}
.canvas-fluid.animate {
  animation: incertanim 3s ease-out 0s 1 forwards;
}

@keyframes incertanim {
  0% {
    background-position: left top;
    background-size: 500%;
    opacity: 0;
  }
  25% {
    background-position: left 10%;
    background-size: 100%;
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    background-position: left 30%;
    filter: blur(10px);
  }
}
</style>
<style scoped lang="scss">
.content-wrapper {
  // position: absolute;
  //top: 0;
  //left: 0;
  //width: 100%;
  //height: 100%;
  //z-index: 1;
  //display: flex;
  //flex-direction: column;
  //align-items: center;
  //justify-content: center;
}

h2.center {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0;
}

.boad {
  position: absolute;
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
      // transform: translateY(-50%);
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
      flex-wrap: wrap;
      // align-items: center;
      // left: 3%;
      top: 7%;
      #charactor001 {
        margin-top: 10svh;
        img {
          width: 25svh;
          max-width: calc(1.25 * 25svw);
          height: auto;
        }
      }
      #charactor002 {
        img {
          width: 33svh;
          max-width: calc(1.25 * 33svw);
          height: auto;
        }
      }
      #charactor003 {
        margin-right: 10svh;
        img {
          width: 40svh;
          max-width: 50svw;
          height: auto;
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
