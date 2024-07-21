<template></template>

<script setup lang="ts">
import { inject, watch, defineProps, onUnmounted } from "vue";

const props = defineProps<{
  //width: number;
  //height: number;
}>();

const provider = inject("provider") as {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
};

let animationFrameId: number | null = null;
const confetties: Array<Confetti> = [];

interface Confetti {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const colors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
];
const fadeOutOption = false;

const getParentSize = () => {
  const parentElement = provider.canvas.parentElement;
  const parentWidth = parentElement ? parentElement.clientWidth : window.innerWidth;
  const parentHeight = parentElement ? parentElement.clientHeight : window.innerHeight;
  return { parentWidth, parentHeight };
};

function createConfetti(): Confetti {
  const canvas = provider.canvas;
  const baseSpeed = 1; // デフォルト値は2
  const speedRange = 3; // デフォルト値は3
  return {
    x: Math.random() * canvas.width,
    y: -20,
    size: Math.random() * 10 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: baseSpeed + Math.random() * speedRange,
    angle: Math.random() * Math.PI * 2,
    rotation: 0,
    rotationSpeed: Math.random() * 0.2 - 0.1,
    opacity: 1,
  };
}

function drawConfetti(ctx: CanvasRenderingContext2D, confetti: Confetti) {
  ctx.save();
  ctx.translate(confetti.x, confetti.y);
  ctx.rotate(confetti.rotation);
  ctx.fillStyle = confetti.color;
  ctx.globalAlpha = confetti.opacity;
  ctx.fillRect(-confetti.size / 2, -confetti.size / 2, confetti.size, confetti.size);
  ctx.restore();
}

function updateConfetti(confetti: Confetti) {
  confetti.y += confetti.speed;
  confetti.x += Math.sin(confetti.angle) * 0.5;
  confetti.rotation += confetti.rotationSpeed;

  if (fadeOutOption) {
    confetti.opacity -= 0.005; // Adjust this value to control fade out speed
    if (confetti.opacity <= 0) {
      confetti.opacity = 0;
    }
  }
  const canvas = provider.canvas;
  if (confetti.y > canvas.height ?? (window.innerHeight || confetti.opacity <= 0)) {
    const index = confetties.findIndex((c) => c === confetti);
    confetties.splice(index, 1);
  }
}

function animate() {
  const canvas = provider.canvas;
  const ctx = provider.context;
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const c of confetties) {
    drawConfetti(ctx, c);
    updateConfetti(c);
  }

  if (confetties.length > 0) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    animationFrameId = null;
  }
}

function startConfetti(amount: number = 100) {
  for (let i = 0; i < amount; i++) {
    confetties.push(createConfetti());
  }
  if (!animationFrameId) {
    animate();
  }
}
// -----------------------------------------------
// Event handlers
watch(
  provider,
  () => {
    if (provider.canvas) {
      startConfetti();
    }
  },
  { immediate: true }
);

// -----------------------------------------------

// Expose the startConfetti method to parent components
defineExpose({ startConfetti });

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
canvas {
  border: 1px solid #ccc;
}
</style>
