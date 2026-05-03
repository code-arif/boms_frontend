<template>
  <div class="emp-layout">
    <!-- Sticky top header -->
    <header class="emp-header">
      <div class="emp-header__brand">
        <span class="emp-logo">🍳</span>
        <div>
          <p class="emp-brand-name">BOMS</p>
          <p class="emp-brand-sub">{{ auth.companyName }}</p>
        </div>
      </div>
      <div class="emp-header__right">
        <div class="emp-avatar" @click="showProfileMenu = !showProfileMenu">
          {{ auth.userInitials }}
          <!-- mini dropdown -->
          <div v-if="showProfileMenu" class="emp-profile-menu" @click.stop>
            <div class="emp-profile-header">
              <p class="emp-profile-name">{{ auth.userName }}</p>
              <p class="emp-profile-email">{{ auth.userEmail }}</p>
            </div>
            <button class="emp-profile-logout" @click="handleLogout">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Page content with bottom nav padding -->
    <main class="emp-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Mobile bottom navigation -->
    <BottomNav />
  </div>

  <!-- Click-away to close profile menu -->
  <div v-if="showProfileMenu" class="emp-overlay" @click="showProfileMenu = false" />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BottomNav from '@/components/shared/BottomNav.vue'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const showProfileMenu = ref(false)

async function handleLogout() {
  showProfileMenu.value = false
  await auth.logout()
  toast.success('Logged out successfully.')
  router.push('/login')
}
</script>

<style scoped>
.emp-layout {
  min-height: 100vh;
  background: var(--gray-50);
  padding-bottom: var(--bottom-nav);
  display: flex;
  flex-direction: column;
}

.emp-header {
  background: #fff;
  border-bottom: 1px solid var(--gray-100);
  padding: .75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.emp-header__brand {
  display: flex;
  align-items: center;
  gap: .625rem;
}

.emp-logo {
  font-size: 1.375rem;
}

.emp-brand-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  letter-spacing: -.02em;
  line-height: 1;
}

.emp-brand-sub {
  font-size: 11px;
  color: var(--gray-400);
  margin: 0;
}

.emp-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.emp-profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 200px;
  overflow: hidden;
  z-index: 200;
}

.emp-profile-header {
  padding: .875rem 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.emp-profile-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.emp-profile-email {
  font-size: 12px;
  color: var(--gray-400);
  margin: 0;
  margin-top: 2px;
}

.emp-profile-logout {
  display: flex;
  align-items: center;
  gap: .5rem;
  width: 100%;
  padding: .75rem 1rem;
  border: none;
  background: none;
  color: var(--danger);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
}

.emp-profile-logout:hover {
  background: var(--danger-light);
}

.emp-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.emp-content {
  flex: 1;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 1rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>