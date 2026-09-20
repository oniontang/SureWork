import { request } from '@/api/request';
import {
  CERTIFICATIONS,
  CERT_MATERIALS,
  DEMANDERS,
  PORTFOLIOS,
  PROVIDERS,
} from '@/api/mocks';
import type { ICertMaterialType, IDemanderProfileType, IPortfolioItemType, IProviderProfileType } from '@/types/user';
import type { ICertificationItemType } from '@/types/payment';

export function fetchDemanderProfile(): Promise<IDemanderProfileType> {
  return request(() => DEMANDERS.me, 300);
}

export function fetchProviderProfile(): Promise<IProviderProfileType> {
  return request(() => PROVIDERS.me, 300);
}

export function fetchPortfolios(): Promise<IPortfolioItemType[]> {
  return request(() => PORTFOLIOS, 260);
}

export function fetchCertifications(): Promise<ICertificationItemType[]> {
  return request(() => CERTIFICATIONS, 240);
}

export function fetchCertMaterials(): Promise<ICertMaterialType[]> {
  return request(() => CERT_MATERIALS, 240);
}

/** 保存资料：真实项目需服务端二次校验（前端校验不可信） */
export function saveProfile(payload: { name: string; email: string }): Promise<{ savedAt: string }> {
  return request(() => {
    if (!payload.name.trim()) {
      throw new Error('名称不能为空');
    }
    return { savedAt: new Date().toISOString() };
  }, 700);
}
