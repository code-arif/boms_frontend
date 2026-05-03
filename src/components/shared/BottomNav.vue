<template>
  <nav class="bottom-nav d-flex d-md-none">
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item"
      active-class="bottom-nav__item--active"
    >
      <span class="bottom-nav__icon" v-html="item.icon" />
      <span class="bottom-nav__label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const navItems = computed(() => {
  if (auth.isEmployee) return [
    { to: '/menu',    label: 'Menu',    icon: '🍳' },
    { to: '/order',   label: 'Order',   icon: '📋' },
    { to: '/history', label: 'History', icon: '🕐' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ]
  if (auth.isCompanyAdmin) return [
    { to: '/admin',          label: 'Dashboard', icon: '📊' },
    { to: '/admin/sessions', label: 'Sessions',  icon: '📅' },
    { to: '/admin/orders',   label: 'Orders',    icon: '📋' },
    { to: '/admin/team',     label: 'Team',      icon: '👥' },
  ]
  return []
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 64px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-nav__item {
  display: flex; flex-direction: column; align-items: center;
  flex: 1; text-decoration: none;
  color: #9ca3af; font-size: 11px; gap: 2px;
  transition: color .2s;
}
.bottom-nav__item--active { color: #5C6AC4; }
.bottom-nav__icon { font-size: 22px; line-height: 1; }
</style>