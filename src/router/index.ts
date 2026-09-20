import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import { ROLE } from '@/constants';
import { useUserStore } from '@/store/user';
import type { RoleType } from '@/types/user';

/** 路由懒加载（规范 §11） */
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/demand/workbench' },
  {
    path: '/demand',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { role: ROLE.DEMANDER },
    children: [
      {
        path: 'workbench',
        name: 'demand-workbench',
        component: () => import('@/pages/demand/WorkbenchPage.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'orders',
        name: 'demand-orders',
        component: () => import('@/pages/demand/OrderListPage.vue'),
        meta: { title: '我的订单' },
      },
      {
        path: 'orders/:id',
        name: 'demand-order-detail',
        component: () => import('@/pages/demand/OrderDetailPage.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'bids/:demandId',
        name: 'demand-bids',
        component: () => import('@/pages/demand/BidManagePage.vue'),
        meta: { title: '投标管理' },
      },
      {
        path: 'wallet',
        name: 'demand-wallet',
        component: () => import('@/pages/demand/WalletPage.vue'),
        meta: { title: '资金工作台' },
      },
      {
        path: 'settings',
        name: 'demand-settings',
        component: () => import('@/pages/demand/AccountSettingsPage.vue'),
        meta: { title: '账号设置与认证' },
      },
    ],
  },
  {
    path: '/provider',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { role: ROLE.PROVIDER },
    children: [
      {
        path: 'hall',
        name: 'provider-hall',
        component: () => import('@/pages/provider/DemandHallPage.vue'),
        meta: { title: '抢单大厅' },
      },
      {
        path: 'jobs',
        name: 'provider-jobs',
        component: () => import('@/pages/provider/JobListPage.vue'),
        meta: { title: '接单管理' },
      },
      {
        path: 'jobs/:id',
        name: 'provider-job-detail',
        component: () => import('@/pages/provider/JobDetailPage.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'profile',
        name: 'provider-profile',
        component: () => import('@/pages/provider/MyProfilePage.vue'),
        meta: { title: '我的主页' },
      },
      {
        path: 'wallet',
        name: 'provider-wallet',
        component: () => import('@/pages/provider/ProviderWalletPage.vue'),
        meta: { title: '我的钱包' },
      },
      {
        path: 'settings',
        name: 'provider-settings',
        component: () => import('@/pages/provider/ProviderSettingsPage.vue'),
        meta: { title: '账号设置与认证' },
      },
    ],
  },
  {
    path: '/chat',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'chat',
        component: () => import('@/pages/shared/ChatPage.vue'),
        meta: { title: '消息' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/shared/NotFoundPage.vue'),
    meta: { title: '页面不存在' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const title = (to.meta.title as string | undefined) ?? '';
  document.title = title ? `${title} · 如约 SureWork` : '如约 SureWork · 企业 × OPC 接单平台';

  // 视角与路由前缀保持同步：直接访问 /provider/* 时自动切到从业者视角
  const routeRole = to.matched.find((record) => record.meta.role)?.meta.role as RoleType | undefined;
  if (routeRole) {
    const user = useUserStore();
    if (user.role !== routeRole) {
      user.setRole(routeRole);
    }
  }
  return true;
});

export default router;
