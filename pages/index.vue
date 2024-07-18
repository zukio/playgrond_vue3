<template>
  <div class="lp p-0 m-0">
    <hero-section>
      <template #header>
        <HeaderSection>
          <button href="#book-intro" class="btn btn-light rounded-pill me-2">今すぐ体験</button>
        </HeaderSection>
      </template>
      <template #default>
        <div>
          <NuxtLink to="bookcover" class="btn btn-light btn-lg me-3">絵本を読む</NuxtLink>
          <!--NuxtLink to="#purchase" class="btn btn-primary btn-lg">迷路を解く</NuxtLink-->
        </div>
      </template>
    </hero-section>

    <main>
      <book-introduction />
      <!--labyrinth-game />
      <usage-guide />
      <custom-labyrinth />
      <author-introduction />
      <purchase-download />
      <faq-section />
      <contact-form /-->
    </main>

    <footer-section />
  </div>
</template>

<script setup lang="ts">
import HeroSection from "@/components/lp/HeroSection.vue";
import HeaderSection from "@/components/lp/HeaderSection.vue";
import BookIntroduction from "@/components/lp/BookIntroduction.vue";
//import LabyrinthGame from '@/components/lp/LabyrinthGame.vue'
//import UsageGuide from '@/components/lp/UsageGuide.vue'
//import CustomLabyrinth from '@/components/lp/CustomLabyrinth.vue'
//import AuthorIntroduction from '@/components/lp/AuthorIntroduction.vue'
//import PurchaseDownload from '@/components/lp/PurchaseDownload.vue'
//import FaqSection from '@/components/lp/FaqSection.vue'
//import ContactForm from '@/components/lp/ContactForm.vue'
import FooterSection from "@/components/lp/FooterSection.vue";
const props = defineProps<{
  //
}>();
//const sections = [
//  { id: 'hero', name: 'ホーム' },
//  { id: 'book-intro', name: '作品紹介' },
//  { id: 'labyrinth-game', name: 'ゲーム機能' },
//  { id: 'usage-guide', name: '使い方' },
//  { id: 'custom-labyrinth', name: 'カスタム迷路' },
//  { id: 'author', name: '作者紹介' },
//  { id: 'purchase', name: '購入' },
//  { id: 'faq', name: 'FAQ' },
//  { id: 'contact', name: 'お問い合わせ' }
//]
//const subCatchphrase = 'ジャイロ機能を使ったラビリンスボールゲームが楽しめる'
//const catchphrase = 'デジタル絵本で新しい冒険を！'
//const visualImage = '/images/header/Cover-Navig.webp'
</script>
