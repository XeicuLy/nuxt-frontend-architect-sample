import { useHealthAdapter } from './useHealthAdapter';
import { useHealthQuery } from './useHealthQuery';

export const useHealth = () => {
  return {
    ...useHealthAdapter(),
    ...useHealthQuery(),
  };
};
