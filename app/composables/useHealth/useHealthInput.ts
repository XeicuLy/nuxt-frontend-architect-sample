import { useHealthStore } from '~/store/health';

export const useHealthInput = () => {
  const healthStore = useHealthStore();
  const { input } = storeToRefs(healthStore);
  const { updateInput } = healthStore;

  return { input, updateInput };
};
