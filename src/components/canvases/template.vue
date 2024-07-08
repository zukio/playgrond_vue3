<template>
  <div class="canvas-fluid" @mousemove="onMousemove">
    <!--ParticleClass
      v-for="(particle, index) in particleArray"
      v-bind:key="particle.id"
      ref="particles"
      :mouse="mouse"
      :canvas="canvas"
      @thaw="thaw_snow(index)"
    >
    </ParticleClass-->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue'

//interface Provider {
//  context: CanvasRenderingContext2D | null
//}
//const provider = inject('provider') as Provider

interface Mouse {
  x: number | undefined
  y: number | undefined
}

const mouse = ref<Mouse>({ x: undefined, y: undefined })

const onMousemove = (evt: MouseEvent) => {
  mouse.value = {
    x: evt.clientX,
    y: evt.clientY
  }
}

const init = () => {
  // ここにinitの実装を追加
}

onMounted(() => {
  setInterval(() => {
    mouse.value.x = undefined
    mouse.value.y = undefined
  }, 200)

  init()
})

onUpdated(() => {
  // ここに更新時の処理を追加
})
</script>

<style lang="scss" scoped>
.canvas-fluid {
  width: 100%;
  height: 100%;
}
</style>
