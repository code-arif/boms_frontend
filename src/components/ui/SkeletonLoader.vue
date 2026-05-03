<template>
  <div class="skeleton-wrap" :style="{ gap: gap + 'px' }">
    <div
      v-for="n in count"
      :key="n"
      class="skeleton-block"
      :style="{ height: height + 'px', borderRadius: radius + 'px' }"
    />
  </div>
</template>

<script setup>
defineProps({
  count:  { type: Number, default: 3 },
  height: { type: Number, default: 60 },
  gap:    { type: Number, default: 12 },
  radius: { type: Number, default: 10 },
})
</script>

<style scoped>
.skeleton-wrap  { display: flex; flex-direction: column; width: 100%; }
.skeleton-block {
  width: 100%;
  background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>