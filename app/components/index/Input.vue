<script setup lang="ts">
import { useHealth } from '@/composables/useHealth';

const { input, updateInput } = useHealth();

const sampleInput = computed({
  get: () => input.value,
  set: (value: string) => updateInput(value),
});
</script>

<template>
  <label for="sample-input">
    Sample Input:
    <input
      id="sample-input"
      v-model="sampleInput"
      data-testid="sample-input"
      type="text"
      aria-labelledby="sample-input-label"
      class="border border-black"
    />
  </label>
</template>
