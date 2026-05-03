<template>
    <div class="ca-layout" :class="{ 'ca-layout--collapsed': sidebarCollapsed }">
        <!-- Desktop Sidebar -->
        <aside class="ca-sidebar d-none d-md-flex" :class="{ 'ca-sidebar--collapsed': sidebarCollapsed }">
            <!-- Logo -->
            <div class="ca-sidebar__logo">
                <span class="ca-logo-icon">🍳</span>
                <transition name="fade-text">
                    <div v-if="!sidebarCollapsed" class="ca-logo-text">
                        <span class="ca-logo-name">BOMS</span>
                        <span class="ca-logo-company">{{ auth.companyName || 'Admin Panel' }}</span>
                    </div>
                </transition>
            </div>

            <!-- Nav -->
            <nav class="ca-sidebar__nav">
                <template v-for="group in navGroups" :key="group.label">
                    <transition name="fade-text">
                        <p v-if="!sidebarCollapsed && group.label" class="ca-nav-group-label">{{ group.label }}</p>
                    </transition>
                    <router-link v-for="item in group.items" :key="item.to" :to="item.to" class="ca-nav-link"
                        active-class="ca-nav-link--active" :title="sidebarCollapsed ? item.label : ''">
                        <span class="ca-nav-icon" v-html="item.icon" />
                        <transition name="fade-text">
                            <span v-if="!sidebarCollapsed" class="ca-nav-label">{{ item.label }}</span>
                        </transition>
                    </router-link>
                </template>
            </nav>

            <!-- Footer -->
            <div class="ca-sidebar__footer">
                <div class="ca-user" :class="{ 'ca-user--collapsed': sidebarCollapsed }">
                    <div class="ca-avatar">{{ auth.userInitials }}</div>
                    <transition name="fade-text">
                        <div v-if="!sidebarCollapsed" class="ca-user-info">
                            <p class="ca-user-name">{{ auth.userName }}</p>
                            <p class="ca-user-role">Company Admin</p>
                        </div>
                    </transition>
                </div>
                <button class="ca-logout-btn" @click="handleLogout">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    <transition name="fade-text">
                        <span v-if="!sidebarCollapsed">Logout</span>
                    </transition>
                </button>
            </div>

            <button class="ca-toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                    :style="{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
        </aside>

        <!-- Main content -->
        <div class="ca-main">
            <!-- Mobile Header -->
            <header class="ca-mobile-header d-flex d-md-none">
                <div class="ca-mobile-header__brand">
                    <span class="ca-mobile-logo">🍳</span>
                    <span class="ca-mobile-title">{{ auth.companyName || 'BOMS' }}</span>
                </div>
                <div class="ca-mobile-header__right">
                    <div class="ca-mobile-avatar">{{ auth.userInitials }}</div>
                </div>
            </header>

            <!-- Desktop Header -->
            <header class="ca-header d-none d-md-flex">
                <div>
                    <h1 class="ca-page-title">{{ pageTitle }}</h1>
                    <p class="ca-page-sub">{{ auth.companyName }}</p>
                </div>
                <div class="ca-header__right">
                    <div class="ca-header-date">{{ currentDate }}</div>
                </div>
            </header>

            <!-- Page content -->
            <main class="ca-content">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>

        <!-- Mobile Bottom Navigation -->
        <BottomNav />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BottomNav from '@/components/shared/BottomNav.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const sidebarCollapsed = ref(false)

const navGroups = [
    {
        label: 'Overview',
        items: [
            {
                to: '/admin/dashboard',
                label: 'Dashboard',
                icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
            },
        ],
    },
    {
        label: 'Operations',
        items: [
            {
                to: '/admin/sessions',
                label: 'Order Sessions',
                icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
            },
            {
                to: '/admin/users',
                label: 'Employees',
                icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
            },
        ],
    },
]

const pageMeta = {
    '/admin/dashboard': { title: 'Dashboard' },
    '/admin/sessions': { title: 'Order Sessions' },
    '/admin/users': { title: 'Employees' },
}
const pageTitle = computed(() => pageMeta[route.path]?.title || 'Admin')
const currentDate = computed(() => new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
}))

async function handleLogout() {
    await auth.logout()
    toast.success('Logged out.')
    router.push('/login')
}
</script>

<style scoped>
.ca-layout {
    display: flex;
    min-height: 100vh;
    background: var(--gray-50);
    padding-bottom: var(--bottom-nav);
}

@media (min-width: 768px) {
    .ca-layout {
        padding-bottom: 0;
    }
}

