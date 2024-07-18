<template>
  <span :data-bs-toggle="'tooltip'" :title="title" :data-bs-placement="placement" ref="tooltipRef">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Tooltip } from 'bootstrap'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    default: 'top'
  }
})

const tooltipRef = ref(null)
let tooltipInstance: Tooltip | null = null

onMounted(() => {
  if (tooltipRef.value) {
    tooltipInstance = new Tooltip(tooltipRef.value)
  }
})

onBeforeUnmount(() => {
  if (tooltipInstance) {
    tooltipInstance.dispose()
  }
})
</script>
