import consola from 'consola';
import { type GetApiHealthResponse, zGetApiHealthResponse } from '#shared/types/api';
import type { HealthErrorDetail } from '@/types/error';

export const getHealthApi = async (): Promise<GetApiHealthResponse> => {
  try {
    const response = await $fetch<GetApiHealthResponse>('/api/health', {
      method: 'GET',
      timeout: 5_000,
      query: { simulate: 'error' },
    });
    return zGetApiHealthResponse.parse(response);
  } catch (error) {
    const errorDetail = error as HealthErrorDetail;
    consola.error('Error fetching health API:', errorDetail.message);
    consola.error(errorDetail.data.errorCode);
    throw errorDetail;
  }
};
