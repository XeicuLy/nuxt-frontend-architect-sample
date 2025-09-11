import { useHealthAdapter } from './useHealthAdapter';

export const useHealth = () => {
  return {
    ...useHealthAdapter(),
  };
};
