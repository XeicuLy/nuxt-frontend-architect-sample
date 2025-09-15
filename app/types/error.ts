import type { HttpStatusCode } from '#shared/constants/httpStatus';
import type { ERROR_CODES } from '@/constants/error';

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type ErrorCodeKey = keyof typeof ERROR_CODES;

export interface ErrorInfo {
  readonly errorCode: ErrorCode;
  readonly errorMessage: string;
}

export interface ErrorDefinition {
  readonly errorCode: ErrorCode;
  readonly message: string;
  readonly httpStatus: readonly HttpStatusCode[];
}

export type ErrorDefinitionMap = Record<ErrorCode, ErrorDefinition>;
