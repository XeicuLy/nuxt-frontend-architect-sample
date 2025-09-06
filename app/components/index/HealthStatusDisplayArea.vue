<script setup lang="ts">
interface Props {
  status: string;
  timestamp: string;
}

defineProps<Props>();
</script>

<template>
  <ul>
    <li data-testid="status-display-aria">status: {{ status }}</li>
    <li data-testid="timestamp-display-aria">timestamp: {{ timestamp }}</li>
  </ul>
</template>
