<template>
    <div class="sessions-view">

        <!-- Sessions list on left, orders on right -->
        <div class="sessions-layout">

            <!-- Sessions column -->
            <div class="sessions-col">
                <div class="sessions-col__header">
                    <h6 class="sessions-col__title">Order Sessions</h6>
                    <button class="btn-sm-primary" @click="showOpenModal = true">+ Open</button>
                </div>

                <SkeletonLoader v-if="orderStore.sessionLoading" :count="4" :height="72" :gap="8" />

                <div v-else-if="orderStore.sessions.length" class="sessions-list">
                    <div v-for="session in orderStore.sessions" :key="session.id" class="session-card" :class="{
                        'session-card--active': selectedSessionId === session.id,
                        'session-card--open': session.status === 'open',
                    }" @click="selectSession(session)">
                        <div class="session-card__top">
                            <span class="session-card__title">{{ session.title }}</span>
                            <span class="session-status" :class="'session-status--' + session.status">{{ session.status
                                }}</span>
                        </div>
                        <div class="session-card__meta">
                            <span>{{ formatDate(session.session_date) }}</span>
                            <span>{{ session.orders_count ?? 0 }} orders</span>
                        </div>
                    </div>
                </div>

                <EmptyState v-else icon="📅" title="No sessions yet" description="Open a new session to start."
                    compact />
            </div>

            <!-- Orders column -->
            <div class="orders-col">
                <template v-if="selectedSession">
                    <!-- Session header -->
                    <div class="orders-col__header">
                        <div>
                            <h6 class="orders-col__title">{{ selectedSession.title }}</h6>
                            <p class="orders-col__sub">{{ formatDate(selectedSession.session_date) }}</p>
                        </div>
                        <div class="orders-col__actions">
                            <button v-if="selectedSession.status === 'open'" class="btn-sm-danger"
                                @click="handleCloseSession(selectedSession)">Close Session</button>
                            <button v-if="selectedSession.status === 'closed'" class="btn-sm-secondary"
                                @click="handleBulkPay(selectedSession)">Bulk Pay</button>
                            <button class="btn-sm-secondary" @click="loadSummary(selectedSession.id)">Summary</button>
                        </div>
                    </div>

                    <!-- Summary panel -->
                    <div v-if="summary" class="summary-panel">
                        <div class="summary-panel__stats">
                            <div class="summary-stat">
                                <span class="summary-stat__val">৳{{ summary.financials.session_total }}</span>
                                <span class="summary-stat__label">Total</span>
                            </div>
                            <div class="summary-stat summary-stat--success">
                                <span class="summary-stat__val">৳{{ summary.financials.collected }}</span>
                                <span class="summary-stat__label">Collected</span>
                            </div>
                            <div class="summary-stat summary-stat--danger">
                                <span class="summary-stat__val">৳{{ summary.financials.outstanding }}</span>
                                <span class="summary-stat__label">Outstanding</span>
                            </div>
                            <div class="summary-stat">
                                <span class="summary-stat__val">{{ summary.unpaid_count }}</span>
                                <span class="summary-stat__label">Unpaid</span>
                            </div>
                        </div>
                        <button class="summary-close" @click="summary = null">✕ Hide</button>
                    </div>

                    <!-- Orders table -->
                    <SkeletonLoader v-if="orderStore.loading" :count="5" :height="52" :gap="8" />
                    <div v-else-if="orderStore.sessionOrders.length" class="orders-table-wrap">
                        <table class="orders-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in orderStore.sessionOrders" :key="order.id">
                                    <td>
                                        <div class="emp-cell">
                                            <div class="emp-cell__avatar">{{ (order.user?.name || 'U')[0] }}</div>
                                            <span class="emp-cell__name">{{ order.user?.name || '—' }}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="items-count">{{ order.items?.length ?? 0 }} item(s)</span>
                                        <div class="items-detail">
                                            <span v-for="item in (order.items || []).slice(0, 2)" :key="item.id"
                                                class="items-chip">
                                                {{ item.menu_item?.name ?? '?' }} ×{{ item.quantity }}
                                            </span>
                                            <span v-if="(order.items?.length ?? 0) > 2"
                                                class="items-chip items-chip--more">
                                                +{{ order.items.length - 2 }} more
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="order-total">৳{{ order.total }}</span>
                                    </td>
                                    <td>
                                        <span class="order-badge" :class="'order-badge--' + order.status">{{
                                            order.status }}</span>
                                    </td>
                                    <td>
                                        <div class="order-actions">
                                            <select
                                                v-if="selectedSession.status === 'open' || selectedSession.status === 'closed'"
                                                class="status-select" :value="order.status"
                                                @change="handleStatusChange(order, $event.target.value)">
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <button v-if="!order.payment && selectedSession.status === 'closed'"
                                                class="pay-btn" @click="openPayModal(order)" title="Record payment">💳
                                                Pay</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <EmptyState v-else icon="📋" title="No orders in this session" compact />

                </template>

                <!-- Empty state when no session selected -->
                <div v-else class="orders-empty">
                    <EmptyState icon="👈" title="Select a session"
                        description="Click on a session to view its orders." />
                </div>
            </div>
        </div>

        <!-- Open Session Modal -->
        <div v-if="showOpenModal" class="modal-overlay" @click.self="showOpenModal = false">
            <div class="modal-box">
                <div class="modal-box__header">
                    <h5 class="modal-box__title">Open Order Session</h5>
                    <button class="modal-box__close" @click="showOpenModal = false">✕</button>
                </div>
                <div class="modal-box__body">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input v-model="openForm.title" type="text" class="form-input"
                            placeholder="e.g. Tuesday Breakfast" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input v-model="openForm.session_date" type="date" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Closes At (optional)</label>
                        <input v-model="openForm.closes_at" type="datetime-local" class="form-input" />
                    </div>
                </div>
                <div class="modal-box__footer">
                    <button class="btn-cancel" @click="showOpenModal = false">Cancel</button>
                    <button class="btn-submit" :disabled="saving" @click="handleOpenSession">
                        <span v-if="saving" class="btn-spinner" />
                        {{ saving ? 'Opening…' : 'Open Session' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Pay Modal -->
        <div v-if="showPayModal" class="modal-overlay" @click.self="showPayModal = false">
            <div class="modal-box">
                <div class="modal-box__header">
                    <h5 class="modal-box__title">Record Payment</h5>
                    <button class="modal-box__close" @click="showPayModal = false">✕</button>
                </div>
                <div class="modal-box__body">
                    <p class="pay-info">Order by <strong>{{ payOrder?.user?.name }}</strong> — Total: <strong>৳{{
                            payOrder?.total }}</strong></p>
                    <div class="form-group">
                        <label class="form-label">Method *</label>
                        <select v-model="payForm.method" class="form-input">
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="mobile">Mobile</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount</label>
                        <input v-model="payForm.amount" type="number" class="form-input"
                            :placeholder="payOrder?.total" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Reference (optional)</label>
                        <input v-model="payForm.reference" type="text" class="form-input" placeholder="e.g. RCPT-001" />
                    </div>
                </div>
                <div class="modal-box__footer">
                    <button class="btn-cancel" @click="showPayModal = false">Cancel</button>
                    <button class="btn-submit" :disabled="saving" @click="handleRecordPayment">
                        <span v-if="saving" class="btn-spinner" />
                        {{ saving ? 'Recording…' : 'Record Payment' }}
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

const selectedSessionId = ref(null)
const selectedSession = ref(null)
const summary = ref(null)
const showOpenModal = ref(false)
const showPayModal = ref(false)
const saving = ref(false)
const payOrder = ref(null)

const openForm = reactive({
    title: `Breakfast — ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    session_date: new Date().toISOString().split('T')[0],
    closes_at: '',
})

const payForm = reactive({ method: 'cash', amount: '', reference: '' })

function formatDate(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

async function selectSession(session) {
    selectedSessionId.value = session.id
    selectedSession.value = session
    summary.value = null
    await orderStore.fetchSessionOrders(session.id)
}

async function handleOpenSession() {
    if (!openForm.title.trim()) { toast.error('Session title is required.'); return }
    saving.value = true
    try {
        await orderStore.openOrderSession({
            title: openForm.title,
            session_date: openForm.session_date,
            closes_at: openForm.closes_at || undefined,
        })
        showOpenModal.value = false
        toast.success('Session opened!')
        await orderStore.fetchSessions()
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to open session.')
    } finally {
        saving.value = false
    }
}

async function handleCloseSession(session) {
    const confirmed = await confirmAction({
        title: 'Close this session?',
        text: 'Employees won\'t be able to place new orders.',
        confirmText: 'Close session',
    })
    if (!confirmed) return
    try {
        await orderStore.closeOrderSession(session.id)
        selectedSession.value = { ...selectedSession.value, status: 'closed' }
        toast.success('Session closed.')
        await orderStore.fetchSessions()
    } catch (_) { }
}

async function handleBulkPay(session) {
    const confirmed = await confirmAction({
        title: 'Bulk pay all unpaid orders?',
        text: 'All unpaid orders will be marked as paid via Cash.',
        confirmText: 'Yes, bulk pay',
    })
    if (!confirmed) return
    try {
        const result = await companyStore.bulkPay(session.id, 'cash')
        toast.success(`${result.paid_count} orders paid. Total: ৳${result.total_paid}`)
        await orderStore.fetchSessionOrders(session.id)
    } catch (_) { }
}

async function loadSummary(sessionId) {
    try {
        summary.value = await companyStore.fetchSessionSummary(sessionId)
    } catch (_) { toast.error('Failed to load summary.') }
}

async function handleStatusChange(order, newStatus) {
    try {
        await orderStore.updateOrderStatus(order.id, newStatus)
        toast.success(`Order status changed to ${newStatus}.`)
    } catch (_) { }
}

function openPayModal(order) {
    payOrder.value = order
    payForm.method = 'cash'
    payForm.amount = order.total
    payForm.reference = ''
    showPayModal.value = true
}

async function handleRecordPayment() {
    saving.value = true
    try {
        await companyStore.recordPayment({
            order_id: payOrder.value.id,
            method: payForm.method,
            amount: payForm.amount || payOrder.value.total,
            reference: payForm.reference || undefined,
        })
        toast.success('Payment recorded!')
        showPayModal.value = false
        await orderStore.fetchSessionOrders(selectedSessionId.value)
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to record payment.')
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    await orderStore.fetchSessions()
    // Auto select the first open session
    const open = orderStore.sessions.find(s => s.status === 'open')
    if (open) selectSession(open)
})
</script>

<style scoped>
.sessions-view {
    height: 100%;
}

.sessions-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1.25rem;
    align-items: start;
}

@media (max-width: 768px) {
    .sessions-layout {
        grid-template-columns: 1fr;
    }
}

/* Sessions column */
.sessions-col {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.sessions-col__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--gray-100);
}

.sessions-col__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.btn-sm-primary {
    padding: .375rem .875rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
}

.btn-sm-primary:hover {
    background: var(--primary-dark);
}

.sessions-list {
    padding: .625rem;
    display: flex;
    flex-direction: column;
    gap: .375rem;
}

.session-card {
    padding: .75rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
    cursor: pointer;
    transition: all .15s;
}

.session-card:hover {
    border-color: var(--primary);
    background: var(--primary-light);
}

.session-card--active {
    border-color: var(--primary);
    background: var(--primary-light);
}

.session-card--open {
    border-color: var(--success);
}

.session-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    margin-bottom: .25rem;
}

.session-card__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.session-status {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 99px;
    flex-shrink: 0;
    text-transform: capitalize;
}

.session-status--open {
    background: var(--success-light);
    color: var(--success);
}

.session-status--closed {
    background: var(--gray-100);
    color: var(--gray-500);
}

.session-status--cancelled {
    background: var(--danger-light);
    color: var(--danger);
}

.session-card__meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--gray-400);
}

/* Orders column */
.orders-col {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
    min-height: 400px;
}

.orders-col__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--gray-100);
    flex-wrap: wrap;
}

.orders-col__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.orders-col__sub {
    font-size: 12px;
    color: var(--gray-400);
    margin: 0;
}

.orders-col__actions {
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
}

.btn-sm-secondary {
    padding: .375rem .875rem;
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-700);
    cursor: pointer;
    font-family: inherit;
    transition: all .15s;
}

.btn-sm-secondary:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.btn-sm-danger {
    padding: .375rem .875rem;
    background: var(--danger-light);
    color: var(--danger);
    border: 1px solid var(--danger);
    border-radius: var(--radius-md);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all .15s;
}

.btn-sm-danger:hover {
    background: var(--danger);
    color: #fff;
}

/* Summary */
.summary-panel {
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: .75rem;
}

.summary-panel__stats {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.summary-stat {
    display: flex;
    flex-direction: column;
}

.summary-stat__val {
    font-size: 16px;
    font-weight: 800;
    color: var(--gray-900);
}

.summary-stat__label {
    font-size: 11px;
    color: var(--gray-400);
}

.summary-stat--success .summary-stat__val {
    color: var(--success);
}

.summary-stat--danger .summary-stat__val {
    color: var(--danger);
}

.summary-close {
    background: none;
    border: none;
    font-size: 12px;
    color: var(--gray-400);
    cursor: pointer;
    font-family: inherit;
}

/* Table */
.orders-table-wrap {
    overflow-x: auto;
}

.orders-table {
    width: 100%;
    border-collapse: collapse;
}

.orders-table th {
    background: var(--gray-50);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--gray-500);
    padding: .625rem 1rem;
    text-align: left;
    white-space: nowrap;
}

.orders-table td {
    padding: .75rem 1rem;
    border-top: 1px solid var(--gray-100);
}

.orders-table tbody tr:hover {
    background: var(--gray-50);
}

.emp-cell {
    display: flex;
    align-items: center;
    gap: .5rem;
}

.emp-cell__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.emp-cell__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-900);
    white-space: nowrap;
}

.items-count {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-700);
    display: block;
}

.items-detail {
    display: flex;
    flex-wrap: wrap;
    gap: .25rem;
    margin-top: 2px;
}

.items-chip {
    font-size: 10px;
    background: var(--gray-100);
    color: var(--gray-600);
    padding: 1px 6px;
    border-radius: 4px;
}

.items-chip--more {
    background: var(--primary-light);
    color: var(--primary);
}

.order-total {
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-900);
}

.order-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    text-transform: capitalize;
}

.order-badge--pending {
    background: var(--warning-light);
    color: var(--warning);
}

.order-badge--confirmed {
    background: var(--success-light);
    color: var(--success);
}

.order-badge--delivered {
    background: var(--info-light);
    color: var(--info);
}

.order-badge--cancelled {
    background: var(--gray-100);
    color: var(--gray-400);
}

.order-actions {
    display: flex;
    align-items: center;
    gap: .5rem;
}

.status-select {
    padding: .3rem .5rem;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--gray-700);
    background: #fff;
    outline: none;
    cursor: pointer;
    font-family: inherit;
}

.pay-btn {
    padding: .3rem .625rem;
    background: var(--success-light);
    color: var(--success);
    border: 1px solid var(--success);
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
}

.pay-btn:hover {
    background: var(--success);
    color: #fff;
}

.orders-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
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
    max-width: 440px;
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
    margin: 0;
    color: var(--gray-900);
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

.pay-info {
    font-size: 14px;
    color: var(--gray-700);
    background: var(--gray-50);
    padding: .75rem 1rem;
    border-radius: var(--radius-md);
    margin: 0;
    border: 1px solid var(--gray-200);
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