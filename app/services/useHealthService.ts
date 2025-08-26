import type { GetApiHealthResponse } from '#shared/types/api';

export const useHealthService = () => {
  const getHealthApi = async () => {
    const { data } = await useFetch<GetApiHealthResponse>('/api/health', {
      method: 'GET',
    });
    return data.value;
  };

  return { getHealthApi };
};
