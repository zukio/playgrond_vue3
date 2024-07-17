<template>
  <div class="w-100 text-white">
    <button @click="startTutorial">チュートリアル開始</button>
    <Tooltip
      v-if="showTooltip"
      :title="currentStep.title"
      :content="currentStep.content"
      @close="nextStep"
    />
    <a to="carousel">Transit Test</a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import Tooltip from '@/components/tooltip/Gsap.vue'
const showTooltip = ref(false)
const currentStepIndex = ref(0)
const steps = [
  { title: 'ステップ1', content: 'これは最初のステップです。' },
  { title: 'ステップ2', content: 'これは次のステップです。' }
  // さらにステップを追加できます
]
const currentStep = computed(() => steps[currentStepIndex.value])
function startTutorial() {
  currentStepIndex.value = 0
  showTooltip.value = true
}
function nextStep() {
  currentStepIndex.value++
  if (currentStepIndex.value >= steps.length) {
    showTooltip.value = false
  } else {
    showTooltip.value = false
    nextTick(() => {
      showTooltip.value = true
    })
  }
}
</script>
