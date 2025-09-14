export const useHealthStore = defineStore('health', () => {
  const input = ref('');

  const updateInput = (value: string): void => {
    input.value = value;
  };

  return {
    // state
    input,
    // actions
    updateInput,
  };
});
