import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ROLE } from '@/constants';
import type { RoleType } from '@/types/user';
import { storage } from '@/utils/storage';

const ROLE_STORAGE_KEY = 'role';

/** 用户与角色 store：双视角切换 + 认证状态 */
export const useUserStore = defineStore('user', () => {
  const storedRole = storage.get(ROLE_STORAGE_KEY);
  const role = ref<RoleType>(storedRole === ROLE.PROVIDER ? ROLE.PROVIDER : ROLE.DEMANDER);

  const isDemander = computed(() => role.value === ROLE.DEMANDER);
  const isProvider = computed(() => role.value === ROLE.PROVIDER);

  function setRole(next: RoleType): void {
    role.value = next;
    storage.set(ROLE_STORAGE_KEY, next);
  }

  function toggleRole(): void {
    setRole(isDemander.value ? ROLE.PROVIDER : ROLE.DEMANDER);
  }

  return { role, isDemander, isProvider, setRole, toggleRole };
});
