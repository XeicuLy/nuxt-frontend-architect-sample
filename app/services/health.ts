import consola from 'consola';
import { err, ok, type Result } from 'neverthrow';
import { type GetApiHealthResponse, zGetApiHealthResponse } from '#shared/types/api';

type HealthResult = Result<GetApiHealthResponse, Error>;

export const getHealthApi = async (): Promise<HealthResult> => {
  try {
    const response = await $fetch<GetApiHealthResponse>('/api/health', {
      method: 'GET',
      timeout: 5_000,
    });
    const validatedData = zGetApiHealthResponse.parse(response);
    return ok(validatedData);
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
    consola.error(`[Health Service] API health check failed: ${errorObj.message}`);
    return err(errorObj);
  }
};
