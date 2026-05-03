<template>
    <div class="sa-layout" :class="{ 'sa-layout--collapsed': sidebarCollapsed }">
        <!-- Mobile Overlay -->
        <div v-if="mobileSidebarOpen" class="sa-sidebar-overlay" @click="mobileSidebarOpen = false"></div>

        <!-- Sidebar -->
        <aside class="sa-sidebar" :class="{ 'sa-sidebar--collapsed': sidebarCollapsed, 'sa-sidebar--mobile-open': mobileSidebarOpen }">
            <!-- Logo -->
            <div class="sa-sidebar__logo">
                <span class="sa-logo-icon">🍳</span>
                <transition name="fade-text">
                    <div v-if="!sidebarCollapsed" class="sa-logo-text">
                        <span class="sa-logo-name">BOMS</span>
                        <span class="sa-logo-tag">Super Admin</span>
                    </div>
                </transition>
            </div>

            <!-- Nav -->
            <nav class="sa-sidebar__nav">
                <template v-for="group in navGroups" :key="group.label">
                    <transition name="fade-text">
                        <p v-if="!sidebarCollapsed && group.label" class="sa-nav-group-label">{{ group.label }}</p>
                    </transition>
                    <router-link v-for="item in group.items" :key="item.to" :to="item.to" class="sa-nav-link"
                        active-class="sa-nav-link--active" :title="sidebarCollapsed ? item.label : ''" @click="mobileSidebarOpen = false">
                        <span class="sa-nav-icon" v-html="item.icon" />
                        <transition name="fade-text">
                            <span v-if="!sidebarCollapsed" class="sa-nav-label">{{ item.label }}</span>
                        </transition>
                    </router-link>
                </template>
            </nav>

            <!-- Footer -->
            <div class="sa-sidebar__footer">
                <div class="sa-user" :class="{ 'sa-user--collapsed': sidebarCollapsed }">
                    <div class="sa-avatar">SA</div>
                    <transition name="fade-text">
                        <div v-if="!sidebarCollapsed" class="sa-user-info">
                            <p class="sa-user-name">{{ auth.userName }}</p>
                            <p class="sa-user-role">Super Administrator</p>
                        </div>
                    </transition>
                </div>
                <button class="sa-logout-btn" @click="handleLogout" :title="sidebarCollapsed ? 'Logout' : ''">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    <transition name="fade-text">
                        <span v-if="!sidebarCollapsed">Logout</span>
                    </transition>
                </button>
            </div>

            <!-- Toggle button -->
            <button class="sa-toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                    :style="{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
        </aside>

        <!-- Main content -->
        <div class="sa-main">
            <!-- Top header -->
            <header class="sa-header">
                <div class="sa-header__left">
                    <button class="sa-mobile-toggle" @click="mobileSidebarOpen = true">
                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <div>
                        <h1 class="sa-page-title">{{ pageTitle }}</h1>
                        <p class="sa-page-sub">{{ pageSubtitle }}</p>
                    </div>
                </div>
                <div class="sa-header__right">
                    <div class="sa-header-badge">
                        <span class="sa-status-dot" />
                        Platform Active
                    </div>
                    <div class="sa-header-time">{{ currentTime }}</div>
                </div>
            </header>

            <!-- Page content -->
            <main class="sa-content">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const currentTime = ref('')
let timer = null

// Nav definition
const navGroups = [
    {
        label: 'Overview',
        items: [
            {
                to: '/super/dashboard',
                label: 'Dashboard',
                icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
            },
        ],
    },
    {
        label: 'Management',
        items: [
            {
                to: '/super/companies',
                label: 'Companies',
                icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
            },
            {
                to: '/super/audit',
                label: 'Audit Logs',
                icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
            },
        ],
    },
]

const pageMeta = {
    '/super/dashboard': { title: 'Platform Dashboard', sub: 'System-wide analytics and overview' },
    '/super/companies': { title: 'Company Management', sub: 'Manage all tenant companies' },
    '/super/audit': { title: 'Audit Logs', sub: 'Track all platform actions' },
}

const pageTitle = computed(() => pageMeta[route.path]?.title || 'Super Admin')
const pageSubtitle = computed(() => pageMeta[route.path]?.sub || '')

function updateTime() {
    currentTime.value = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

async function handleLogout() {
    await auth.logout()
    toast.success('Logged out.')
    router.push('/login')
}

onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
/* Layout */
.sa-layout {
    display: flex;
    min-height: 100vh;
    background: var(--gray-50);
    transition: padding-left .25s cubic-bezier(.4, 0, .2, 1);
}

/* Sidebar */
.sa-sidebar {
    width: var(--sidebar-width);
    min-height: 100vh;
    background: #0F172A;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    transition: width .25s cubic-bezier(.4, 0, .2, 1);
    overflow: visible;
    box-shadow: 4px 0 24px rgba(0, 0, 0, .12);
}

.sa-sidebar--collapsed {
    width: 68px;
}

.sa-sidebar__logo {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: 1.125rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, .05);
    overflow: hidden;
    white-space: nowrap;
    flex-shrink: 0;
}

.sa-logo-icon {
    font-size: 1.375rem;
    flex-shrink: 0;
}

.sa-logo-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.sa-logo-name {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -.02em;
    line-height: 1;
}

.sa-logo-tag {
    font-size: 10px;
    color: rgba(255, 255, 255, .35);
    font-weight: 500;
    letter-spacing: .04em;
}

.sa-sidebar__nav {
    flex: 1;
    padding: .75rem .625rem;
    overflow-y: auto;
    overflow-x: hidden;
}

.sa-nav-group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: rgba(255, 255, 255, .25);
    padding: .625rem .625rem .25rem;
    margin: 0;
    white-space: nowrap;
}

