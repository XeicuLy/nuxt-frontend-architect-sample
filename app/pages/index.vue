<script setup lang="ts">
const indexPageId = useId();

const greetingMessage = 'Hello, Frontend Architect Sample!';
</script>
<template>
  <section :id="indexPageId">
    <h1>{{ greetingMessage }}</h1>
  </section>
</template>
