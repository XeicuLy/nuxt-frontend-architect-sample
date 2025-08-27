export const useRuntime = () => {
  const isProcessClient = computed<boolean>(() => import.meta.client);
  const isProcessServer = computed<boolean>(() => import.meta.server);

  return { isProcessClient, isProcessServer };
};
