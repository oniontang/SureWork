<script setup lang="ts">
interface IPropsType {
  letter: string;
  tone?: string;
  /** 尺寸，单位 rem */
  size?: number;
}

const props = withDefaults(defineProps<IPropsType>(), {
  tone: 'av-1',
  size: 2.625,
});
</script>

<template>
  <span
    class="avatar"
    :class="props.tone"
    :style="{ width: `${props.size}rem`, height: `${props.size}rem`, fontSize: `${props.size * 0.38}rem` }"
    aria-hidden="true"
  >
    {{ props.letter }}
  </span>
</template>
