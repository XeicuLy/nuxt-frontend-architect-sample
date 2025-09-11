<script setup lang="ts">
import type { HealthStatusData } from '@/composables/useHealth/useHealthAdapter';

type Props = HealthStatusData;

defineProps<Props>();
</script>

<template>
  <ul>
    <li data-testid="status-display-area">status: {{ healthStatus }}</li>
    <li data-testid="timestamp-display-area">timestamp: {{ healthTimestamp }}</li>
  </ul>
</template>
