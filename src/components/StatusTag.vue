<script setup lang="ts">
type ToneType = 'accent' | 'success' | 'warning' | 'danger' | 'teal' | 'plain';

interface IPropsType {
  label: string;
  tone?: ToneType;
}

withDefaults(defineProps<IPropsType>(), { tone: 'plain' });
</script>

<template>
  <span class="tag" :class="`tag--${tone}`">{{ label }}</span>
</template>
