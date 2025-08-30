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
    const { healthQuery } = useHealthService();
    const { data: healthData } = await healthQuery.refetch();

    if (!healthData) {
      return;
    }

    state.healthData = healthData;
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
