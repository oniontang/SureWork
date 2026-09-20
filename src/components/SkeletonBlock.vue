<script setup lang="ts">
type PresetType = 'dash' | 'table' | 'cards' | 'profile';

interface IPropsType {
  preset?: PresetType;
}

withDefaults(defineProps<IPropsType>(), { preset: 'table' });
</script>

<template>
  <div class="skel-stack" role="status" aria-live="polite" aria-label="内容加载中">
    <template v-if="preset === 'dash'">
      <div class="skel-grid">
        <div v-for="index in 4" :key="`kpi-${index}`" class="skeleton skel-kpi" />
      </div>
      <div class="skeleton skel-banner" />
      <div class="skeleton skel-title" />
      <div class="skeleton skel-card" />
      <div class="skeleton skel-card" />
    </template>

    <template v-else-if="preset === 'table'">
      <div class="skeleton skel-title" />
      <div class="skeleton skel-card-tall" />
      <div class="skeleton skel-bar" />
    </template>

    <template v-else-if="preset === 'cards'">
      <div class="skeleton skel-banner" />
      <div class="skeleton skel-bar" />
      <div class="skel-grid-2">
        <div v-for="index in 4" :key="`card-${index}`" class="skeleton skel-card" />
      </div>
    </template>

    <template v-else>
      <div class="skeleton skel-card-tall" />
      <div class="skeleton skel-title" />
      <div class="skel-grid-2">
        <div v-for="index in 3" :key="`pf-${index}`" class="skeleton skel-card" />
      </div>
    </template>
  </div>
</template>
