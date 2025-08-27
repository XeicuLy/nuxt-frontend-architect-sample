import { useHealthAdapter } from './useHealthAdapter';

export const useHealth = () => {
  return {
    ...useHealthAdapter(),
    // NOTE: 今後composablesのロジックが増えた場合にここに追加していく
  };
};
