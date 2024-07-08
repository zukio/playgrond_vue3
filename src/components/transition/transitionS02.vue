<template>
  <transition>
    <div class="transition" v-if="show">
      <div class="drop"></div>
      <div class="crown"></div>
      <ul class="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
  </transition>
</template>

<script>
export default {
  components: {},
  props: {
    show: Boolean
  },
  data() {
    return {
      showState: 0
    }
  },
  computed: {},
  methods: {
    setShowState(state, delay) {
      const vueApp = this
      setTimeout(function () {
        vueApp.showState = state
      }, delay)
    }
  },
  watch: {
    show: {
      immediate: true, // trueの場合、初期読み込み時にも呼び出します
      //immediateのコールバック
      handler: function (newValue) {
        //console.warn(newValue)
        if (!newValue) {
          //reset
          this.setShowState(100, 0)
        } else {
          //start
          this.setShowState(1, 1000)
        }
      }
    },
    showState: function (newValue) {
      switch (newValue) {
        case 1:
          $('.circles').addClass('start')
          this.setShowState(3, 2000)
          break
        case 3:
          this.$emit('setShowNo', 0)
          break
        default: {
          $('.circles').removeClass('start')
          break
        }
      }
    }
  },
  mounted: function () {
    //this.setShowState(1, 1000)
  }
}
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

/* ------------ 中身 ------------ */
ul.circles {
  position: absolute;
  display: block;
  width: 250vh;
  height: 250vh;
  transform: translate(-50% -50%);
  z-index: 105;
  &.start {
    li {
      transform: scale(1);
      &:nth-child(1) {
        opacity: 0;
      }
      &:nth-child(2) {
        opacity: 0;
        border-width: 0;
      }
      &:nth-child(4) {
        border-width: 10vh;
      }
    }
  }
  li {
    position: absolute;
    display: inline-block;
    box-sizing: border-box;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transform: scale(0);
    transform-origin: center center;

    &:nth-child(1) {
      background: white;
      border: $info solid 200px;
      transition:
        transform ease-out 0.5s 0.5s,
        border-width ease-out 0.5s 0.5s,
        opacity linear 0.1s 1s;
      z-index: 106;
    }
    &:nth-child(2) {
      background: $dark;
      transition:
        transform ease-out 0.75s 0.75s,
        opacity linear 0.25s 1.25s;
      z-index: 107;
    }
    &:nth-child(3) {
      border: yellowgreen solid 200px;
      transition: transform ease-out 1s 1s;
      z-index: 109;
    }
    &:nth-child(4) {
      border: green solid 100vh;
      transition:
        transform ease-out 0.5s 1s,
        border-width ease-out 1s 1s;
      z-index: 108;
    }
  }
}
/* ------------ しずく ------------ */
div.drop {
  position: absolute;
  top: 0;
  width: 100vw;
  height: 100vh;
  border-radius: 0 0 0 0;
  transform: rotate(0);
  margin: 0px;
  background: $info;
  animation: drip 1.5s forwards;
}
@keyframes drip {
  30% {
    top: 0;
    width: 10vh;
    height: 10vh;
    border-radius: 0 100% 100% 100%;
    transform: rotate(45deg);
  }
  99% {
    top: 50%;
    width: 5vh;
    height: 5vh;
    border-radius: 100% 100% 100% 100%;
    transform: rotate(45deg);
    opacity: 1;
  }
  100% {
    top: 50%;
    width: 5vh;
    height: 5vh;
    border-radius: 100% 100% 100% 100%;
    opacity: 0;
  }
}
/* ------------ しずく装飾 ------------ */
.crown {
  position: relative;
  top: 25px;
  z-index: 106;
  width: 1px;
  height: 1px;
  border-radius: 50%;
  opacity: 0;
  animation: crown 1.35s ease-in-out 1.2s 1 forwards;
}

@keyframes crown {
  0% {
    transform: scale(0.1), translateY(60%);
    opacity: 1;
    border: dotted 50px black;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    width: 50vh;
    height: 50vh;
    transform: scale(2);
    opacity: 0;
    border: dotted 50px black;
  }
}
</style>
