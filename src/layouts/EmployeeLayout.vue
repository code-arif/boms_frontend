<template>
  <div class="employee-layout" style="padding-bottom:74px">
    <header class="sticky-top bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
      <div class="fw-semibold">🍳 BOMS</div>
      <div class="small text-muted">{{ auth.user?.name }}</div>
    </header>

    <main class="container-fluid p-0" style="max-width:600px;margin:0 auto">
      <router-view />
    </main>

    <BottomNav />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import BottomNav        from '@/components/shared/BottomNav.vue'
const auth = useAuthStore()
</script>