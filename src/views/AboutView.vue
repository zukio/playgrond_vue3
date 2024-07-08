<template>
  <div class="about">
    <DrumMachine />

    <div class="listContainer">
      <h3>{{ medialistactive.head }}</h3>
      <p>{{ medialistactive.text }}</p>

      <b-popover target="medialist-container" triggers="hover" placement="right">
        <!--template #title>Popover Title</template-->
        このリストの内容は<b-link
          href="https://docs.google.com/spreadsheets/d/150KG8Hqy5tASWoV_jhFYy2DvS0MXldQ5p-jgXI9Md7s/edit?usp=sharing"
          target="new"
          >Googleスプレッドシート</b-link
        >をデータベースAPIとして取得しています。
      </b-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCounterStore } from '@/stores/counter'
import DrumMachine from '@/components/play/DrumMachine.vue'

const props = defineProps<{
  // show: boolean
}>()

const store = useCounterStore()

const medialist = ref()

const medialistactive = ref({
  index: 0,
  head: 'Demos',
  text: 'このリストの内容はGoogleスプレッドシートをデータベースAPIとして取得しています。表示されない場合はネットワーク環境をご確認ください。'
})

const recievedData = computed(() => store.demoData)

// const transitShow = computed(() => transitPatturnNo.value !== 0)

//const backgroundColor = (index: number) => {
//  const array = ['211, 97, 21', 'darkorange']
//  return array[index]
//}

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

onUnmounted(() => {
  // medialist.value.clearListData()
  window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ')')
  })
})

defineExpose({
  recievedMedialistactive
})
</script>

<style lang="scss" scoped>
.about {
  height: 100%;

  .listContainer {
    position: absolute;
    max-width: 640px;
    margin: 0 5vw;
    text-align: left;
    bottom: 30px;
    box-sizing: border-box;
  }
}
</style>
