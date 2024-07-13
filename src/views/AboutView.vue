<template>
  <div class="m-0 p-0">
    <DrumMachine />
    <MediaList :interval="1000" adjustingColor="blue" ref="medialist" />
    <div class="listContainer">
      <h3>{{ medialistactive.head }}</h3>
      <p>{{ medialistactive.text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCounterStore } from '@/stores/counter'
import DrumMachine from '@/components/play/DrumMachine.vue'
import MediaList from '@/components/MediaList.vue'

const props = defineProps<{
  //
}>()

const store = useCounterStore()

const medialist = ref()

const medialistactive = ref({
  index: 0,
  head: 'Demos',
  text: 'このリストの内容はGoogleスプレッドシートをデータベースAPIとして取得しています。表示されない場合はネットワーク環境をご確認ください。'
})

const recievedData = computed(() => {
  //store.demoData
  return null
})

const recievedMedialistactive = (input: any) => {
  medialistactive.value = input
}

watch(recievedData, (newValue) => {
  if (newValue) {
    medialist.value.setListData(newValue)
    medialistactive.value = newValue[1]
  }
})

onMounted(() => {
  if (recievedData.value) {
    medialist.value.setListData(recievedData.value)
    medialistactive.value = recievedData.value[1]
  }
})

defineExpose({
  recievedMedialistactive
})
</script>

<style lang="scss" scoped>
.listContainer {
  position: absolute;
  max-width: 640px;
  margin: 0 5vw;
  text-align: left;
  bottom: 30px;
  box-sizing: border-box;
}
</style>
