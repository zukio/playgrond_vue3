<!-- データリスト：親（呼び出し元）からセットされたデータをリスト表示 -->
<template>
  <div
    id="medialist-container"
    @mouseover="setTimmer(false)"
    @mouseout="setTimmer(true)"
    data-bs-container="body"
    data-bs-toggle="popover"
    data-bs-placement="top"
    data-bs-content="このリストの内容はGoogleスプレッドシートをデータベースAPIとして取得しています。"
  >
    <div class="gradframe top"></div>
    <div class="gradframe bottom"></div>
    <ul class="list-unstyled fade-enter">
      <li v-for="(list, index) of listData" :key="index" @click="choose(index)" class="p-2">
        <!--template #aside>
          <b-img blank blank-color="#abc" width="64" alt="placeholder"></b-img>
        </template-->
        <h4 class="mt-0 mb-1">{{ list.head }}</h4>
        <p class="mb-0">{{ list.text.substr(0, 100) }} ...</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps<{
  interval: number
  adjustingColor: string
}>()

const emit = defineEmits<{
  (e: 'PostMedialistactive', value: any): void
}>()

const listData = ref<Array<any>>([])
const timmer = ref<number | null>(null)

const container = computed(() => document.querySelector('#medialist-container ul') as HTMLElement)

const setListData = (input: any) => {
  if (!listData.value) {
    container.value?.classList.remove('fade-enter')
    setTimmer(true)
    setTimeout(() => {
      choose(1)
    }, 500)
  }
  listData.value = JSON.parse(JSON.stringify(input))
}

const flip = (direction: 'to-up' | 'to-down', repeat: number) => {
  container.value?.querySelectorAll('li').forEach((el) => el.classList.add(direction))
  container.value?.querySelector('.active')?.classList.remove('active')

  const temp = [...listData.value]
  if (direction === 'to-up') {
    listData.value.push(temp[0])
    listData.value.shift()
  } else {
    listData.value.unshift(temp[temp.length - 1])
    listData.value.pop()
  }

  emit('PostMedialistactive', listData.value[1])

  setTimeout(() => {
    container.value?.querySelector('li:nth-child(2)')?.classList.add('active')
    container.value?.querySelectorAll('li').forEach((el) => el.classList.remove(direction))
    if (repeat > 1) {
      flip(direction, repeat - 1)
    }
  }, 500 / repeat)
}

const choose = (index: number) => {
  if (index === 0) {
    flip('to-down', 1)
  } else if (index === 1) {
    container.value?.querySelector('li:nth-child(2)')?.classList.add('active')
  } else {
    flip('to-up', index - 1)
    container.value?.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const setTimmer = (bool: boolean) => {
  if (timmer.value) {
    clearInterval(timmer.value)
  }
  if (bool) {
    timmer.value = setInterval(() => {
      flip('to-up', 1)
      container.value?.scrollTo({ top: 0, behavior: 'smooth' })
    }, props.interval) as unknown as number
    if (container.value) container.value.style.overflowY = 'hidden'
  } else {
    if (container.value) container.value.style.overflowY = 'scroll'
  }
}

const setVisual = () => {
  const topGradFrame = document.querySelector('.gradframe.top') as HTMLElement
  const bottomGradFrame = document.querySelector('.gradframe.bottom') as HTMLElement
  if (topGradFrame) {
    topGradFrame.style.background = `linear-gradient(to bottom, ${props.adjustingColor}, rgba(0, 0, 0, 0))`
  }
  if (bottomGradFrame) {
    bottomGradFrame.style.background = `linear-gradient(to bottom, rgba(0, 0, 0, 0), ${props.adjustingColor})`
  }
  if (container.value) {
    container.value.style.height = `${container.value.parentElement?.clientHeight}px`
  }
}

onMounted(() => {
  setVisual()
})

watch(() => props.adjustingColor, setVisual)

defineExpose({
  setListData,
  choose,
  setTimmer
})
</script>

<style lang="scss" scoped>
#medialist-container {
  position: relative;
  overflow-y: hidden;

  .gradframe {
    position: absolute;
    width: 100%;
    height: 50px;
    z-index: 1;
    &.top {
      top: 0;
    }
    &.bottom {
      bottom: 0;
    }
  }

  ul {
    overflow-y: hidden;
    overflow-x: hidden;
    direction: rtl;
    z-index: 0;
    transition: opacity 0.5s;
    //height: 500px;

    &.fade-enter,
    &.fade-leave-to {
      opacity: 0;
    }

    li {
      transition: all 0.3s;
      cursor: pointer;
      color: $color_text;
      background: left top / 0% 100% no-repeat
        linear-gradient(90deg, $color_active, rgba(0, 0, 0, 0));
      h4 {
        direction: ltr;
        font-size: 1em;
        font-weight: 400;
        padding-bottom: 3px;
      }
      p {
        direction: ltr;
        font-size: 0.8em;
      }

      &.active {
        color: $color_invert;
        background: left top / 100% 100% no-repeat
          linear-gradient(90deg, $color_active, $color_active);
        //background-color: $color_active;
      }
      &:hover {
        color: $color_invert;
      }
      &.to-up {
        animation: upanim 400ms ease-out 0s 1 normal forwards;
      }
      &.to-down {
        animation: upanim 400ms ease-out 0s 1 reverse forwards;
      }
    }
  }
}
@include keyframes(upanim) {
  0% {
    //
  }
  99% {
    transform: translateY(-100px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
