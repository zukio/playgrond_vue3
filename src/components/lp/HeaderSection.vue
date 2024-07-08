<!-- HeaderSection.vue -->
<template>
  <header class="header">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid align-items-center">
        <h1 class="logo">
          <a class="navbar-brand" href="/">{{ bookTitle }}</a>
        </h1>
        <div class="position-absolute end-0 me-2">
          <button href="#book-intro" class="btn btn-light rounded-pill me-2">今すぐ体験</button>

          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-for="section in sections" :key="section.id">
              <a class="nav-link" :href="'#' + section.id">{{ section.name }}</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const bookTitle = 'LOGO'
const sections = ref([
  { id: 'book-intro', name: '作品紹介' },
  { id: 'usage-guide', name: '使い方' }
  //{ id: 'custom-labyrinth', name: 'カスタム迷路' },
  //{ id: 'author', name: '作者紹介' },
  //{ id: 'purchase', name: '購入' },
  //{ id: 'faq', name: 'FAQ' },
  //{ id: 'contact', name: 'お問い合わせ' }
])
</script>

<style>
.header {
  position: relative;
  background: url('/img/Header-Logo-bg.png') no-repeat top center/cover;
  color: white;
  text-align: center;
  padding: 1rem 0;
  z-index: 2;
}

.header .navbar {
  background-color: transparent;
}

.btn-primary {
  margin-left: 1rem;
}

.navbar-brand {
  margin: 0;
  font-size: 1.5rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  vertical-align: middle;
}
</style>
