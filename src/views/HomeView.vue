<template>
  <main class="home">
    <TheWelcome :msg="message" />
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/WelcomeAnim.vue'
const message = import.meta.env.BASE_URL
</script>
