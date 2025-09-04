import { describe, expect, test } from 'vitest';
import { mountComponent } from '@/helpers/test';
import Default from '@/layouts/default.vue';

describe('app/layouts/default.vue', () => {
  test('mainタグ要素が存在すること', () => {
    const wrapper = mountComponent(Default);
    expect(wrapper.find('main').exists()).toBe(true);
  });
});
