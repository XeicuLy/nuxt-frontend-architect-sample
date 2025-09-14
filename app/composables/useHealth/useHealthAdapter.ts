import { useHealthQuery } from '@/queries/useHealthQuery';

export interface HealthStatusData {
  healthStatus: string;
  healthTimestamp: string;
}

export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data: healthData, suspense: getHealthData } = healthQuery;

  const healthStatus = computed<string>(() => healthData.value?.status ?? '-');
  const healthTimestamp = computed<string>(() => healthData.value?.timestamp ?? '-');

  const healthStatusData = computed<HealthStatusData>(() => ({
    healthStatus: healthStatus.value,
    healthTimestamp: healthTimestamp.value,
  }));

  return { isLoading, getHealthData, healthStatusData };
};
