import { useHealthStore } from '@/store/useHealthStore';

export const useHealthAdapter = () => {
  const healthStore = useHealthStore();
  const { healthStatus, healthTimestamp } = storeToRefs(healthStore);
  const { getHealthData } = healthStore;

  return {
    healthStatus,
    healthTimestamp,
    getHealthData,
  };
};
