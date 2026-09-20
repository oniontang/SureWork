<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { fetchDemanderProfile, saveProfile } from '@/api/user';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { isValidEmail } from '@/utils/validate';
import type { IDemanderProfileType } from '@/types/user';

interface ISwitchRowType {
  key: string;
  title: string;
  desc: string;
  isOn: boolean;
}

const { isLoading, isSubmitting, run, runAction } = useAsync();
const toast = useToast();

const profile = ref<IDemanderProfileType | null>(null);
const form = reactive({ name: '', orgName: '', email: '', intro: '' });

const switches = ref<ISwitchRowType[]>([
  { key: 'contact-guard', title: '联系方式保护', desc: '站内沟通不暴露手机/微信，违规引导线下交易将触发风控', isOn: true },
  { key: 'order-notify', title: '订单状态通知', desc: '交付、验收、放款、售后节点 · 站内 + 短信', isOn: true },
  { key: 'bid-notify', title: '投标动态通知', desc: '新投标、投标被拒原因反馈', isOn: true },
  { key: 'announce', title: '平台公告', desc: '规则更新、活动与新品类上线', isOn: false },
]);

function toggleSwitch(target: ISwitchRowType): void {
  target.isOn = !target.isOn;
}

async function handleSave(): Promise<void> {
  if (!isValidEmail(form.email)) {
    toast('邮箱格式不正确', 'error');
    return;
  }
  const isSaved = await runAction(() => saveProfile({ name: form.name, email: form.email }));
  if (isSaved) {
    toast('基本信息已保存', 'success');
  }
}

onMounted(async () => {
  const data = await run(() => fetchDemanderProfile());
  if (data) {
    profile.value = data;
    form.name = data.name;
    form.orgName = data.orgName;
    form.email = data.email;
    form.intro = data.orgIntro;
  }
});
</script>

<template>
  <div class="page">
    <header>
      <h1 class="page-title">账号设置与认证</h1>
      <p class="page-subtitle">完善信息可提升需求匹配质量与投标转化</p>
    </header>

    <SkeletonBlock v-if="isLoading" preset="table" />

    <div v-else-if="profile" class="page__cols">
      <div class="page__stack">
        <section class="card">
          <b class="card-title">基本信息</b>
          <div class="page__avatar-row">
            <UserAvatar :letter="profile.avatarLetter" tone="av-1" :size="3.5" />
            <div>
              <button class="btn btn--ghost btn--sm" @click="toast('演示原型：上传头像（支持 JPG/PNG，2MB 内）')">
                更换头像
              </button>
              <p class="muted page__tip">建议使用企业 Logo，投标人更信任</p>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label>联系人称呼</label>
              <input v-model="form.name" maxlength="20" />
            </div>
            <div class="field">
              <label>团队/部门名称</label>
              <input v-model="form.orgName" maxlength="30" />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>联系手机 <em>对投标人全程打码</em></label>
              <input :value="profile.maskedPhone" disabled />
            </div>
            <div class="field">
              <label>常用邮箱（接单通知）</label>
              <input v-model="form.email" type="email" />
            </div>
          </div>
          <div class="field">
            <label>公司/业务简介 <em>展示在需求卡与主页</em></label>
            <textarea v-model="form.intro" rows="3" maxlength="200" />
          </div>
          <button
            class="btn btn--primary"
            :class="{ 'btn--loading': isSubmitting }"
            @click="handleSave"
          >
            <span v-if="isSubmitting" class="spin" />
            {{ isSubmitting ? '保存中…' : '保存修改' }}
          </button>
        </section>

        <section class="card">
          <b class="card-title">安全与隐私</b>
          <div class="setting-row">
            <div>
              <p class="setting-row__title">实名认证</p>
              <p class="setting-row__desc">法人二要素 + 人脸活体 · 09/01 已核验</p>
            </div>
            <div class="setting-row__end"><StatusTag label="已实名" tone="success" /></div>
          </div>
          <div v-for="item in switches" :key="item.key" class="setting-row">
            <div>
              <p class="setting-row__title">{{ item.title }}</p>
              <p class="setting-row__desc">{{ item.desc }}</p>
            </div>
            <div class="setting-row__end">
              <button
                :class="['switch', { 'switch--on': item.isOn }]"
                role="switch"
                :aria-checked="item.isOn"
                :aria-label="item.title"
                @click="toggleSwitch(item)"
              />
            </div>
          </div>
          <div class="setting-row">
            <div>
              <p class="setting-row__title">登录设备</p>
              <p class="setting-row__desc">MacBook Pro（本机）· iPhone 15 · 异地登录将短信提醒</p>
            </div>
            <div class="setting-row__end">
              <button class="btn btn--ghost btn--sm" @click="toast('演示原型：管理登录设备')">管理</button>
            </div>
          </div>
        </section>
      </div>

      <aside class="page__stack">
        <section class="card">
          <div class="card__head">
            <b class="card-title">企业认证</b>
            <StatusTag label="已认证 · L2" tone="success" />
          </div>
          <p class="muted page__meta">
            认证主体：山野咖啡品牌管理有限公司<br />
            统一社会信用代码：9151****XXXXXX（脱敏展示）<br />
            认证时间：2026-09-01 · 年审到期 2027-09-01<br />
            权益：对公支付 · 企业标识 · 定向派单池 · 高预算需求发布
          </p>
          <div class="page__ops">
            <button class="btn btn--ghost btn--sm" @click="toast('演示原型：更新营业执照/授权书')">更新认证材料</button>
            <button class="btn btn--ghost btn--sm" @click="toast('演示原型：更换认证主体（需重新审核）')">更换主体</button>
          </div>
        </section>

        <section class="card">
          <b class="card-title">电子签章</b>
          <p class="muted page__meta">e签宝企业章已激活 · 合同自动存证<br />经办人：{{ profile.name }}（已授权）</p>
          <button class="btn btn--ghost btn--sm page__op" @click="toast('演示原型：打开签章管理')">管理签章</button>
        </section>

        <section class="card card--dashed">
          <b class="card-title card-title--danger">注销账号</b>
          <p class="muted page__meta">
            存在进行中订单或托管资金时不可注销；注销后交易记录按法规保留 3 年。
          </p>
          <button
            class="btn btn--ghost btn--sm btn--danger page__op"
            @click="toast('演示原型：注销需二次验证并冷静期 15 天')"
          >
            申请注销
          </button>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.page {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.page__cols {
  display: grid;
  grid-template-columns: 1fr 23.75rem;
  gap: $space-5;
  align-items: start;
}

.page__stack {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.card-title {
  display: block;
  margin-bottom: $space-4;
  font-size: $fs-md;

  &--danger {
    color: $color-danger;
  }
}

.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .card-title {
    margin-bottom: $space-4;
  }
}

.page__avatar-row {
  display: flex;
  align-items: center;
  gap: $space-5;
  margin-bottom: $space-5;
}

.page__tip {
  margin-top: $space-2;
}

.page__meta {
  line-height: 1.9;
}

.page__ops {
  display: flex;
  gap: $space-3;
  margin-top: $space-4;
}

.page__op {
  margin-top: $space-4;
}
</style>
