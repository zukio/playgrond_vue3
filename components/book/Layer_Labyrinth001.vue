<template>
  <div class="m-0 p-0 w-100 h-100">
    <div v-if="failed" class="info">
      <div class="modal-content rounded">
        <div class="modal-body text-center">
          <div class="mt-3 mb-5 text-black">
            <h3>{{ title }}</h3>
            <p style="white-space: pre-wrap">{{ description }}</p>
          </div>
          <img :src="illustPath001" alt="shuzo" width="300" height="auto" />
          <div>
            <button class="btn btn-dark me-2" @click="($event) => emit('onContinue', false)">まんぞく</button>
            <button class="btn btn-warning fw-bold" @click="($event) => emit('onContinue', true)">
              あきらめない！
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="succeed" class="info">
      <h3 class="text-center" style="white-space: pre-wrap">まっち と であえた！</h3>
      <img :src="illustPath001" alt="shuzo" width="300" height="auto" />
      <div>
        <button class="btn btn-dark" @click="($event) => emit('onContinue', false)">つぎはぼっちだ</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import illustPath001 from "@/assets/images/labyrinth/unevencircle002.png";

// ===============================================
// components: レイヤー | loading spinner
// ===============================================
// props // 親コンポーネントから継承した値
interface Props {
  succeed: boolean;
  failed: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  succeed: false,
  failed: false,
});

// emit // 親コンポーネントとの連絡用
const emit = defineEmits(["onContinue"]);
// -----------------------------------------------
// data
const config = useRuntimeConfig();
const baseUrl = config ? config.public.baseUrl : "/";
const lottery = [
  {
    msg: "100回叩くと壊れる壁があったとする。\nでもみんな何回叩けば壊れるかわからないから、90回まで来ていても途中であきらめてしまう。",
    name: "ぜったいに ささない はち",
    src: `${baseUrl}images/DigitalBook_maze_01_0708.png`,
  },
  {
    msg: "勝ち負けなんか、ちっぽけなこと。\n大事なことは、本気だったかどうかだ！",
    name: "おしゃれな ありんこ",
  },
  {
    msg: "ベストを尽くすだけでは勝てない。\n僕は勝ちにいく。",
    name: "ちいさな くじら",
  },
  {
    msg: "いまの僕には勢いがある",
    name: "みみ の ながい ねこ",
  },
  {
    msg: "ミスをすることは悪いことじゃない。\nそれは上達するためには必ず必要なもの。\nただし、同じミスはしないこと。",
    name: "けむくじゃら の いぬ",
  },
  {
    msg: "予想外の人生になっても、そのとき、幸せだったらいいんじゃないかな。",
    name: "まるい しっぽ の くま",
  },
];
const randomLottery = computed(() => {
  const randomIndex = Math.floor(Math.random() * lottery.length);
  return lottery[randomIndex];
});
const title = "まっち と であえなかった";
const description = computed(() => {
  return randomLottery.value.msg;
});
import IllustPath001 from "@/assets/images/labyrinth/unevencircle002.png";
// -----------------------------------------------
// LifeCycle
onMounted(() => {});
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(113, 114, 109, 0.7);
  animation: slideinTopDown 0.3s ease-in-out;
  text-align: center;
  touch-action: auto;
}

@keyframes slideinTopDown {
  0% {
    transform: translateY(-100vh);
  }
  100% {
    transform: translateY(0);
  }
}
/* カルーセル内のモーダル用カスタムスタイル */
.modal-content {
  margin: auto;
  width: auto;
  max-width: calc(100svw - 2rem); /* 左右に少し余白を持たせる */
  background-color: #e3e3da;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  padding: 30px;
}
</style>
