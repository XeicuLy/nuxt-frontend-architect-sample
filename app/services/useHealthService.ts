import { useQuery } from '@tanstack/vue-query';
import { type GetApiHealthResponse, zGetApiHealthResponse } from '#shared/types/api';

export const useHealthService = () => {
  const getHealthApi = async (): Promise<GetApiHealthResponse> => {
    const response = await $fetch<GetApiHealthResponse>('/api/health', {
      method: 'GET',
    });

    const data = zGetApiHealthResponse.parse(response);
    return data;
  };

  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
  });

  return {
    getHealthApi,
    healthQuery,
  };
};
