import { request } from '@/api/request';
import { DEMANDER_WALLET, PROVIDER_WALLET } from '@/api/mocks';
import type { ILedgerItemType, IWalletOverviewType, IWithdrawAccountType } from '@/types/payment';

export function fetchDemanderWallet(): Promise<{
  overview: IWalletOverviewType;
  ledger: ILedgerItemType[];
}> {
  return request(() => DEMANDER_WALLET);
}

export function fetchProviderWallet(): Promise<{
  overview: IWalletOverviewType;
  ledger: ILedgerItemType[];
  account: IWithdrawAccountType;
}> {
  return request(() => PROVIDER_WALLET);
}

/**
 * 提现申请（T+1 到账）。
 * 前置校验：实名一致 + 已签署灵活用工结算协议 + 提现额度与认证等级挂钩。
 */
export function applyWithdraw(amountCents: number): Promise<{ withdrawId: string }> {
  return request(() => {
    if (amountCents <= 0) {
      throw new Error('提现金额必须大于 0');
    }
    if (amountCents > PROVIDER_WALLET.overview.mainCents) {
      throw new Error('超出可提现余额');
    }
    return { withdrawId: `wd-${Date.now()}` };
  }, 700);
}
