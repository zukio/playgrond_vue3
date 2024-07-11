<template>
  <div>
    <h2 class="center">{{ msg }}</h2>
    <PopupMenu
      :menus="
        [
          { key: '01', src: '/' },
          { key: '02', src: '/' },
          { key: '03', src: '/' }
        ] as any
      "
    />
    <Canvas class="canvas-wrapper" bg-color=""></Canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Canvas from '@/components/canvases/CanvasContainer.vue'
import PopupMenu from '@/components/PopupMenu.vue'

const props = defineProps<{
  msg: string
}>()

const fadeIn = (selector: string, duration: number, delay: number) => {
  // fadeIn 関数の実装をここに記述
  // 例:
  // const element = document.querySelector(selector)
  // if (element) {
  //   element.style.opacity = '0'
  //   setTimeout(() => {
  //     element.style.transition = `opacity ${duration}ms`
  //     element.style.opacity = '1'
  //   }, delay)
  // }
}

onMounted(() => {
  fadeIn('h1', 3000, 100)
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h1:before {
  content: 'HALLOWEEN';
  position: absolute;
  bottom: -1em;
  left: 0;
  font-size: 40px;
  width: 100%;
  text-align: center;
}

.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/img/2f31a0be736e337bdc6289ea0245400d.jpg') top right / cover repeat-y #d36015;
  z-index: -100;
  animation: incertanim 3s ease-out 0s 1 forwards;
}

@keyframes incertanim {
  0% {
    background-position: left top;
    background-size: 500%;
  }
  25% {
    background-position: left 10%;
    background-size: 100%;
    filter: blur(0px);
  }
  100% {
    background-position: left 30%;
    filter: blur(10px);
  }
}
</style>
