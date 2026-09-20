import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  skipFormatting,
  {
    rules: {
      // 规范 §7：组件名必须多单词，避免与 HTML 标签重名
      'vue/multi-word-component-names': 'error',
      // 规范 §10：生产环境禁止 console
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      // 规范 §6：禁止 any
      '@typescript-eslint/no-explicit-any': 'error',
      // 规范 §5：禁止 var
      'no-var': 'error',
      'prefer-const': 'error',
      // 规范 §5：嵌套深度限制
      'max-depth': ['warn', 3],
    },
  },
];
