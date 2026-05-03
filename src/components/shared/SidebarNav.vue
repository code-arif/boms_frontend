<template>
    <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
        <!-- Logo -->
        <div class="sidebar__logo">
            <span class="sidebar__logo-icon">🍳</span>
            <transition name="fade-text">
                <span v-if="!collapsed" class="sidebar__logo-text">BOMS</span>
            </transition>
        </div>

        <!-- Navigation -->
        <nav class="sidebar__nav">
            <div v-for="group in navGroups" :key="group.label" class="sidebar__group">
                <transition name="fade-text">
                    <p v-if="!collapsed && group.label" class="sidebar__group-label">{{ group.label }}</p>
                </transition>
                <router-link v-for="item in group.items" :key="item.to" :to="item.to" class="sidebar__link"
                    active-class="sidebar__link--active" :title="collapsed ? item.label : ''">
                    <span class="sidebar__link-icon" v-html="item.icon" />
                    <transition name="fade-text">
                        <span v-if="!collapsed" class="sidebar__link-label">{{ item.label }}</span>
                    </transition>
                    <transition name="fade-text">
                        <span v-if="!collapsed && item.badge" class="sidebar__badge">{{ item.badge }}</span>
                    </transition>
                </router-link>
            </div>
        </nav>

        <!-- Bottom: user + logout -->
        <div class="sidebar__footer">
            <div class="sidebar__user" :class="{ 'sidebar__user--collapsed': collapsed }">
                <div class="sidebar__avatar">{{ auth.userInitials }}</div>
                <transition name="fade-text">
                    <div v-if="!collapsed" class="sidebar__user-info">
                        <p class="sidebar__user-name">{{ auth.userName }}</p>
                        <p class="sidebar__user-role">{{ roleLabel }}</p>
                    </div>
                </transition>
            </div>
            <button class="sidebar__logout" :title="collapsed ? 'Logout' : ''" @click="handleLogout">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <transition name="fade-text">
                    <span v-if="!collapsed">Logout</span>
                </transition>
            </button>
        </div>

        <!-- Collapse toggle -->
        <button class="sidebar__toggle" @click="collapsed = !collapsed">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                :style="{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }">
                <polyline points="15 18 9 12 15 6" />
            </svg>
        </button>
    </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const props = defineProps({
    navGroups: { type: Array, default: () => [] },
})

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const collapsed = ref(false)

const roleLabel = computed(() => ({
    super_admin: 'Super Admin',
    company_admin: 'Company Admin',
    employee: 'Employee',
}[auth.user?.role] || ''))

async function handleLogout() {
    await auth.logout()
    toast.success('Logged out successfully.')
    router.push('/login')
}
</script>

<style scoped>
.sidebar {
    width: var(--sidebar-width);
    min-height: 100vh;
    background: var(--gray-900);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    transition: width .25s cubic-bezier(.4, 0, .2, 1);
    overflow: hidden;
}

.sidebar--collapsed {
    width: 68px;
}

.sidebar__logo {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
    min-height: 64px;
    overflow: hidden;
    white-space: nowrap;
}

.sidebar__logo-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.sidebar__logo-text {
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -.02em;
}

.sidebar__nav {
    flex: 1;
    padding: .75rem .625rem;
    overflow-y: auto;
    overflow-x: hidden;
}

.sidebar__group {
    margin-bottom: .5rem;
}

.sidebar__group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: rgba(255, 255, 255, .3);
    padding: .5rem .5rem .25rem;
    margin: 0;
    white-space: nowrap;
}

.sidebar__link {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .625rem .75rem;
    border-radius: var(--radius-md);
    color: rgba(255, 255, 255, .6);
    font-size: 14px;
    font-weight: 500;
    transition: background .15s, color .15s;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
    margin-bottom: 2px;
    text-decoration: none;
}

.sidebar__link:hover {
    background: rgba(255, 255, 255, .06);
    color: #fff;
}

.sidebar__link--active {
    background: var(--primary);
    color: #fff;
}

.sidebar__link-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.sidebar__link-label {
    flex: 1;
}

.sidebar__badge {
    background: var(--danger);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 99px;
    flex-shrink: 0;
}

.sidebar__footer {
    border-top: 1px solid rgba(255, 255, 255, .06);
    padding: .75rem .625rem;
    display: flex;
    flex-direction: column;
    gap: .375rem;
    overflow: hidden;
}

.sidebar__user {
    display: flex;
    align-items: center;
    gap: .625rem;
    padding: .5rem .5rem;
    border-radius: var(--radius-md);
    overflow: hidden;
    white-space: nowrap;
}

.sidebar__user--collapsed {
    justify-content: center;
}

.sidebar__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
}

.sidebar__user-info {
    min-width: 0;
}

.sidebar__user-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar__user-role {
    font-size: 11px;
    color: rgba(255, 255, 255, .4);
    margin: 0;
}

.sidebar__logout {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .625rem .75rem;
    border: none;
    background: none;
    color: rgba(255, 255, 255, .4);
    font-size: 13px;
    font-weight: 500;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background .15s, color .15s;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
}

.sidebar__logout:hover {
    background: rgba(239, 68, 68, .15);
    color: #ef4444;
}

.sidebar__toggle {
    position: absolute;
    top: 50%;
    right: -12px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: var(--gray-700);
    border: 1px solid var(--gray-600);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, .7);
    z-index: 10;
    transition: background .15s;
}

.sidebar__toggle:hover {
    background: var(--gray-600);
    color: #fff;
}

/* text fade transition */
.fade-text-enter-active,
.fade-text-leave-active {
    transition: opacity .15s, width .25s;
    overflow: hidden;
}

.fade-text-enter-from,
.fade-text-leave-to {
    opacity: 0;
}
</style>