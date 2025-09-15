<script setup lang="ts">
import { useHealth } from '@/composables/useHealth';
import HealthStatusDisplayArea from './HealthStatusDisplayArea.vue';
import ErrorDisplayArea from './ErrorDisplayArea.vue';
import Title from './Title.vue';
import Input from './Input.vue';

const greetingMessage = 'Hello, Frontend Architect Sample!';

const { isLoading, healthStatusData, sampleInput, healthErrorDisplayData } = useHealth();
</script>

<template>
  <div>
    <Title :title="greetingMessage" />
    <template v-if="isLoading">
      <p>Loading...</p>
    </template>
    <template v-else-if="healthErrorDisplayData">
      <ErrorDisplayArea v-bind="healthErrorDisplayData" />
    </template>
    <template v-else>
      <HealthStatusDisplayArea v-bind="healthStatusData" />
      <div class="mt-4">
        <Input v-model:sample-input.lazy="sampleInput" />
      </div>
    </template>
  </div>
</template>
