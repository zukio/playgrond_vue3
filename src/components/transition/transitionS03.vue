<template>
  <transition>
    <div class="transition">
      <h2 class="text-white">transit {{ show }}{{ showState }}</h2>
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
  name: 'Transit',
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
          this.setShowState(0, 0)
        } else {
          //start
          //this.setShowState(1, 500)
        }
      }
    },
    showState: function (newValue) {
      switch (newValue) {
        case 1:
          $('.trans-container').css({ transform: 'rotate(45deg)' })
          this.setShowState(1.5, 500)
          break
        case 1.5:
          $('.trans-container').css({ transform: 'rotate(90deg)' })
          this.setShowState(2, 500)
          break
        case 2:
          $('.trans-container').css({ transform: 'rotate(180deg)' })
          this.setShowState(3, 1000)
          break
        case 3:
          this.$emit('setShowNo', 0)
          break
        default: {
          $('.trans-container').css({ transform: 'rotate(0)' })
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

/* ------------ slideIn ------------ */

// 表示前
.slideIn-enter {
  transform: scaleX(0);
}
// 表示中
.slideIn-enter-active {
  transition: all 1s;
  transform-origin: right center;
}
// 表示後
.slideIn-enter-to {
  transform: scaleX(1);
}
// 非表示前
.slideIn-leave {
  transform: scaleX(1);
}
// 非表示中
.slideIn-leave-active {
  transition: all 1s;
  transform-origin: left center;
}
// 非表示後
.slideIn-leave-to {
  transform: scaleX(0);
}

/* ------------ 中身 ------------ */
ul.circles {
  position: absolute;
  display: block;
  width: 250vh;
  height: 250vh;
  transform: translate(-50% -50%);
  z-index: 105;
  &:hover {
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
        //background-size: 100% 100%;
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
      background: black;
      border: white solid 200px;
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
.trans-container {
  position: absolute;
  //display: flex;
  // left: -50vw;
  // top: -150vh;
  // width: 200vw;
  // height: 400vh;
  width: 100%;
  height: 100%;
  transition: all 1s;
  background-color: black;
  //transform-origin: left center;
  //animation: fadeOut 1s ease 2s 1 normal forwards;
  @keyframes fadeOut {
    0% {
      background-color: rgba(0, 0, 0, 1);
    }
    100% {
      background-color: rgba(0, 0, 0, 0);
    }
  }

  .layer01 {
    position: absolute;
    z-index: 102;
    width: 40%;
    height: 40%;
    transition: all 1s;
    --value: 20%;
    background: linear-gradient(
        45deg,
        rgba($dark, 1),
        rgba($dark, 1) var(--value),
        rgba($dark, 0) var(--value)
      ),
      linear-gradient(
        135deg,
        rgba($dark, 1),
        rgba($dark, 1) var(--value),
        rgba($dark, 0) var(--value)
      ),
      linear-gradient(
        225deg,
        rgba($dark, 1),
        rgba($dark, 1) var(--value),
        rgba($dark, 0) var(--value)
      ),
      linear-gradient(
        315deg,
        rgba($dark, 1),
        rgba($dark, 1) var(--value),
        rgba($dark, 0) var(--value)
      );
    background-position: center center;
    background-repeat: no-repeat;
    background-size: 1% 1%;
    //border: white solid 100px;
    //border-radius: 50%;
    //-webkit-clip-path: inset(20px);
    //clip-path: inset(200px);
    //clip-path: ellipse(45% 30% at 50% 50%);
    //transform-origin: left bottom;
    //
    //animation: leftIn 3s ease-out 0s 1 normal forwards;
    &:hover {
      background-size: 100% 100%;
      //--value: 20%;
      //animation: leftIn 2s ease 0s 1 normal forwards;
    }
    @keyframes leftIn {
      0% {
        --value: 50%;
      } //0
      33%,
      66% {
        //transform: scale(1, 1);
      } //1-2
      100% {
        --value: 20%;
      } //3
    }
  }
  .layer02 {
    position: absolute;
    z-index: 101;
    width: 100%;
    height: 100%;
    mask-image: url(#mask);
    //mask-mode: alpha;
    mask-mode: luminance;

    //animation: rightIn 2.5s ease-out 0.5s 1 normal both;
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

/* ------------ slideIn ------------ */
// 表示前
.effect-enter {
  transform: scaleX(0);
}
// 表示中
.effect-enter-active {
  transition: all 1s;
  transform-origin: right center;
}
// 表示後
.effect-enter-to {
  transform: scaleX(1);
}
// 非表示前
.effect-leave {
  transform: scaleX(1);
}
// 非表示中
.effect-leave-active {
  transition: all 1s;
  transform-origin: left center;
}
// 非表示後
.effect-leave-to {
  transform: scaleX(0);
}
</style>
