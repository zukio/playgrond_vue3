import type { Directive, DirectiveBinding } from "vue";

interface VisibilityOptions {
  threshold?: number;
  onVisible?: () => void;
  onHidden?: () => void;
}

export default defineNuxtPlugin(({ vueApp }) => {
  const visibleDirective: Directive = {
    mounted(el: any, binding: DirectiveBinding) {
      const isFunction = typeof binding.value === "function";
      const options: VisibilityOptions = isFunction ? {} : binding.value || {};
      const threshold = options.threshold || 0.6;

      const handleVisibility = (isVisible: boolean) => {
        if (isVisible) {
          if (isFunction) {
            binding.value();
          } else {
            options.onVisible?.();
          }
        } else if (!isFunction) {
          options.onHidden?.();
        }
      };

      if ("IntersectionObserver" in window) {
        el._visibilityObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
              handleVisibility(true);
            } else {
              handleVisibility(false);
            }
          },
          { threshold: [threshold] }
        );

        el._visibilityObserver.observe(el);
      } else {
        // フォールバック: 要素が画面内にあるかどうかを定期的にチェック
        el._visibilityChecker = () => {
          const rect = el.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= (window as Window).innerHeight;
          handleVisibility(isVisible);
        };

        (window as Window).addEventListener("scroll", el._visibilityChecker);
        el._visibilityChecker(); // 初回チェック
      }
    },
    unmounted(el: any) {
      if (el._visibilityObserver) {
        el._visibilityObserver.disconnect();
        delete el._visibilityObserver;
      }
      if (el._visibilityChecker) {
        (window as Window).removeEventListener("scroll", el._visibilityChecker);
        delete el._visibilityChecker;
      }
    },
  };

  vueApp.directive("visible", visibleDirective);
});
