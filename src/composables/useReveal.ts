import { onBeforeUnmount, onMounted } from 'vue';

import { throttle } from '@/utils/functional';

const REVEAL_CLASS = 'reveal--in';
const OBSERVE_SELECTOR = '.reveal';
const THROTTLE_MS = 120;

/**
 * 滚动渐入：进入视口的元素添加 reveal--in。
 * 降级策略：不支持 IntersectionObserver 或用户开启减动效时直接显示。
 */
export function useReveal(): void {
  let observer: IntersectionObserver | null = null;
  let onScroll: (() => void) | null = null;

  function attachAll(): void {
    const targets = document.querySelectorAll<HTMLElement>(`${OBSERVE_SELECTOR}:not(.${REVEAL_CLASS})`);
    targets.forEach((el) => observer?.observe(el));
  }

  onMounted(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || typeof IntersectionObserver === 'undefined') {
      document
        .querySelectorAll<HTMLElement>(OBSERVE_SELECTOR)
        .forEach((el) => el.classList.add(REVEAL_CLASS));
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(REVEAL_CLASS);
            observer?.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '80px 0px' },
    );
    attachAll();

    // 路由切换后重新扫描（节流，规范 §11）
    onScroll = throttle(attachAll, THROTTLE_MS);
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    if (onScroll) {
      window.removeEventListener('scroll', onScroll);
    }
  });
}
