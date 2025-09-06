import { describe, expect, test } from 'vitest';
import HealthStatusDisplayArea from '@/components/index/HealthStatusDisplayArea.vue';
import { mountComponent } from '@/helpers/test';

const defaultProps = {
  status: 'test-status',
  timestamp: '2024-01-01 00:00:00',
};

describe('app/components/index/HealthStatusDisplayArea.vue', () => {
  test('propsで渡されたstatusが正しく表示されること', () => {
    const wrapper = mountComponent(HealthStatusDisplayArea, { props: defaultProps });

    expect(wrapper.find('[data-testid="status-display-aria"]').text()).toContain('test-status');
  });

  test('propsで渡されたtimestampが正しく表示されること', () => {
    const wrapper = mountComponent(HealthStatusDisplayArea, { props: defaultProps });

    expect(wrapper.find('[data-testid="timestamp-display-aria"]').text()).toContain('2024-01-01 00:00:00');
  });
});
