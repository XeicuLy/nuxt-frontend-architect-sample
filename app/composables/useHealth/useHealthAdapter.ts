import { useHealthQuery } from '@/queries/useHealthQuery';
import type { ErrorDetail } from '@/types/error';

export interface HealthStatusData {
  healthStatus: string;
  healthTimestamp: string;
}

export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data: healthData, error, suspense: getHealthData } = healthQuery;

  const healthStatus = computed<string>(() => healthData.value?.status ?? '-');
  const healthTimestamp = computed<string>(() => healthData.value?.timestamp ?? '-');

  const healthStatusData = computed<HealthStatusData>(() => ({
    healthStatus: healthStatus.value,
    healthTimestamp: healthTimestamp.value,
  }));

  // エラーコードを取得するcomputed
  const errorCode = computed<string | null>(() => {
    if (!error.value) return null;
    const errorDetail = error.value as ErrorDetail;
    return errorDetail.data?.errorCode ?? null;
  });

  return { 
    isLoading, 
    healthStatusData, 
    getHealthData,
    error,
    errorCode
  };
};
