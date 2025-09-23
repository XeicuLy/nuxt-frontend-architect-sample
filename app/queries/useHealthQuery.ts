import { useQuery } from '@tanstack/vue-query';
import type { GetApiHealthResponse } from '#shared/types/api';
import { getHealthApi } from '@/services/health';
import type { HealthErrorDetail } from '@/types/error';

export const useHealthQuery = () => {
  const healthQuery = useQuery<GetApiHealthResponse, HealthErrorDetail>({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
  });
  return { healthQuery };
};
