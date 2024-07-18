<template>
  <div class="container">
    <section id="book-intro">
      <h2 class="title h1">デジタル絵本タイトル</h2>
      <p class="description">
        デジタル絵本の概要や説明を記述します。この絵本は素晴らしい内容で、子供から大人まで楽しめる作品です。クリックすると作品を始められます。
      </p>
    </section>
    <section id="contents">
      <div
        v-if="!isFullScreenVisible"
        class="poster-container"
        :class="{ 'fullscreen': fullScreen }"
        @click="showFullScreen()"
        style="background: url(&quot;/images/dammy_bookcover.webp&quot;) no-repeat center center/cover"
      >
        <img src="/images/player/play.png" alt="Play" class="play-btn" />
      </div>
      <div v-if="fullScreen" class="full-screen" @click.self="closeFullScreen()">
        <iframe src="slide-by-side" frameborder="0" scrolling="no"> </iframe>
      </div>
    </section>
    <section id="usage-guide">
      <h3>あそびかた</h3>
      <p class="description">
        デジタル絵本の使い方を説明します。この絵本は素晴らしい内容で、子供から大人まで楽しめる作品です。クリックすると作品を始められます。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import HeaderSection from "@/components/lp/HeaderSection.vue";
// import bookFrame from "@/pages/slide-by-side.vue";

const isFullScreenVisible = ref(false);
const fullScreen = ref(false);
const timmerId: any = ref(null);
const timeout: number = 1000;
// -----------------------------------------------
// method
function showFullScreen() {
  fullScreen.value = true;
  timmerId.value = setTimeout(() => {
    isFullScreenVisible.value = true;
  }, timeout);
}

function closeFullScreen() {
  isFullScreenVisible.value = false;
  timmerId.value = setTimeout(() => {
    fullScreen.value = false;
  }, timeout); // Short delay to allow fade-out animation
}
// -----------------------------------------------
// lifecycle
onMounted(() => {
  window.addEventListener("message", handleMessage);
});
onBeforeUnmount(() => {
  if (timmerId.value) {
    clearTimeout(timmerId.value);
    timmerId.value = null;
  }
  window.removeEventListener("message", handleMessage);
});
// -----------------------------------------------
const message = ref("");
const handleMessage = (event: any) => {
  // セキュリティのため、特定のオリジンからのメッセージのみを処理する
  if (event.origin !== "http://localhost:3000") {
    console.log(event.origin);
    return;
  }
  if (event.data === "iframe") {
    closeFullScreen();
  }
};
// -----------------------------------------------
// meta
definePageMeta({
  layout: "lp",
});
</script>

<style scoped lang="scss">
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
}

.description {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 40px;
}

section {
  margin-bottom: 40px;
}

.poster-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; // 16:9 aspect ratio
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 1s ease-in-out;
  transform-origin: center center;
  opacity: 1;
}

.poster-container.fullscreen {
  scale: 3;
  opacity: 0;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border: #fff 2px solid;
  border-radius: 50%;
  cursor: pointer;
  transition: opacity 0.5s ease-in-out;
}

.fullscreen .play-btn {
  opacity: 0;
}

.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.full-screen {
  iframe {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100vh;
    overflow: hidden;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }

  .description {
    font-size: 14px;
  }

  .poster-container {
    height: 300px;
  }
}
</style>
