<template>
    <div class="admin-dashboard">

        <!-- Quick stats -->
        <div class="stats-grid">
            <SkeletonLoader v-if="loading" :count="1" :height="80" v-for="i in 4" :key="'sk' + i" />
            <template v-else>
                <div class="stat-card" v-for="stat in stats" :key="stat.label">
                    <div class="stat-card__icon" :style="{ background: stat.bg, color: stat.color }">
                        <span v-html="stat.icon" />
                    </div>
                    <div class="stat-card__body">
                        <p class="stat-card__value">{{ stat.value }}</p>
                        <p class="stat-card__label">{{ stat.label }}</p>
                    </div>
                </div>
            </template>
        </div>

        <!-- Active session banner -->
        <div v-if="orderStore.activeSession" class="session-banner session-banner--open">
            <div class="session-banner__left">
                <div class="session-pulse" />
                <div>
                    <p class="session-banner__title">{{ orderStore.activeSession.title }}</p>
                    <p class="session-banner__sub">
                        Session open · {{ orderStore.activeSession.orders?.length ?? 0 }} orders placed
                    </p>
                </div>
            </div>
            <button class="session-banner__btn session-banner__btn--close" @click="handleCloseSession">
                Close Session
            </button>
        </div>

        <div v-else class="session-banner session-banner--closed">
            <div class="session-banner__left">
                <span style="font-size:1.25rem">📅</span>
                <div>
                    <p class="session-banner__title">No active session</p>
                    <p class="session-banner__sub">Open a session to start accepting breakfast orders.</p>
                </div>
            </div>
            <button class="session-banner__btn session-banner__btn--open" @click="showOpenSessionModal = true">
                Open Session
            </button>
        </div>

        <!-- Two columns -->
        <div class="admin-dashboard__cols">

            <!-- Recent orders -->
            <div class="admin-panel">
                <div class="admin-panel__header">
                    <h6 class="admin-panel__title">Today's Orders</h6>
                    <router-link to="/admin/sessions" class="admin-panel__link">View all →</router-link>
                </div>
                <div class="admin-panel__body">
                    <SkeletonLoader v-if="ordersLoading" :count="4" :height="48" :gap="8" />
                    <template v-else-if="recentOrders.length">
                        <div v-for="order in recentOrders" :key="order.id" class="order-row">
                            <div class="order-row__avatar">{{ (order.user?.name || 'U')[0] }}</div>
                            <div class="order-row__info">
                                <p class="order-row__name">{{ order.user?.name || 'Unknown' }}</p>
                                <p class="order-row__items">{{ order.items?.length ?? 0 }} item(s)</p>
                            </div>
                            <div class="order-row__right">
                                <p class="order-row__total">৳{{ order.total }}</p>
                                <span class="order-status-badge" :class="'order-status-badge--' + order.status">
                                    {{ order.status }}
                                </span>
                            </div>
                        </div>
                    </template>
                    <EmptyState v-else icon="📋" title="No orders yet"
                        description="Orders will appear once a session is open." compact />
                </div>
            </div>

            <!-- Employee list -->
            <div class="admin-panel">
                <div class="admin-panel__header">
                    <h6 class="admin-panel__title">Team Overview</h6>
                    <router-link to="/admin/users" class="admin-panel__link">Manage →</router-link>
                </div>
                <div class="admin-panel__body">
                    <SkeletonLoader v-if="usersLoading" :count="4" :height="48" :gap="8" />
                    <template v-else-if="companyStore.users.length">
                        <div v-for="user in companyStore.users.slice(0, 6)" :key="user.id" class="user-row">
                            <div class="user-row__avatar"
                                :class="user.is_active ? 'user-row__avatar--active' : 'user-row__avatar--inactive'">
                                {{ (user.name || 'U')[0].toUpperCase() }}
                            </div>
                            <div class="user-row__info">
                                <p class="user-row__name">{{ user.name }}</p>
                                <p class="user-row__email">{{ user.email }}</p>
                            </div>
                            <span class="user-status"
                                :class="user.is_active ? 'user-status--active' : 'user-status--inactive'">
                                {{ user.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                    </template>
                    <EmptyState v-else icon="👥" title="No employees yet" compact />
                </div>
            </div>

        </div>

        <!-- Open Session Modal -->
        <div v-if="showOpenSessionModal" class="modal-overlay" @click.self="showOpenSessionModal = false">
            <div class="modal-box">
                <div class="modal-box__header">
                    <h5 class="modal-box__title">Open Order Session</h5>
                    <button class="modal-box__close" @click="showOpenSessionModal = false">✕</button>
                </div>
                <div class="modal-box__body">
                    <div class="form-group">
                        <label class="form-label">Session Title</label>
                        <input v-model="sessionForm.title" type="text" class="form-input"
                            placeholder="e.g. Monday Breakfast" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Session Date</label>
                        <input v-model="sessionForm.session_date" type="date" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Closes At (optional)</label>
                        <input v-model="sessionForm.closes_at" type="datetime-local" class="form-input" />
                    </div>
                </div>
                <div class="modal-box__footer">
                    <button class="btn-cancel" @click="showOpenSessionModal = false">Cancel</button>
                    <button class="btn-submit" :disabled="openingSession" @click="handleOpenSession">
                        <span v-if="openingSession" class="btn-spinner" />
                        {{ openingSession ? 'Opening…' : 'Open Session' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useCompanyStore } from '@/stores/company'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const orderStore = useOrderStore()
const companyStore = useCompanyStore()
const toast = useToast()
const { confirmAction } = useConfirm()

const loading = ref(false)
const ordersLoading = ref(false)
const usersLoading = ref(false)
const showOpenSessionModal = ref(false)
const openingSession = ref(false)
const recentOrders = ref([])

const sessionForm = reactive({
    title: `Breakfast — ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    session_date: new Date().toISOString().split('T')[0],
    closes_at: '',
})

const stats = computed(() => [
    {
        label: 'Total Employees',
        value: companyStore.usersMeta?.total ?? companyStore.users.length,
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
        bg: '#EEF2FF', color: '#4F46E5',
    },
    {
        label: "Today's Orders",
        value: recentOrders.value.length,
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
        bg: '#FEF3C7', color: '#D97706',
    },
    {
        label: "Today's Revenue",
        value: '৳' + recentOrders.value.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(2),
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
        bg: '#D1FAE5', color: '#059669',
    },
    {
        label: 'Menu Items',
        value: orderStore.menuItems.length,
        icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
        bg: '#CFFAFE', color: '#0891B2',
    },
])

async function handleOpenSession() {
    openingSession.value = true
    try {
        const payload = { title: sessionForm.title, session_date: sessionForm.session_date }
        if (sessionForm.closes_at) payload.closes_at = sessionForm.closes_at
        await orderStore.openOrderSession(payload)
        await orderStore.fetchActiveSession()
        showOpenSessionModal.value = false
        toast.success('Order session opened! Employees can now place orders.')
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to open session.')
    } finally {
        openingSession.value = false
    }
}

async function handleCloseSession() {
    if (!orderStore.activeSession) return
    const confirmed = await confirmAction({
        title: 'Close this session?',
        text: 'No more orders can be placed once the session is closed.',
        confirmText: 'Yes, close it',
        icon: 'warning',
    })
    if (!confirmed) return
    try {
        await orderStore.closeOrderSession(orderStore.activeSession.id)
        await orderStore.fetchActiveSession()
        toast.success('Session closed.')
    } catch (_) { }
}

async function loadDashboardData() {
    loading.value = true
    ordersLoading.value = true
    usersLoading.value = true
    try {
        await Promise.all([
            orderStore.fetchActiveSession(),
            orderStore.fetchMenu(),
            companyStore.fetchUsers(),
        ])
        // Load today's session orders if session exists
        if (orderStore.activeSession) {
            await orderStore.fetchSessionOrders(orderStore.activeSession.id)
            recentOrders.value = orderStore.sessionOrders
        }
    } finally {
        loading.value = false
        ordersLoading.value = false
        usersLoading.value = false
    }
}

onMounted(() => loadDashboardData())
</script>

<style scoped>
.admin-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

/* Stats */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

@media (max-width: 900px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.stat-card {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 1.125rem;
    display: flex;
    align-items: center;
    gap: .875rem;
}

.stat-card__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-card__value {
    font-size: 20px;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0;
    letter-spacing: -.03em;
}

.stat-card__label {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0;
}

/* Session banner */
.session-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 1rem 1.25rem;
    flex-wrap: wrap;
}

.session-banner--open {
    border-color: var(--success);
    background: var(--success-light);
}

.session-banner--closed {
    border-color: var(--gray-200);
}

.session-banner__left {
    display: flex;
    align-items: center;
    gap: .875rem;
}

.session-banner__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.session-banner__sub {
    font-size: 12px;
    color: var(--gray-500);
    margin: 0;
}

.session-pulse {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--success);
    animation: pulse 1.5s infinite;
    flex-shrink: 0;
}

@keyframes pulse {

    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, .4);
    }

    50% {
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }
}

.session-banner__btn {
    padding: .5rem 1.125rem;
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all .15s;
}

.session-banner__btn--open {
    background: var(--primary);
    color: #fff;
}

.session-banner__btn--open:hover {
    background: var(--primary-dark);
}

.session-banner__btn--close {
    background: var(--danger);
    color: #fff;
}

.session-banner__btn--close:hover {
    background: #DC2626;
}

/* Cols */
.admin-dashboard__cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
}

@media (max-width: 800px) {
    .admin-dashboard__cols {
        grid-template-columns: 1fr;
    }
}

/* Panel */
.admin-panel {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.admin-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--gray-100);
}

.admin-panel__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.admin-panel__link {
    font-size: 13px;
    color: var(--primary);
    font-weight: 500;
    text-decoration: none;
}

.admin-panel__body {
    padding: .875rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

/* Order rows */
.order-row {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .5rem 0;
    border-bottom: 1px solid var(--gray-50);
}

.order-row:last-child {
    border-bottom: none;
}

.order-row__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.order-row__info {
    flex: 1;
    min-width: 0;
}

.order-row__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-900);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.order-row__items {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0;
}

.order-row__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
}

.order-row__total {
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.order-status-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 99px;
    text-transform: capitalize;
}

.order-status-badge--pending {
    background: var(--warning-light);
    color: var(--warning);
}

.order-status-badge--confirmed {
    background: var(--success-light);
    color: var(--success);
}

.order-status-badge--delivered {
    background: var(--info-light);
    color: var(--info);
}

.order-status-badge--cancelled {
    background: var(--gray-100);
    color: var(--gray-400);
}

/* User rows */
.user-row {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .5rem 0;
    border-bottom: 1px solid var(--gray-50);
}

.user-row:last-child {
    border-bottom: none;
}

.user-row__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.user-row__avatar--active {
    background: var(--success-light);
    color: var(--success);
}

.user-row__avatar--inactive {
    background: var(--gray-100);
    color: var(--gray-400);
}

.user-row__info {
    flex: 1;
    min-width: 0;
}

.user-row__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-900);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-row__email {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-status {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    flex-shrink: 0;
}

.user-status--active {
    background: var(--success-light);
    color: var(--success);
}

.user-status--inactive {
    background: var(--gray-100);
    color: var(--gray-500);
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .45);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-box {
    background: #fff;
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 480px;
    box-shadow: var(--shadow-xl);
    overflow: hidden;
}

.modal-box__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--gray-100);
}

.modal-box__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.modal-box__close {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--gray-400);
    cursor: pointer;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background .15s;
}

.modal-box__close:hover {
    background: var(--gray-100);
}

.modal-box__body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal-box__footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--gray-100);
    display: flex;
    justify-content: flex-end;
    gap: .625rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: .3rem;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
}

.form-input {
    padding: .625rem .875rem;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--gray-900);
    outline: none;
    transition: border-color .15s;
    font-family: inherit;
    background: #fff;
}

.form-input:focus {
    border-color: var(--primary);
}

.btn-cancel {
    padding: .625rem 1.25rem;
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-600);
    cursor: pointer;
    font-family: inherit;
    transition: all .15s;
}

.btn-cancel:hover {
    background: var(--gray-50);
}

.btn-submit {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .625rem 1.5rem;
    background: var(--primary);
    border: none;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    font-family: inherit;
    transition: background .15s;
}

.btn-submit:hover:not(:disabled) {
    background: var(--primary-dark);
}

.btn-submit:disabled {
    opacity: .65;
    cursor: not-allowed;
}

.btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, .3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>