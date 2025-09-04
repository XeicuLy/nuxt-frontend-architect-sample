import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mountSuspendedComponent } from '@/helpers/test';
import IndexPage from '@/pages/index.vue';

const Index = {
  template: '<div id="index-component">Index Component</div>',
};
const defaultStubs = { Index };

const mockGetHealthData = vi.fn();

const { mockUseRenderEnvironment, mockUseHealth } = vi.hoisted(() => ({
  mockUseRenderEnvironment: vi.fn(),
  mockUseHealth: vi.fn(() => ({
    getHealthData: mockGetHealthData,
  })),
}));

vi.mock('@/composables/common/useRenderEnvironment', () => ({
  useRenderEnvironment: mockUseRenderEnvironment,
}));

vi.mock('@/composables/useHealth', () => ({
  useHealth: mockUseHealth,
}));

describe('app/pages/index.vue', () => {
  beforeEach(() => {
    mockUseRenderEnvironment.mockReturnValue({ isInitialClientRender: { value: true } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('子コンポーネントのIndexコンポーネントが存在すること', async () => {
    const wrapper = await mountSuspendedComponent(IndexPage, { stubs: defaultStubs });

    expect(wrapper.findComponent(Index).exists()).toBe(true);
  });

  test('isInitialClientRenderがfalseのとき、関数が実行されること', async () => {
    mockUseRenderEnvironment.mockReturnValue({ isInitialClientRender: { value: false } });
    await mountSuspendedComponent(IndexPage, { stubs: defaultStubs });

    expect(mockGetHealthData).toHaveBeenCalledTimes(1);
  });
});
