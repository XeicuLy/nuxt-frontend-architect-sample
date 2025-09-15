<script setup lang="ts">
import type { HealthErrorDisplayData } from '@/composables/useHealth/useHealthError';

type Props = HealthErrorDisplayData;

defineProps<Props>();
</script>

<template>
  <div class="border-l-4 border-red-500 bg-red-50 p-4">
    <p class="text-red-600">{{ errorMessage }}</p>
    <button class="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" @click="retryAction">再試行</button>
  </div>
</template>
