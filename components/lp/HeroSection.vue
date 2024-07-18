<!-- HeroSection.vue -->
<template>
  <section id="hero" class="text-center">
    <slot name="header" />
    <div class="overlay">
      <h1 class="catchphrase">{{ catchphrase }}</h1>
      <p class="sub-catchphrase">{{ subCatchphrase }}</p>
    </div>
    <div class="hero-section">
      <!-- 
      <img
        :src="visualImage"
        alt="メインビジュアル"
      /><br />-->
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
const catchphrase = "Embark on a New Adventure\nwith a Digital Pictute Book!";
const subCatchphrase = "ジャイロ機能を使ったラビリンスボールゲームが楽しめる";
const config = useRuntimeConfig();

const visualImage = `${config.public.baseUrl}images/header/Cover.png`;
</script>

<style scoped>
#hero {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
  background: url("/images/header/Cover-bg.png") no-repeat top center/contain;
  background-color: #858fb3;
  padding: 0;
  margin: 0;
}

.hero-section {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  bottom: 0;
  background: url("/images/header/Cover.png") no-repeat bottom center/cover;
  z-index: 1;
}

.hero-section img {
  width: 80%;
  height: auto;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, 0%);
  text-align: center;
  z-index: 3;
  width: 80%;
}
.catchphrase {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: rgba(7, 37, 116, 0.8) 1px 0 10px;
  white-space: pre-wrap;
}
.sub-catchphrase {
  padding: 0;
  white-space: pre-wrap;
}
</style>
