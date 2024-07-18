<template>
  <div>
    <h1>Tooltip Example</h1>
    <ClientOnly>
      <BootstrapTooltip title="This is a tooltip!">
        <button class="btn btn-primary">Hover me</button>
      </BootstrapTooltip>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import BootstrapTooltip from "@/components/tooltip/Bootstrap.vue";
</script>
