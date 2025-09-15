import { useHealthStore } from '@/store/health';

export const useHealthInput = () => {
  const healthStore = useHealthStore();
  const { input } = storeToRefs(healthStore);
  const { updateInput } = healthStore;

  const sampleInput = computed({
    get: () => input.value,
    set: (value: string) => updateInput(value),
  });

  return { sampleInput };
};
