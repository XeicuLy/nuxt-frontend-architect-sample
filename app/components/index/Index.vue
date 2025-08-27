<script setup lang="ts">
import { useHealth } from '@/composables/useHealth';
import HealthStatusDisplayArea from './HealthStatusDisplayArea.vue';
import Title from './Title.vue';

const greetingMessage = 'Hello, Frontend Architect Sample!';

const { healthStatus, healthTimestamp } = useHealth();
</script>

<template>
  <div>
    <Title :title="greetingMessage" />
    <HealthStatusDisplayArea :status="healthStatus" :timestamp="healthTimestamp" />
  </div>
</template>
