<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import UserAvatar from '@/components/UserAvatar.vue';
import { ROLE } from '@/constants';
import { useUiStore } from '@/store/ui';
import { useUserStore } from '@/store/user';
import type { RoleType } from '@/types/user';

interface INavItemType {
  label: string;
  to: string;
}

const DEMANDER_NAV: INavItemType[] = [
  { label: '工作台', to: '/demand/workbench' },
  { label: '我的发布', to: '/demand/orders' },
  { label: '投标管理', to: '/demand/bids/d-9' },
];

const PROVIDER_NAV: INavItemType[] = [
  { label: '抢单大厅', to: '/provider/hall' },
  { label: '接单管理', to: '/provider/jobs' },
  { label: '我的主页', to: '/provider/profile' },
  { label: '钱包', to: '/provider/wallet' },
];

const router = useRouter();
const user = useUserStore();
const ui = useUiStore();

const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const navItems = computed<INavItemType[]>(() =>
  user.isDemander ? DEMANDER_NAV : PROVIDER_NAV,
);

const identityName = computed(() => (user.isDemander ? '唐总 · 山野咖啡品牌部' : '林一舟 · 品牌视觉设计师'));
const identityMeta = computed(() =>
  user.isDemander ? '认证企业 · L2' : '认证OPC · L2 · 信用 912',
);

const settingsPath = computed(() =>
  user.isDemander ? '/demand/settings' : '/provider/settings',
);
const walletPath = computed(() => (user.isDemander ? '/demand/wallet' : '/provider/wallet'));
const walletLabel = computed(() => (user.isDemander ? '资金工作台' : '我的钱包'));

function handleSwitchRole(role: RoleType): void {
  user.setRole(role);
  router.push(role === ROLE.DEMANDER ? '/demand/workbench' : '/provider/hall');
}

function handlePublish(): void {
  router.push('/demand/workbench?publish=1');
}

function handleMenuAction(message: string): void {
  isMenuOpen.value = false;
  ui.pushToast(message);
}

function handleNavigate(to: string): void {
  isMenuOpen.value = false;
  router.push(to);
}

function handleDocumentClick(event: MouseEvent): void {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick));
onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick));
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink to="/" class="app-header__logo">
        <span class="app-header__mark">约</span>
        <span class="app-header__word">
          如约
          <em>SureWork · OPC 接单平台</em>
        </span>
      </RouterLink>

      <nav class="app-header__nav" aria-label="主导航">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="app-header__nav-link">
          {{ item.label }}
        </RouterLink>
        <RouterLink to="/chat" class="app-header__nav-link">消息</RouterLink>
      </nav>

      <div class="app-header__actions">
        <button v-if="user.isDemander" class="btn btn--primary" @click="handlePublish">
          ＋ 发布需求
        </button>

        <div class="role-segment" role="group" aria-label="视角切换">
          <button
            :class="['role-segment__btn', { 'role-segment__btn--on': user.isDemander }]"
            @click="handleSwitchRole(ROLE.DEMANDER)"
          >
            需求方
          </button>
          <button
            :class="['role-segment__btn', { 'role-segment__btn--on': user.isProvider }]"
            @click="handleSwitchRole(ROLE.PROVIDER)"
          >
            从业者
          </button>
        </div>

        <div ref="menuRef" class="app-header__user">
          <button
            class="app-header__avatar-btn"
            aria-label="个人中心"
            :aria-expanded="isMenuOpen"
            @click.stop="isMenuOpen = !isMenuOpen"
          >
            <UserAvatar :letter="user.isDemander ? '唐' : '林'" tone="av-1" :size="2.25" />
          </button>

          <Transition name="menu">
            <div v-if="isMenuOpen" class="user-menu">
              <div class="user-menu__head">
                <UserAvatar :letter="user.isDemander ? '唐' : '林'" tone="av-1" :size="2.125" />
                <span>
                  <b>{{ identityName }}</b>
                  <em>{{ identityMeta }}</em>
                </span>
              </div>
              <button class="user-menu__item" @click="handleNavigate(settingsPath)">账号设置与认证</button>
              <button class="user-menu__item" @click="handleNavigate(walletPath)">{{ walletLabel }}</button>
              <button v-if="user.isProvider" class="user-menu__item" @click="handleNavigate('/provider/profile')">
                编辑我的主页
              </button>
              <span class="user-menu__sep" />
              <button class="user-menu__item" @click="handleMenuAction('演示原型：通知偏好设置')">通知偏好</button>
              <button class="user-menu__item user-menu__item--danger" @click="handleMenuAction('演示原型：退出登录（需二次确认）')">
                退出登录
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.app-header {
  position: sticky;
  top: 0;
  z-index: $z-header;
  height: $header-height;
  background: rgba(255, 252, 246, 0.92);
  backdrop-filter: blur(1.125rem) saturate(160%);
  border-bottom: 0.0625rem solid $color-border;
}

