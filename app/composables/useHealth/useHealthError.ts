import { classifyError } from '@/helpers/error';
import { useHealthQuery } from '@/queries/useHealthQuery';
import type { ErrorCode } from '@/types/error';

export interface HealthErrorDisplayData {
  errorMessage: string;
  errorCode: ErrorCode;
  retryAction: () => void;
}

export const useHealthError = () => {
  // ヘルスチェック機能を取得
  const { healthQuery } = useHealthQuery();
  const { data: healthResult, refetch } = healthQuery;

  const healthErrorDisplayData = computed<HealthErrorDisplayData | null>(() => {
    if (!healthResult.value) {
      return null;
    }

    // Result型の match で成功・失敗を判定
    return healthResult.value.match(
      // 成功時: エラー表示は不要
      () => null,

      // エラー時: エラー情報を作成してリトライ機能を追加
      (error) => ({
        // classifyError でユーザー向け情報に変換
        ...classifyError(error),
        // リトライボタンの処理を追加
        retryAction: refetch,
      }),
    );
  });

  return {
    /** エラー表示用データ（エラーがない場合はnull） */
    healthErrorDisplayData,
  };
};
