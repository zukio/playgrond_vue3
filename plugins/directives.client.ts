import type { Directive } from "vue";

export default defineNuxtPlugin(({ vueApp }) => {
  const visibleDirective: Directive = {
    mounted(el, binding) {
      if ("IntersectionObserver" in window) {
        el._visibilityObserver = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            binding.value();
            el._visibilityObserver.disconnect();
          }
        });
        el._visibilityObserver.observe(el);
      } else {
        el._visibilityChecker = () => {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            binding.value();
            (window as Window).removeEventListener("scroll", el._visibilityChecker);
          }
        };
        (window as Window).addEventListener("scroll", el._visibilityChecker);
        el._visibilityChecker();
      }
    },
    unmounted(el) {
      if (el._visibilityObserver) {
        el._visibilityObserver.disconnect();
        delete el._visibilityObserver;
      }
      if (el._visibilityChecker) {
        (window as Window).removeEventListener("scroll", el._visibilityChecker);
        delete el._visibilityChecker;
      }
    },
    getSSRProps(binding, vnode) {
      // SSR 専用の props はここで用意できます。
      return {};
    },
  };

  vueApp.directive("visible", visibleDirective);
  //return {
  //  provide: {
  //    visibleDirective,
  //  },
  //};
});
