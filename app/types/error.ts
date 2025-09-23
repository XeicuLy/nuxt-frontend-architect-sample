import type { FetchError } from 'ofetch';
import type { GetApiHealthError } from '#shared/types/api';

export interface HealthErrorDetail extends FetchError {
  data: GetApiHealthError;
}
