import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Index from '@/components/index/Index.vue';
import { mountComponent } from '@/helpers/test';

const { mockUseHealth } = vi.hoisted(() => ({
  mockUseHealth: vi.fn(),
}));

vi.mock('@/composables/useHealth', () => ({
  useHealth: mockUseHealth,
}));

const Title = {
  props: ['title'],
  template: '<h1>{{ title }}</h1>',
};
const HealthStatusDisplayArea = {
  props: ['status', 'timestamp'],
  template: '<div>{{ status }},{{ timestamp }}</div>',
};
const defaultStubs = { Title, HealthStatusDisplayArea };

describe('app/components/index/Index.vue', () => {
  beforeEach(() => {
    mockUseHealth.mockReturnValue({
      healthStatus: 'healthy',
      healthTimestamp: '2024-01-01T00:00:00Z',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('必要な子コンポーネントが存在すること', () => {
    const wrapper = mountComponent(Index, { stubs: defaultStubs });

    expect(wrapper.findComponent(Title).exists()).toBe(true);
    expect(wrapper.findComponent(HealthStatusDisplayArea).exists()).toBe(true);
  });

  test('固定のgreetingMessageをTitleに渡すこと', () => {
    const wrapper = mountComponent(Index, { stubs: defaultStubs });

    expect(wrapper.findComponent(Title).props('title')).toBe('Hello, Frontend Architect Sample!');
  });

  test('useHealthの値を適切にHealthStatusDisplayAreaに渡すこと', () => {
    const mockHealthData = {
      healthStatus: 'healthy',
      healthTimestamp: '2024-01-01T00:00:00Z',
    };
    mockUseHealth.mockReturnValue(mockHealthData);

    const wrapper = mountComponent(Index, { stubs: defaultStubs });
    const healthComponent = wrapper.findComponent(HealthStatusDisplayArea);

    expect(healthComponent.props()).toEqual({
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
    });
  });
});