.app-header__inner {
  max-width: $layout-max-width;
  height: 100%;
  margin: 0 auto;
  padding: 0 $space-8;
  display: flex;
  align-items: center;
  gap: $space-7;
}

.app-header__logo {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.app-header__mark {
  display: grid;
  place-items: center;
  width: 1.625rem;
  height: 1.625rem;
  border-radius: $radius-sm;
  background: linear-gradient(135deg, $color-accent, $color-accent-deep);
  color: $color-on-accent;
  font-size: $fs-base;
  font-weight: 800;
}

.app-header__word {
  font-size: $fs-xl;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;

  em {
    display: block;
    font-style: normal;
    font-size: $fs-xs;
    font-weight: 500;
    color: $color-ink-3;
  }
}

.app-header__nav {
  flex: 1;
  display: flex;
  gap: $space-1;
}

.app-header__nav-link {
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  font-weight: 600;
  color: $color-ink-2;
  transition: background $duration-fast;

  &:hover {
    background: $color-panel;
    color: $color-ink-1;
  }

  &.router-link-active {
    background: $color-accent-soft;
    color: $color-accent-deep;
  }
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: $space-4;
}

.role-segment {
  display: flex;
  gap: $space-1;
  padding: 0.1875rem;
  border-radius: $radius-pill;
  background: $color-panel;
  border: 0.0625rem solid $color-border;
}

.role-segment__btn {
  padding: $space-2 $space-4;
  border-radius: $radius-pill;
  font-size: $fs-sm;
  font-weight: 600;
  color: $color-ink-3;
  transition: all $duration-fast $ease-out;

  &--on {
    background: $color-accent;
    color: $color-on-accent;
    box-shadow: $shadow-accent;
  }
}

.app-header__user {
  position: relative;
}

.app-header__avatar-btn {
  border-radius: 50%;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.92);
  }
}

.user-menu {
  position: absolute;
  right: 0;
  top: calc(100% + $space-3);
  width: 14.5rem;
  padding: $space-2;
  background: $color-surface;
  border: 0.0625rem solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-float;
  z-index: $z-dropdown;
}

.user-menu__head {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3;
  border-bottom: 0.0625rem solid $color-border;
  margin-bottom: $space-2;

  b {
    display: block;
    font-size: $fs-sm;
    line-height: 1.3;
  }

  em {
    font-style: normal;
    font-size: 0.6875rem;
    color: $color-ink-3;
  }
}

.user-menu__item {
  display: block;
  width: 100%;
  padding: $space-3;
  border-radius: $radius-sm;
  text-align: left;
  font-size: $fs-base;
  font-weight: 600;
  color: $color-ink-2;
  transition: background $duration-fast;

  &:hover {
    background: $color-panel;
    color: $color-ink-1;
  }

  &--danger {
    color: $color-danger;
  }
}

.user-menu__sep {
  display: block;
  height: 0.0625rem;
  margin: $space-2 $space-3;
  background: $color-border;
}

.menu-enter-active,
.menu-leave-active {
  transition: all $duration-base $ease-out;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-0.375rem);
}
</style>
