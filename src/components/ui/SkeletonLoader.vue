<template>
  <div class="skeleton-wrap" :style="{ gap: gap + 'px', display: 'flex', flexDirection: 'column', width: '100%' }">
    <div v-for="n in count" :key="n" class="skeleton-block" :style="{
      height: height + 'px',
      borderRadius: radius + 'px',
      width: typeof width === 'number' ? width + 'px' : width,
    }" />
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 },
  height: { type: Number, default: 56 },
  gap: { type: Number, default: 10 },
  radius: { type: Number, default: 10 },
  width: { type: [Number, String], default: '100%' },
})
</script>

<style scoped>
.skeleton-block {
  background: linear-gradient(90deg,
      #f0f0f0 25%,
      #e0e0e0 37%,
      #f0f0f0 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  flex-shrink: 0;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>