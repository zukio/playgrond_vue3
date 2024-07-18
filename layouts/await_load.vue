<template>
  <div>
    <LockLoading v-if="lockStatus" :timeoutDuration="60000"></LockLoading>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useLockScreen } from "@/composables/useLockScreen";
// ===============================================
// layout: 読み込み完了を待機
// ===============================================
// data
const props = defineProps({
  headerTitle: {
    type: String,
    default: "Default Title",
  },
});
const status = {
  current: ref(0), // 現在のステータス // 0は初期状態
  loaded: 1,
};
// -----------------------------------------------
// computed
// ページ崩れを防ぐために、レイアウト読込完了を待つ
const lockStatus = computed(() => {
  return useLockScreen().getLockStatus();
});
// -----------------------------------------------
// method
function onRendered() {
  status.current.value = status.loaded;
  console.log("next");
  useLockScreen().setPageLock(false);
}
// -----------------------------------------------
// LifeCycle
onMounted(() => {
  // 読み込みロックScreen
  nextTick(() => {
    onRendered();
  });
});
// -----------------------------------------------
// Meta
// definePageMeta {} はPagesで使用
useHead({
  title: props.headerTitle ? `${props.headerTitle} (${layoutName})` : layoutName,
});
</script>

<style lang="scss" scoped></style>
