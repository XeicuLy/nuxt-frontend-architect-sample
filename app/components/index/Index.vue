<script setup lang="ts">
import { useHealth } from '@/composables/useHealth';
import HealthStatusDisplayArea from './HealthStatusDisplayArea.vue';
import Title from './Title.vue';
import Input from './Input.vue';

const greetingMessage = 'Hello, Frontend Architect Sample!';

const { isLoading, healthStatusData, sampleInput, healthError, errorCode } = useHealth();

const errorMessage = computed(() => (healthError.value ? healthError.value.message : null));
const hasError = computed(() => Boolean(errorMessage.value && errorCode.value));
</script>

<template>
  <div>
    <Title :title="greetingMessage" />
    <template v-if="isLoading">
      <p>Loading...</p>
    </template>
    <template v-else-if="hasError">
      <div class="text-red-500">
        <p>Error: {{ errorMessage }}</p>
        <template v-if="errorCode">
          <p>Error Code: {{ errorCode }}</p>
        </template>
      </div>
    </template>
    <template v-else>
      <HealthStatusDisplayArea v-bind="healthStatusData" />
      <div class="mt-4">
        <Input v-model:sample-input.lazy="sampleInput" />
      </div>
    </template>
  </div>
</template>
