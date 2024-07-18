<template>
  <div>
    <button @click="startTour">ツアーを開始</button>
    <slot />
  </div>
</template>

<script setup lang="ts">
// ===============================================
// layout: default
// ===============================================
const { $driver } = useNuxtApp();

const startTour = () => {
  const driverObj = $driver({
    popoverClass: "driverjs-theme",
    showButtons: ["next", "close"],
    nextBtnText: "わかった！",
    doneBtnText: "OK!",
    showProgress: false,
    steps: [
      {
        element: ".carousel-control-next-icon",
        popover: { title: "つかいかた", description: "つぎのページへすすみます" },
      },
    ],
  });
  driverObj.drive();
};

//driverObj.highlight({
//  element: ".carousel-control-next-icon",
//	popover: {
//		title: 'Welcome to Driver.js!',
//		description: 'Driver.js is a powerful yet light-weight, vanilla JavaScript engine to drive the user\'s focus across the page.'
//	}
//});
</script>

<style lang="scss" scoped></style>
