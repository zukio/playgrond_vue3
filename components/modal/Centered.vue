<template>
  <div class="modal fade" tabindex="-1" aria-hidden="true" ref="modalElement">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-top">
        <!--div class="modal-header" v-if="$slots.header">
            <slot name="header"></slot>
          </div-->
        <div class="modal-body text-center">
          <div class="mt-3 mb-5 text-black">
            <h3>{{ title }}</h3>
            <p style="white-space: pre-wrap">{{ description }}</p>
          </div>
          <slot name="image"></slot>
          <slot name="button"></slot>
        </div>
        <!--div class="modal-footer" v-if="$slots.footer">
            <div class="mt-2 mb-5">
              <slot name="footer"></slot>
            </div>
          </div-->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from "nuxt/app";
import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

const { $bootstrap }: any = useNuxtApp();

interface Props {
  id: string;
  title: string;
  description: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: "modal-centered",
  title: "modal-centered",
  description: "",
});

const modalElement: Ref<HTMLElement | null> = ref(null);
const modal: Ref<any> = ref(null);

const toggle = () => modal.value?.toggle();
const show = () => modal.value?.show();
const hide = () => modal.value?.hide();
const dispose = () => modal.value?.dispose();

defineExpose({
  toggle,
  show,
  hide,
  dispose,
});

onMounted(() => {
  try {
    if (modalElement.value) {
      modal.value = new $bootstrap.Modal(modalElement.value, {
        keyboard: false,
      });
    }
  } catch (error) {
    console.error("Error initializing modal:", error);
  }
});

onUnmounted(() => {
  if (modal.value) {
    modal.value.dispose();
  }
});
</script>

<style scoped lang="scss">
/* カルーセル内のモーダル用カスタムスタイル */
.modal {
  width: 100% !important;
  max-width: 100svw;
  left: auto !important;
  // z-index: 10 !important;
}

.modal-dialog.modal-dialog-centered {
  .modal-header,
  .modal-footer {
    border: none;
  }
}
.modal-body {
  img {
    display: inline-block;
    padding: 30px;
  }
}
</style>
