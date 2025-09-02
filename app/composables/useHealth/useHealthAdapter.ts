import { useHealthStore } from '@/store/useHealthStore';

export const useHealthAdapter = () => {
  const { healthStatus, healthTimestamp, getHealthData } = useHealthStore();

  return {
    healthStatus,
    healthTimestamp,
    getHealthData,
  };
};