.sa-nav-link {
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

.sa-nav-link:hover {
    background: rgba(255, 255, 255, .06);
    color: rgba(255, 255, 255, .9);
}

.sa-nav-link--active {
    background: var(--primary);
    color: #fff;
}

.sa-nav-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
}

.sa-nav-label {
    flex: 1;
}

.sa-sidebar__footer {
    border-top: 1px solid rgba(255, 255, 255, .05);
    padding: .75rem .625rem;
    display: flex;
    flex-direction: column;
    gap: .375rem;
    overflow: hidden;
    flex-shrink: 0;
}

.sa-user {
    display: flex;
    align-items: center;
    gap: .625rem;
    padding: .5rem .5rem;
    border-radius: var(--radius-md);
    overflow: hidden;
    white-space: nowrap;
}

.sa-user--collapsed {
    justify-content: center;
}

.sa-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}

.sa-user-info {
    min-width: 0;
}

.sa-user-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sa-user-role {
    font-size: 11px;
    color: rgba(255, 255, 255, .3);
    margin: 0;
}

.sa-logout-btn {
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

.sa-logout-btn:hover {
    background: rgba(239, 68, 68, .12);
    color: #f87171;
}

.sa-toggle-btn {
    position: absolute;
    top: 50%;
    right: -11px;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    background: #1E293B;
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

.sa-toggle-btn:hover {
    background: #334155;
    color: #fff;
}

/* Main area */
.sa-main {
    flex: 1;
    margin-left: var(--sidebar-width);
    transition: margin-left .25s cubic-bezier(.4, 0, .2, 1);
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.sa-layout--collapsed .sa-main {
    margin-left: 68px;
}

.sa-header {
    background: #fff;
    border-bottom: 1px solid var(--gray-200);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
}

.sa-header__left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.sa-mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--gray-900);
    cursor: pointer;
    padding: 0;
    align-items: center;
    justify-content: center;
}

.sa-page-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
    letter-spacing: -.02em;
}

.sa-page-sub {
    font-size: 12px;
    color: var(--gray-400);
    margin: 0;
}

.sa-header__right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.sa-header-badge {
    display: flex;
    align-items: center;
    gap: .375rem;
    background: var(--success-light);
    color: var(--success);
    padding: .3rem .75rem;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
}

.sa-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: .4;
    }
}

.sa-header-time {
    font-size: 13px;
    color: var(--gray-400);
    font-family: 'DM Mono', monospace;
}

.sa-content {
    flex: 1;
    padding: 1.5rem 2rem 2rem;
}

/* fade transitions */
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

.sa-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    z-index: 190;
    opacity: 0;
    animation: fadeOverlay .2s forwards;
}

@keyframes fadeOverlay {
    to { opacity: 1; }
}

@media (max-width: 1024px) {
    .sa-sidebar {
        transform: translateX(-100%);
        width: 260px !important;
    }

    .sa-sidebar--mobile-open {
        transform: translateX(0);
    }

    .sa-main {
        margin-left: 0 !important;
    }

    .sa-content {
        padding: 1.5rem 1.25rem;
    }

    .sa-header {
        padding: 1rem 1.25rem;
    }
    
    .sa-header-badge {
        display: none;
    }

    .sa-mobile-toggle {
        display: flex;
    }
    
    .sa-toggle-btn {
        display: none;
    }
}
</style>