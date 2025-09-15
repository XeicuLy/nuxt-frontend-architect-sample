/**
 * HTTPステータスコード定数
 *
 * RFC 7231に基づく標準的なHTTPステータスコード
 * keyof typeof パターンで型安全性を確保
 */
export const HTTP_STATUS = {
  // 成功レスポンス
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // リダイレクション
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // クライアントエラー
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // サーバーエラー
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,

  // 特殊ケース
  NETWORK_ERROR: 0, // fetch APIでネットワーク接続エラー時
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type HttpStatusKey = keyof typeof HTTP_STATUS;
