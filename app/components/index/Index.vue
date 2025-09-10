<script setup lang="ts">
import { useHealth } from '@/composables/useHealth';
import HealthStatusDisplayArea from './HealthStatusDisplayArea.vue';
import Title from './Title.vue';

const greetingMessage = 'Hello, Frontend Architect Sample!';

const { isLoading, healthStatusData } = useHealth();
</script>

<template>
  <div>
    <Title :title="greetingMessage" />
    <template v-if="isLoading">
      <p>Loading...</p>
    </template>
    <template v-else>
      <HealthStatusDisplayArea v-bind="healthStatusData" />
    </template>
  </div>
</template>
