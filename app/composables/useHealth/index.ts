import { useHealthAdapter } from './useHealthAdapter';
import { useHealthError } from './useHealthError';
import { useHealthInput } from './useHealthInput';

export const useHealth = () => {
  return {
    ...useHealthAdapter(),
    ...useHealthError(),
    ...useHealthInput(),
  };
};
