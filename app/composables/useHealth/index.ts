import { useHealthAdapter } from './useHealthAdapter';
import { useHealthInput } from './useHealthInput';

export const useHealth = () => {
  return {
    ...useHealthAdapter(),
    ...useHealthInput(),
  };
};
