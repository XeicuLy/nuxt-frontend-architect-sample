<script setup lang="ts">
import type { HealthStatusData } from '@/composables/useHealth/useHealthAdapter';

type Props = HealthStatusData;

defineProps<Props>();
</script>

<template>
  <ul>
    <li data-testid="status-display-aria">status: {{ healthStatus }}</li>
    <li data-testid="timestamp-display-aria">timestamp: {{ healthTimestamp }}</li>
  </ul>
</template>
