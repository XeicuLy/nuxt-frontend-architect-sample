<script setup lang="ts">
import Index from '@/components/index/Index.vue';
import { useRenderEnvironment } from '@/composables/common/useRenderEnvironment';
import { useHealth } from '~/composables/useHealth';

const indexPageId = useId();
const { isInitialClientRender } = useRenderEnvironment();
const { getHealthData } = useHealth();

const handleInit = async () => {
  if (isInitialClientRender.value) {
    return;
  }

  await getHealthData();
};

await handleInit();
</script>

<template>
  <section :id="indexPageId">
    <Index />
  </section>
</template>
