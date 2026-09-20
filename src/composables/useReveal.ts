import { onBeforeUnmount, onMounted } from 'vue';

import { throttle } from '@/utils/functional';

const REVEAL_CLASS = 'reveal--in';
const OBSERVE_SELECTOR = '.reveal';
const THROTTLE_MS = 120;

/**
 * 滚动渐入：元素进入视口时添加 reveal--in。
 *
 * 关键点：页面数据多为异步渲染（接口返回、加载更多、路由切换后才挂载），
 * 因此除了 IntersectionObserver，还要用 MutationObserver 接管后续插入的节点，
 * 否则这些元素会永久停留在 opacity: 0。
 *
 * 降级：用户开启减动效或浏览器不支持 IO 时，直接显示全部内容。
 */
export function useReveal(): void {
  let io: IntersectionObserver | null = null;
  let mo: MutationObserver | null = null;
  let onScroll: (() => void) | null = null;
  let isReduced = false;

  function showAll(): void {
    document
      .querySelectorAll<HTMLElement>(OBSERVE_SELECTOR)
      .forEach((el) => el.classList.add(REVEAL_CLASS));
  }

  function attachAll(): void {
    if (isReduced) {
      showAll();
      return;
    }
    document
      .querySelectorAll<HTMLElement>(`${OBSERVE_SELECTOR}:not(.${REVEAL_CLASS})`)
      .forEach((el) => io?.observe(el));
  }

  onMounted(() => {
    isReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined';

    if (!isReduced) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(REVEAL_CLASS);
              io?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '80px 0px' },
      );
    }

    attachAll();

    // 后续插入的 .reveal 节点（异步数据、加载更多）同样纳入观察
    mo = new MutationObserver(throttle(attachAll, THROTTLE_MS));
    mo.observe(document.body, { childList: true, subtree: true });

    onScroll = throttle(attachAll, THROTTLE_MS);
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    io?.disconnect();
    mo?.disconnect();
    if (onScroll) {
      window.removeEventListener('scroll', onScroll);
    }
  });
}
