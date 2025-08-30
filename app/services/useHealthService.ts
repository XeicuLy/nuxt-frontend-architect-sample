import { useQuery } from '@tanstack/vue-query';
import type { GetApiHealthResponse } from '#shared/types/api';

export const useHealthService = () => {
  const getHealthApi = async (): Promise<GetApiHealthResponse> => {
    const response = await $fetch<GetApiHealthResponse>('/api/health', {
      method: 'GET',
    });
    return response;
  };

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealthApi,
  });

  return {
    getHealthApi,
    healthQuery,
  };
};
