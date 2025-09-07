import { describe, expect, test } from 'vitest';
import Title from '@/components/index/Title.vue';
import { mountComponent } from '@/helpers/test';

const defaultProps = {
  title: 'テストタイトル',
};

describe('app/components/index/Title.vue', () => {
  test('受け取ったPropsが適切に表示されること', () => {
    const wrapper = mountComponent(Title, { props: defaultProps });

    expect(wrapper.get('[data-testid="title"]').text()).toBe(defaultProps.title);
  });
});
