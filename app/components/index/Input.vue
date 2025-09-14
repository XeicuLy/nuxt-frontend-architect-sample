<script setup lang="ts">
const sampleInput = defineModel<string>('sampleInput');
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
