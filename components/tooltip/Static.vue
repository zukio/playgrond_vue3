<template>
  <div class="custom-tooltip-wrapper" :style="cssVars">
    <slot></slot>
    <div :class="['custom-tooltip', 'tooltip-inner', placement]">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

const props = defineProps<{
  title: string;
  placement: "top" | "bottom" | "left" | "right";
  bgColor?: string;
  textColor?: string;
}>();

const cssVars = computed(() => ({
  "--tooltip-bg-color": props.bgColor || "#fde047",
  "--tooltip-text-color": props.textColor || "black",
}));
</script>

<style scoped lang="scss">
$tooltip-bg-color: #fde047;
$tooltip-text-color: black;
$tooltip-font-size: 0.875rem;
$tooltip-border-radius: 50%;
$tooltip-padding: 10px;
$arrow-size: 5px;

.custom-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.custom-tooltip {
  position: absolute;
  z-index: 1070;
  display: block;
  margin: 0;
  font-family: var(--bs-font-sans-serif);
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  white-space: nowrap;
  line-break: auto;
  font-size: $tooltip-font-size;
  word-wrap: normal;
  opacity: 1;

  &.tooltip-inner {
    padding: $tooltip-padding !important;
    border-radius: $tooltip-border-radius !important;
    background-color: $tooltip-bg-color !important;
    color: $tooltip-text-color !important;
    font-weight: 500;
  }

  &.top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: $arrow-size;
  }

  &.bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: $arrow-size;
  }

  &.left {
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    margin-right: $arrow-size;
  }

  &.right {
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    margin-left: $arrow-size;
  }

  // 矢印のスタイル
  &::before {
    position: absolute;
    content: "";
    border-style: solid;
  }

  &.top::before {
    bottom: -$arrow-size;
    left: 50%;
    transform: translateX(-50%);
    border-width: $arrow-size $arrow-size 0;
    border-color: $tooltip-bg-color transparent transparent transparent;
  }

  &.bottom::before {
    top: -$arrow-size;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 $arrow-size $arrow-size;
    border-color: transparent transparent $tooltip-bg-color transparent;
  }

  &.left::before {
    top: 50%;
    right: -$arrow-size;
    transform: translateY(-50%);
    border-width: $arrow-size 0 $arrow-size $arrow-size;
    border-color: transparent transparent transparent $tooltip-bg-color;
  }

  &.right::before {
    top: 50%;
    left: -$arrow-size;
    transform: translateY(-50%);
    border-width: $arrow-size $arrow-size $arrow-size 0;
    border-color: transparent $tooltip-bg-color transparent transparent;
  }
}
</style>
