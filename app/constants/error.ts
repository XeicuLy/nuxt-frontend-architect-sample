import { HTTP_STATUS } from '#shared/constants/httpStatus';
import type { ErrorDefinitionMap } from '@/types/error';

export const ERROR_CODES = {
  // ネットワーク関連エラー
  NETWORK_ERROR: 'NET_001',
  TIMEOUT_ERROR: 'NET_002',

  // サーバー関連エラー
  SERVER_ERROR: 'SVR_001',
  SERVICE_UNAVAILABLE: 'SVR_002',

  // 不明なエラー
  UNKNOWN_ERROR: 'UNK_001',
} as const;

export const ERROR_DEFINITIONS = {
  [ERROR_CODES.NETWORK_ERROR]: {
    errorCode: ERROR_CODES.NETWORK_ERROR,
    message: 'ネットワークエラーが発生しました',
    httpStatus: [
      HTTP_STATUS.NETWORK_ERROR,
      HTTP_STATUS.REQUEST_TIMEOUT,
      HTTP_STATUS.BAD_GATEWAY,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      HTTP_STATUS.GATEWAY_TIMEOUT,
    ] as const,
  },
  [ERROR_CODES.TIMEOUT_ERROR]: {
    errorCode: ERROR_CODES.TIMEOUT_ERROR,
    message: '接続がタイムアウトしました',
    httpStatus: [HTTP_STATUS.REQUEST_TIMEOUT] as const,
  },
  [ERROR_CODES.SERVER_ERROR]: {
    errorCode: ERROR_CODES.SERVER_ERROR,
    message: 'サーバーエラーが発生しました',
    httpStatus: [HTTP_STATUS.INTERNAL_SERVER_ERROR] as const,
  },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    errorCode: ERROR_CODES.SERVICE_UNAVAILABLE,
    message: 'サービスが一時的に利用できません',
    httpStatus: [HTTP_STATUS.SERVICE_UNAVAILABLE] as const,
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    errorCode: ERROR_CODES.UNKNOWN_ERROR,
    message: 'エラーが発生しました',
    httpStatus: [] as const,
  },
} as const satisfies ErrorDefinitionMap;

export const DEFAULT_ERROR = ERROR_DEFINITIONS[ERROR_CODES.UNKNOWN_ERROR];
