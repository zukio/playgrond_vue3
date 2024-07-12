<!-- トップページの演出：親（呼び出し元）から送られたアイテムをサークルポップアップアニメーションで表示 -->
<template>
  <div>
    <transition name="bounce">
      <div class="container" v-if="show">
        <div class="row circle_container">
          <div class="col circle" v-for="(menu, index) in menus" :key="index">
            <p :id="'circle' + index">
              <span>{{ menu.key }}</span>
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MenuItem {
  key: any
  src: string
  // メニュー項目の他のプロパティをここに追加
}

const props = defineProps<{
  msg?: string
  menus?: MenuItem[]
}>()

const show = ref(true)

const appear = (itemId: string, delay: number) => {
  setTimeout(() => {
    const item = document.getElementById(itemId)
    item?.classList.add('appear')
  }, delay)
}

onMounted(() => {
  const items = document.querySelectorAll('.circle p')
  items.forEach((item, index) => {
    appear(item.id, 300 * index)
  })
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$R: 15vh;
.circle_container {
  @include totalWidth($R, 3, 0.25);
  margin: 0 auto;
  padding: 0;
  .circle {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    p {
      margin: 0;
      padding: 0;
      width: $R;
      height: $R;
      color: $color_invert;
      text-align: center;
      background: black;
      border-radius: 50%;
      transform-origin: 50% 50%;
      opacity: 0;
      //transition: width ease-in 0.6s, height ease-in 1s, filter linear 2s;
      &.appear {
        animation: bounce-in 0.75s ease-in 0s 1 normal forwards;
      }
      span {
        position: relative;
        display: inline-block;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
    filter: blur(0);
    opacity: 0;
  }
  25% {
    transform: scale(1.5);
    filter: blur(5px);
  }
  75% {
    transform: scale(2);
    filter: blur(10px);
  }
  100% {
    transform: scale(1);
    filter: blur(0);
    opacity: 1;
  }
}
</style>
