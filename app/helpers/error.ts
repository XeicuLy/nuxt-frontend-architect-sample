import { DEFAULT_ERROR, ERROR_DEFINITIONS } from '@/constants/error';
import type { ErrorCode, ErrorInfo } from '@/types/error';

export const classifyError = (error: Error): ErrorInfo => {
  // $fetchエラーからサーバーのエラーコードを抽出
  const fetchError = error as Error & { data?: { errorCode?: string } };
  const serverErrorCode = fetchError.data?.errorCode;

  // エラーコードが有効かチェックして定義を取得
  if (serverErrorCode && serverErrorCode in ERROR_DEFINITIONS) {
    const definition = ERROR_DEFINITIONS[serverErrorCode as ErrorCode];
    return {
      errorCode: definition.errorCode,
      errorMessage: definition.message,
    };
  }

  // デフォルトエラーを返す
  return {
    errorCode: DEFAULT_ERROR.errorCode,
    errorMessage: DEFAULT_ERROR.message,
  };
};
