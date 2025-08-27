<script setup lang="ts">
interface Props {
  status: string;
  timestamp: string;
}

defineProps<Props>();
</script>

<template>
  <ul>
    <li>status: {{ status }}</li>
    <li>timestamp: {{ timestamp }}</li>
  </ul>
</template>
