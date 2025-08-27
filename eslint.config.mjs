// @ts-check
import pluginTailwindCss from 'eslint-plugin-tailwindcss';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/html-self-closing': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
    },
  },
])
  .append(pluginTailwindCss.configs['flat/recommended'])
  .append(pluginVueA11y.configs['flat/recommended']);
