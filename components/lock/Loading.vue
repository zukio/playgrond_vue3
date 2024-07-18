<template>
  <div
    class="lockScreen w-100 h-100 center-center"
    :class="showing ? 'd-none' : ''"
    id="lockScreen"
    ref="lockScreen"
    tabindex="-1"
  >
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===============================================
// components: レイヤー | loading spinner
// ===============================================
// props // 親コンポーネントから継承した値
interface Props {
  timeoutDuration: number;
}
const props = withDefaults(defineProps<Props>(), {
  // タイムアウト時間を設定（例: 10秒）
  timeoutDuration: 10000, // ミリ秒
});

// emit // 親コンポーネントとの連絡用
// const emit = defineEmits([
//   "onInvoke"
// ]);
// -----------------------------------------------
// method // @click
// const relayClick = function ($event:Event) {
//   console.log("クリックされました", $event.type);
//   emit("onInvoke", $event);
// };
// -----------------------------------------------
// data
// タイムアウトタイマーIDを保存するためのリファレンス
const timeoutId = ref<NodeJS.Timeout | null>(null);
// -----------------------------------------------
// computed
const showing = computed(() => {
  return !useLockScreen().getLockStatus();
});
watch(showing, (val, oldVal) => {
  if (oldVal && !val) {
    clearLoadingTimeout();
  }
});
// -----------------------------------------------
// method
// タイムアウト処理を実装
function checkLoadingTimeout() {
  // 既存のタイマーがあればキャンセル
  clearLoadingTimeout();
  // 新しいタイムアウトを設定
  timeoutId.value = setTimeout(() => {
    if (useLockScreen().getLockStatus()) {
      // データがまだ読み込まれていない場合はエラーメッセージを表示
      console.log("データの読み込みに時間がかかっています。後ほど再度お試しください。");
      alert("データの読み込みに時間がかかっています。後ほど再度お試しください。");
      // ロック解除
      useLockScreen().setPageLock(false);
      useRouter().push({ path: "/" });
    }
    clearLoadingTimeout();
  }, props.timeoutDuration); // 例: 10秒後
}
function clearLoadingTimeout() {
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value);
  }
}
// -----------------------------------------------
// 親コンポーネントから参照できる様エクスポーズ
// defineExpose({
//   show
// });
// -----------------------------------------------
//Event:LifeCycle Mounted
onMounted(async () => {
  // タイムアウトチェックを開始
  checkLoadingTimeout();
});
onUnmounted(() => {
  clearLoadingTimeout();
});
</script>

<style lang="scss" scoped>
.lockScreen {
  //display: flex;
  //position: fixed;
  position: fixed;
  top: 0;
  left: 0;
  min-width: 100%;
  min-height: 100%;
  background-color: rgba($color: #000000, $alpha: 0.3);
  z-index: 999;
  transition: opacity 1s ease;
  opacity: 1;
  //pointer-events: none;
}
.lockScreen.d-none {
  opacity: 0;
}
</style>
