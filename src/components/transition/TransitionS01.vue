<template>
  <transition name="slideIn-fadeOut">
    <div class="transition" v-if="props.show">
      <h2>transit</h2>
      <div class="trans-container">
        <div class="innerLeft bg-dark"></div>
        <div class="innerRight bg-secondary"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'postShowNo', value: number): void
}>()

const showState = ref(0)
const transContainerStyle = ref({ transform: 'rotate(0deg)' })

const setShowState = (state: number, delay: number) => {
  setTimeout(() => {
    showState.value = state
  }, delay)
}

watch(
  () => props.show,
  (newValue) => {
    if (!newValue) {
      setShowState(0, 0)
    } else {
      setShowState(1, 500)
    }
  },
  { immediate: true }
)

watch(showState, (newValue) => {
  switch (newValue) {
    case 1:
      transContainerStyle.value = { transform: 'rotate(45deg)' }
      setShowState(1.5, 500)
      break
    case 1.5:
      transContainerStyle.value = { transform: 'rotate(90deg)' }
      setShowState(2, 500)
      break
    case 2:
      transContainerStyle.value = { transform: 'rotate(180deg)' }
      setShowState(3, 1000)
      break
    case 3:
      emit('postShowNo', 0)
      break
    default:
      transContainerStyle.value = { transform: 'rotate(0deg)' }
      break
  }
})

onMounted(() => {
  // 必要に応じてここに初期化コードを追加
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* ------------ 全体 ------------ */
.transition {
  z-index: 100;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  //background: black;
  transform-origin: left center;
  overflow: hidden;
  h2 {
    position: absolute;
  }

  div {
    padding: 0;
    margin: 0;
  }
}

/* ------------ slideIn ------------ */

// 表示前
.slideIn-fadeOut-enter {
  transform: scaleX(0);
}
// 表示中
.slideIn-fadeOut-enter-active {
  transition: all 1s;
  transform-origin: right center;
}
// 表示後
.slideIn-fadeOut-enter-to {
  transform: scaleX(1);
}
// 非表示前
.slideIn-fadeOut-leave {
  transform: scaleX(1);
}
// 非表示中
.slideIn-fadeOut-leave-active {
  transition: all 1s;
  //transform-origin: left center;
}
// 非表示後
.slideIn-fadeOut-leave-to {
  //transform: scaleX(0);
  opacity: 0;
}

/* ------------ 中身 ------------ */
.trans-container {
  position: absolute;
  display: flex;
  left: -50vw;
  top: -150vh;
  width: 200vw;
  height: 400vh;
  transition: all 1s;
  background-color: black;
  //transform-origin: left center;
  animation: fadeOut 1s ease 2s 1 normal forwards;
  @keyframes fadeOut {
    0% {
      background-color: rgba(0, 0, 0, 1);
    }
    100% {
      background-color: rgba(0, 0, 0, 0);
    }
  }

  .innerLeft {
    z-index: 101;
    width: 50%;
    height: 100%;
    transform-origin: left bottom;
    //animation: leftIn 2s ease 0s 1 normal none forwards;
    animation: leftIn 3s ease-out 0s 1 normal forwards;
    @keyframes leftIn {
      0% {
        transform: scale(1, 0);
      } //0
      33%,
      66% {
        transform: scale(1, 1);
      } //1-2
      100% {
        transform: scale(0, 1);
      } //3
    }
  }
  .innerRight {
    z-index: 101;
    width: 50%;
    height: 100%;

    animation: rightIn 2.5s ease-out 0.5s 1 normal both;
    @keyframes rightIn {
      0% {
        //0+0.5
        transform-origin: left bottom;
        transform: scale(1, 0);
      }
      40% {
        //1+0.5
        transform-origin: left bottom;
        transform: scale(1, 1);
      }
      60% {
        //1.5+0.5
        transform-origin: right bottom;
        transform: scale(1, 1);
      }
      100% {
        transform-origin: right bottom;
        transform: scale(0, 1);
      }
    }
  }
}
</style>
