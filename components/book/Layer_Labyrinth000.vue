<template>
  <div class="m-0 p-0 w-100 h-100">
    <Transition name="fade" mode="out-in">
      <div v-if="modalVisible" class="info" ref="modalElement">
        <div class="modal-content rounded">
          <div class="modal-body text-center">
            <div class="mt-3 mb-5 text-black">
              <h3 class="fw-semibold">{{ title }}</h3>
              <p style="white-space: pre-wrap">{{ description }}</p>
            </div>
            <slot name="image"></slot>
            <slot name="button"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, onUnmounted } from "vue";
import gsap from "gsap";

// ===============================================
// components: レイヤー | loading spinner
// ===============================================
// props // 親コンポーネントから継承した値
interface Props {
  title: string;
  description: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "string",
  description: "string",
});

// emit // 親コンポーネントとの連絡用
const emit = defineEmits(["onContinue"]);
// -----------------------------------------------
// data
const modalElement: Ref<HTMLElement | null> = ref(null);
const modalVisible: Ref<boolean> = ref(false);

const toggle = () => {
  modalVisible.value = !modalVisible.value;
};
const show = () => {
  modalVisible.value = true;
};
const hide = () => {
  modalVisible.value = false;
};
const dispose = () => {
  if (ctx) ctx.revert(); // <- Easy Cleanup!
  modalVisible.value = false;
};
// -----------------------------------------------
// gsap
let tl: gsap.core.Timeline;
let ctx: gsap.Context;
const gsapCanvas = ref<HTMLElement | null>(null);
function tween() {
  tl.play();
}
// -----------------------------------------------
// LifeCycle
onMounted(() => {
  if (ctx) ctx.revert();
  if (!gsapCanvas.value) return;
});

onUnmounted(() => {
  if (ctx) ctx.revert(); // <- Easy Cleanup!
});

defineExpose({
  toggle,
  show,
  hide,
  dispose,
  tween,
});
</script>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  // left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
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
  background-color: aliceblue;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  padding: 30px;
}
</style>
