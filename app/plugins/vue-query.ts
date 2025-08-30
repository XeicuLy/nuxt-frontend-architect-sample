import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分間キャッシュ
        gcTime: 1000 * 60 * 30, // 30分間メモリに保持
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 1,
      },
    },
  });

  const options: VueQueryPluginOptions = {
    queryClient,
  };

  nuxtApp.vueApp.use(VueQueryPlugin, options);

  return {
    provide: {
      queryClient,
    },
  };
});
