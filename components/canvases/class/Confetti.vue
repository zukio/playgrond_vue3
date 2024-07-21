<template></template>

<script lang="ts">
import { ref, onUnmounted } from "vue";

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

class ConfettiSystem {
  private confetti: Confetti[] = [];
  private colors = [
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
  private baseSpeed: number;
  private speedRange: number;
  private fadeOut: boolean;
  private canvas: HTMLCanvasElement | null = null;

  constructor(baseSpeed = 2, speedRange = 3, fadeOut = false) {
    this.baseSpeed = baseSpeed;
    this.speedRange = speedRange;
    this.fadeOut = fadeOut;
  }

  setConfettiCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  private createConfetti(): Confetti | null {
    if (!this.canvas) return null;

    return {
      x: Math.random() * this.canvas.width,
      y: -20,
      size: Math.random() * 10 + 5,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      speed: this.baseSpeed + Math.random() * this.speedRange,
      angle: Math.random() * Math.PI * 2,
      rotation: 0,
      rotationSpeed: Math.random() * 0.2 - 0.1,
      opacity: 1,
    };
  }

  addConfetti(amount: number = 100) {
    for (let i = 0; i < amount; i++) {
      const newConfetti = this.createConfetti();
      if (newConfetti) {
        this.confetti.push(newConfetti);
      }
    }
  }

  updateAndDraw(ctx: CanvasRenderingContext2D) {
    if (!this.canvas) return;

    this.confetti = this.confetti.filter((c) => {
      this.updateConfetti(c);
      this.drawConfetti(ctx, c);
      return c.y <= this.canvas!.height && c.opacity > 0;
    });
  }

  private updateConfetti(confetti: Confetti) {
    confetti.y += confetti.speed;
    confetti.x += Math.sin(confetti.angle) * 0.5;
    confetti.rotation += confetti.rotationSpeed;

    if (this.fadeOut) {
      confetti.opacity -= 0.005;
      if (confetti.opacity <= 0) confetti.opacity = 0;
    }
  }

  private drawConfetti(ctx: CanvasRenderingContext2D, confetti: Confetti) {
    ctx.save();
    ctx.translate(confetti.x, confetti.y);
    ctx.rotate(confetti.rotation);
    ctx.fillStyle = confetti.color;
    ctx.globalAlpha = confetti.opacity;
    ctx.fillRect(-confetti.size / 2, -confetti.size / 2, confetti.size, confetti.size);
    ctx.restore();
  }

  setSpeed(newBaseSpeed: number, newSpeedRange: number) {
    this.baseSpeed = newBaseSpeed;
    this.speedRange = newSpeedRange;
  }

  isActive(): boolean {
    return this.confetti.length > 0;
  }
}

export function useConfetti() {
  const confettiSystem = ref<ConfettiSystem | null>(null);

  function initConfetti(baseSpeed = 2, speedRange = 3, fadeOut = false) {
    confettiSystem.value = new ConfettiSystem(baseSpeed, speedRange, fadeOut);
  }

  function setConfettiCanvas(canvas: HTMLCanvasElement) {
    if (confettiSystem.value) {
      confettiSystem.value.setConfettiCanvas(canvas);
    } else {
      console.warn("Confetti system not initialized. Call initConfetti first.");
    }
  }

  function triggerConfetti(amount = 100) {
    confettiSystem.value?.addConfetti(amount);
  }

  function updateAndDrawConfetti(ctx: CanvasRenderingContext2D) {
    confettiSystem.value?.updateAndDraw(ctx);
  }

  onUnmounted(() => {
    confettiSystem.value = null;
  });

  return {
    initConfetti,
    setConfettiCanvas,
    triggerConfetti,
    updateAndDrawConfetti,
    isConfettiActive: () => confettiSystem.value?.isActive() ?? false,
  };
}
</script>
