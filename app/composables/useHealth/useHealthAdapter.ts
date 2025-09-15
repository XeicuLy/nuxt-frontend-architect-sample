import { useHealthQuery } from '@/queries/useHealthQuery';

export interface HealthStatusData {
  healthStatus: string;
  healthTimestamp: string;
}

export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data: healthResult, suspense: getHealthData } = healthQuery;

  // 成功データ用 - 簡潔なmatch処理
  const healthStatusData = computed<HealthStatusData>(() => {
    if (!healthResult.value) {
      return { healthStatus: '-', healthTimestamp: '-' };
    }

    return healthResult.value.match(
      ({ status, timestamp }) => ({ healthStatus: status, healthTimestamp: timestamp }),
      () => ({ healthStatus: '-', healthTimestamp: '-' }),
    );
  });

  return { isLoading, getHealthData, healthStatusData };
};
