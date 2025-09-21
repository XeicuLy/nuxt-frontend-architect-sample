export interface ErrorDetail extends Error {
  data: {
    error: string;
    errorCode: string;
    timestamp: string;
  };
}
