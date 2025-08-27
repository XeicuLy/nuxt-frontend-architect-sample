<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<template>
  <h1 class="text-lg font-bold">{{ title }}</h1>
</template>
