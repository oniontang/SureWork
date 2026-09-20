<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { fetchCertMaterials, fetchCertifications, fetchProviderProfile, saveProfile } from '@/api/user';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import type { ICertMaterialType, IProviderProfileType } from '@/types/user';
import type { ICertificationItemType } from '@/types/payment';

interface ISwitchRowType {
  key: string;
  title: string;
  desc: string;
  isOn: boolean;
}

const { isLoading, isSubmitting, run, runAction } = useAsync();
const toast = useToast();

const profile = ref<IProviderProfileType | null>(null);
const certifications = ref<ICertificationItemType[]>([]);
const materials = ref<ICertMaterialType[]>([]);

const form = reactive({ name: '', title: '', intro: '', priceRange: '', city: '' });
const skillTags = ref<string[]>([]);
const isAvailable = ref(true);

const switches = ref<ISwitchRowType[]>([
  { key: 'contact-guard', title: '联系方式保护', desc: '与需求方沟通不暴露联系方式，违规将扣信用分', isOn: true },
  { key: 'match-notify', title: '新需求推荐通知', desc: '按技能标签推送匹配需求 · 站内 + 微信服务通知', isOn: true },
  { key: 'reject-reason', title: '报价被拒原因反馈', desc: '落选后收到需求方勾选的原因，帮助迭代方案', isOn: true },
]);

function toggleSwitch(target: ISwitchRowType): void {
  target.isOn = !target.isOn;
}

function toggleSkill(tag: string): void {
  const index = skillTags.value.indexOf(tag);
  if (index >= 0) {
    skillTags.value.splice(index, 1);
  } else {
    skillTags.value.push(tag);
  }
}

async function handleSave(): Promise<void> {
  const isSaved = await runAction(() => saveProfile({ name: form.name, email: 'opc@surework.dev' }));
  if (isSaved) {
    toast('基本信息已保存，主页已同步更新', 'success');
  }
}

onMounted(async () => {
  const [me, certs, mats] = await Promise.all([
    run(() => fetchProviderProfile()),
    run(() => fetchCertifications()),
    run(() => fetchCertMaterials()),
  ]);
  if (me) {
    profile.value = me;
    form.name = me.name;
    form.title = me.title;
    form.city = me.city;
    form.priceRange = me.priceRange;
    form.intro = '专注餐饮与零售品牌视觉，7 年服务 30+ 商业项目，擅长从 VI 到落地物料的完整交付。';
    skillTags.value = [...me.skillTags];
  }
  certifications.value = certs ?? [];
  materials.value = mats ?? [];
});
</script>

<template>
  <div class="page">
    <header>
      <h1 class="page-title">账号设置与认证</h1>
      <p class="page-subtitle">完善资料与认证等级直接影响曝光排序与可接需求范围</p>
    </header>

    <SkeletonBlock v-if="isLoading || !profile" preset="table" />

    <div v-else class="page__cols">
      <div class="page__stack">
        <section class="card">
          <b class="card-title">基本信息（公开展示）</b>
          <div class="page__avatar-row">
            <UserAvatar :letter="profile.avatarLetter" tone="av-1" :size="3.5" />
            <div>
              <button class="btn btn--ghost btn--sm" @click="toast('演示原型：上传头像')">更换头像</button>
              <p class="muted page__tip">头像是投标转化的第一印象</p>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label>昵称</label>
              <input v-model="form.name" maxlength="20" />
            </div>
            <div class="field">
              <label>专业头衔</label>
              <input v-model="form.title" maxlength="30" />
            </div>
          </div>
          <div class="field">
            <label>个人简介 <em>主页首屏文案</em></label>
            <textarea v-model="form.intro" rows="3" maxlength="200" />
          </div>
          <div class="field">
            <label>技能标签 <em>匹配与推荐的依据</em></label>
            <div class="chip-row">
              <button
                v-for="tag in ['品牌VI', '菜单/物料', '包装', '字体设计', '插画']"
                :key="tag"
                :class="['chip', { 'chip--on': skillTags.includes(tag) }]"
                @click="toggleSkill(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>报价区间</label>
              <input v-model="form.priceRange" />
            </div>
            <div class="field">
              <label>接单档期</label>
              <div class="chip-row">
                <button :class="['chip', { 'chip--on': isAvailable }]" @click="isAvailable = true">本月 2 席</button>
                <button :class="['chip', { 'chip--on': !isAvailable }]" @click="isAvailable = false">暂不接单</button>
              </div>
            </div>
          </div>
          <button class="btn btn--primary" :class="{ 'btn--loading': isSubmitting }" @click="handleSave">
            <span v-if="isSubmitting" class="spin" />
            {{ isSubmitting ? '保存中…' : '保存修改' }}
          </button>
        </section>

        <section class="card">
          <b class="card-title">安全与隐私</b>
          <div class="setting-row">
            <div>
              <p class="setting-row__title">实名认证</p>
              <p class="setting-row__desc">身份证二要素 + 人脸活体 · 08/18 已核验</p>
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
        </section>
      </div>

      <aside class="page__stack">
        <section class="card">
          <b class="card-title">认证内容管理</b>
          <div v-for="item in certifications" :key="item.id" class="setting-row">
            <div>
              <p class="setting-row__title">{{ item.levelLabel }}</p>
              <p class="setting-row__desc">{{ item.description }}</p>
            </div>
            <div class="setting-row__end">
              <StatusTag
                :label="item.status === 'done' ? '已认证' : `进行中 ${item.progressPercent}%`"
                :tone="item.status === 'done' ? 'success' : 'accent'"
              />
              <button
                v-if="item.status === 'done'"
                class="btn btn--ghost btn--sm"
                @click="toast('演示原型：查看认证证书')"
              >
                证书
              </button>
            </div>
          </div>
        </section>

        <section class="card">
          <b class="card-title">认证材料</b>
          <div v-for="item in materials" :key="item.id" class="setting-row">
            <div>
              <p class="setting-row__title">{{ item.name }}</p>
              <p class="setting-row__desc">{{ item.description }}</p>
            </div>
            <div class="setting-row__end">
              <StatusTag label="已核验" tone="success" />
              <button class="btn btn--ghost btn--sm" @click="toast('演示原型：更换材料')">更换</button>
            </div>
          </div>
        </section>

        <section class="card">
          <b class="card-title">结算协议与收款账户</b>
          <div class="setting-row">
            <div>
              <p class="setting-row__title">灵活用工结算协议</p>
              <p class="setting-row__desc">09/02 已签署 · 代征个税主体：灵活用工平台</p>
            </div>
            <div class="setting-row__end">
              <StatusTag label="已签署" tone="success" />
              <button class="btn btn--ghost btn--sm" @click="toast('演示原型：查看协议')">查看</button>
            </div>
          </div>
          <div class="setting-row">
            <div>
              <p class="setting-row__title">提现账户</p>
              <p class="setting-row__desc">招商银行 · 尾号 6688 · 与实名信息一致</p>
            </div>
            <div class="setting-row__end">
              <button class="btn btn--ghost btn--sm" @click="toast('演示原型：更换银行卡（需重新核验）')">更换</button>
            </div>
          </div>
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
</style>
