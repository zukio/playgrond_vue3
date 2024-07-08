<!-- 画面遷移コンポーネントリスト：親から呼び出された番号のみ表示する -->
<template>
  <div>
    <Transit01 v-show="matchShowNo(1)" :show="matchShowNo(1)" @postShowNo="recievedShowNo" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Transit01 from '@/components/transition/TransitionS01.vue'

const props = defineProps<{
  transitShow: boolean
  transitPatturn: number
}>()

const emit = defineEmits<{
  (e: 'PostShowNo', value: number): void
  (e: 'PostTransitVariations', value: number): void
}>()

const showNo = ref(0)

const matchShowNo = computed(() => {
  return (value: number) => props.transitShow && showNo.value === value
})

const recievedShowNo = (value: number) => {
  showNo.value = value
  emit('PostShowNo', showNo.value)
}

watch(
  () => props.transitShow,
  (newValue) => {
    if (!newValue) {
      showNo.value = 0
    } else {
      showNo.value = props.transitPatturn
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Vue 3では$childrenが削除されたため、代替方法を使用
  const transitionComponents = [Transit01]
  emit('PostTransitVariations', transitionComponents.length)
})

defineExpose({
  recievedShowNo
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
