<!-- BookIntroduction.vue -->
<template>
  <section
    id="book-intro"
    class="py-5"
  >
    <div class="container">
      <h2>作品紹介</h2>
      <p>{{ storySummary }}</p>
      <p>対象年齢: {{ targetAge }}</p>
      <p>特徴: {{ features }}</p>
      <div class="row">
        <div
          v-for="(image, index) in sampleImages"
          :key="index"
          class="col-md-4"
        >
          <img
            :src="image"
            alt="Sample illustration"
            class="img-fluid mb-3"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const storySummary = "ここに絵本のストーリー概要が入ります。";
const targetAge = "5歳から8歳";
const features = "インタラクティブな要素、美しいイラスト、教育的な内容";
const sampleImages = ["/images/dammy.png", "/images/dammy.png", "/images/dammy.png"];
</script>
