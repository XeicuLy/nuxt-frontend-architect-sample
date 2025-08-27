import type { GetApiHealthResponse } from '#shared/types/api';
import { useHealthService } from '@/services/useHealthService';

interface HealthState {
  healthData: GetApiHealthResponse;
}

export const useHealthStore = defineStore('health', () => {
  const state = reactive<HealthState>({
    healthData: {} as HealthState['healthData'],
  });

  const healthStatus = computed(() => state.healthData?.status);
  const healthTimestamp = computed(() => state.healthData?.timestamp);

  const getHealthData = async () => {
    const { getHealthApi } = useHealthService();
    const response = await getHealthApi();

    if (!response) {
      return;
    }

    state.healthData = response;
  };

  return {
    // state
    ...toRefs(state),
    // getters
    healthStatus,
    healthTimestamp,
    // actions
    getHealthData,
  };
});