.ca-sidebar {
    width: var(--sidebar-width);
    min-height: 100vh;
    background: #1E293B;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    transition: width .25s cubic-bezier(.4, 0, .2, 1);
    overflow: visible;
}

.ca-sidebar--collapsed {
    width: 68px;
}

.ca-sidebar__logo {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: 1.125rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
    overflow: hidden;
    white-space: nowrap;
    flex-shrink: 0;
}

.ca-logo-icon {
    font-size: 1.375rem;
    flex-shrink: 0;
}

.ca-logo-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.ca-logo-name {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -.02em;
    line-height: 1;
}

.ca-logo-company {
    font-size: 10px;
    color: rgba(255, 255, 255, .35);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}

.ca-sidebar__nav {
    flex: 1;
    padding: .75rem .625rem;
    overflow-y: auto;
    overflow-x: hidden;
}

.ca-nav-group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: rgba(255, 255, 255, .25);
    padding: .625rem .625rem .25rem;
    margin: 0;
    white-space: nowrap;
}

.ca-nav-link {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .625rem .75rem;
    border-radius: var(--radius-md);
    color: rgba(255, 255, 255, .55);
    font-size: 13.5px;
    font-weight: 500;
    transition: background .15s, color .15s;
    white-space: nowrap;
    overflow: hidden;
    text-decoration: none;
    margin-bottom: 2px;
}

.ca-nav-link:hover {
    background: rgba(255, 255, 255, .06);
    color: rgba(255, 255, 255, .9);
}

.ca-nav-link--active {
    background: var(--primary);
    color: #fff;
}

.ca-nav-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
}

.ca-nav-label {
    flex: 1;
}

.ca-sidebar__footer {
    border-top: 1px solid rgba(255, 255, 255, .05);
    padding: .75rem .625rem;
    display: flex;
    flex-direction: column;
    gap: .375rem;
    overflow: hidden;
    flex-shrink: 0;
}

.ca-user {
    display: flex;
    align-items: center;
    gap: .625rem;
    padding: .5rem .5rem;
    border-radius: var(--radius-md);
    overflow: hidden;
    white-space: nowrap;
}

.ca-user--collapsed {
    justify-content: center;
}

.ca-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10B981, #059669);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}

.ca-user-info {
    min-width: 0;
}

.ca-user-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ca-user-role {
    font-size: 11px;
    color: rgba(255, 255, 255, .3);
    margin: 0;
}

.ca-logout-btn {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .625rem .75rem;
    border: none;
    background: none;
    color: rgba(255, 255, 255, .35);
    font-size: 13px;
    font-weight: 500;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background .15s, color .15s;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    font-family: inherit;
}

.ca-logout-btn:hover {
    background: rgba(239, 68, 68, .12);
    color: #f87171;
}

.ca-toggle-btn {
    position: absolute;
    top: 50%;
    right: -11px;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    background: #334155;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, .6);
    z-index: 10;
    transition: background .15s;
}

.ca-toggle-btn:hover {
    background: #475569;
    color: #fff;
}

/* Main */
.ca-main {
    flex: 1;
    margin-left: var(--sidebar-width);
    transition: margin-left .25s cubic-bezier(.4, 0, .2, 1);
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.ca-layout--collapsed .ca-main {
    margin-left: 68px;
}

@media (max-width: 767px) {
    .ca-main {
        margin-left: 0 !important;
    }
}

.ca-mobile-header {
    background: #fff;
    border-bottom: 1px solid var(--gray-200);
    padding: .875rem 1rem;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
}

.ca-mobile-header__brand {
    display: flex;
    align-items: center;
    gap: .5rem;
}

.ca-mobile-logo {
    font-size: 1.25rem;
}

.ca-mobile-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    letter-spacing: -.02em;
}

.ca-mobile-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10B981, #059669);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
}

.ca-header {
    background: #fff;
    border-bottom: 1px solid var(--gray-200);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
}

.ca-page-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
    letter-spacing: -.02em;
}

.ca-page-sub {
    font-size: 12px;
    color: var(--gray-400);
    margin: 0;
}

.ca-header-date {
    font-size: 13px;
    color: var(--gray-500);
}

.ca-content {
    flex: 1;
    padding: 1.5rem 2rem 2rem;
}

@media (max-width: 767px) {
    .ca-content {
        padding: 1rem;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .18s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-text-enter-active,
.fade-text-leave-active {
    transition: opacity .15s;
    overflow: hidden;
}

.fade-text-enter-from,
.fade-text-leave-to {
    opacity: 0;
}
</style>