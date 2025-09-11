import { useQuery } from '@tanstack/vue-query';
import { getHealthApi } from '@/services/health';

export const useHealthQuery = () => {
  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
  });
  return { healthQuery };
};
