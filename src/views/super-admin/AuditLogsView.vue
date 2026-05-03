<template>
    <div class="audit-view">

        <!-- Filters -->
        <div class="audit-filters">
            <div class="filter-row">
                <div class="filter-group">
                    <label class="filter-label">Action</label>
                    <input v-model="filters.action" type="text" class="filter-input" placeholder="e.g. payment, login…"
                        @input="debouncedFetch" />
                </div>
                <div class="filter-group">
                    <label class="filter-label">Company ID</label>
                    <input v-model="filters.company_id" type="number" class="filter-input" placeholder="Company ID"
                        @input="debouncedFetch" />
                </div>
                <div class="filter-group">
                    <label class="filter-label">From</label>
                    <input v-model="filters.from" type="date" class="filter-input" @change="fetchLogs(1)" />
                </div>
                <div class="filter-group">
                    <label class="filter-label">To</label>
                    <input v-model="filters.to" type="date" class="filter-input" @change="fetchLogs(1)" />
                </div>
                <div class="filter-group filter-group--btn">
                    <button class="filter-reset" @click="resetFilters">Reset</button>
                </div>
            </div>
        </div>

        <!-- Stats strip -->
        <div class="audit-stats">
            <div class="audit-stat">
                <span class="audit-stat__val">{{ companyStore.auditMeta?.total ?? '—' }}</span>
                <span class="audit-stat__label">Total logs</span>
            </div>
            <div class="audit-stat">
                <span class="audit-stat__val">{{ companyStore.auditLogs.length }}</span>
                <span class="audit-stat__label">Showing</span>
            </div>
            <div class="audit-stat">
                <span class="audit-stat__val">{{ companyStore.auditMeta?.last_page ?? '—' }}</span>
                <span class="audit-stat__label">Pages</span>
            </div>
        </div>

        <!-- Log list -->
        <div class="audit-list">
            <SkeletonLoader v-if="companyStore.loading" :count="8" :height="64" :gap="8" />

            <template v-else-if="companyStore.auditLogs.length">
                <div v-for="log in companyStore.auditLogs" :key="log.id" class="audit-item"
                    :class="'audit-item--' + severityClass(log.action)">
                    <div class="audit-item__left">
                        <div class="audit-item__icon" :class="'audit-item__icon--' + severityClass(log.action)">
                            <span>{{ actionIcon(log.action) }}</span>
                        </div>
                        <div class="audit-item__line" />
                    </div>
                    <div class="audit-item__body">
                        <div class="audit-item__header">
                            <span class="audit-item__action">{{ formatAction(log.action) }}</span>
                            <span class="audit-item__time">{{ formatDateTime(log.created_at) }}</span>
                        </div>
                        <div class="audit-item__meta">
                            <span v-if="log.user" class="audit-meta-chip audit-meta-chip--user">
                                👤 {{ log.user.name }}
                            </span>
                            <span v-if="log.company" class="audit-meta-chip audit-meta-chip--company">
                                🏢 {{ log.company.name }}
                            </span>
                            <span v-if="log.ip_address" class="audit-meta-chip">
                                🌐 {{ log.ip_address }}
                            </span>
                        </div>
                        <div v-if="log.new_values && Object.keys(log.new_values).length" class="audit-item__values">
                            <span v-for="(val, key) in log.new_values" :key="key" class="audit-value-tag">
                                {{ key }}: <strong>{{ String(val) }}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </template>

            <EmptyState v-else icon="📋" title="No audit logs found" description="Try adjusting your filters." />
        </div>

        <!-- Pagination -->
        <div v-if="companyStore.auditMeta?.last_page > 1" class="pagination">
            <button class="pagination__btn" :disabled="currentPage === 1" @click="fetchLogs(currentPage - 1)">←
                Prev</button>
            <div class="pagination__pages">
                <button v-for="p in visiblePages" :key="p" class="pagination__page"
                    :class="{ 'pagination__page--active': p === currentPage }" @click="fetchLogs(p)">{{ p }}</button>
            </div>
            <button class="pagination__btn" :disabled="currentPage === companyStore.auditMeta.last_page"
                @click="fetchLogs(currentPage + 1)">Next →</button>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const companyStore = useCompanyStore()
const currentPage = ref(1)
let debounceTimer = null

const filters = reactive({ action: '', company_id: '', from: '', to: '' })

const visiblePages = computed(() => {
    const last = companyStore.auditMeta?.last_page || 1
    const current = currentPage.value
    const pages = []
    for (let p = Math.max(1, current - 2); p <= Math.min(last, current + 2); p++) {
        pages.push(p)
    }
    return pages
})

function debouncedFetch() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => fetchLogs(1), 400)
}

async function fetchLogs(page = 1) {
    currentPage.value = page
    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    )
    await companyStore.fetchAuditLogs(activeFilters, page)
}

function resetFilters() {
    Object.assign(filters, { action: '', company_id: '', from: '', to: '' })
    fetchLogs(1)
}

function formatAction(action) {
    return action
        .replace(/\./g, ' › ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
}

function formatDateTime(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

function severityClass(action) {
    if (action.includes('delete') || action.includes('cancel') || action.includes('refund')) return 'danger'
    if (action.includes('payment') || action.includes('order')) return 'success'
    if (action.includes('impersonat') || action.includes('flag')) return 'warning'
    if (action.includes('login') || action.includes('logout')) return 'info'
    return 'neutral'
}

function actionIcon(action) {
    if (action.includes('payment')) return '💳'
    if (action.includes('order')) return '📋'
    if (action.includes('login')) return '🔐'
    if (action.includes('logout')) return '🚪'
    if (action.includes('impersonat')) return '🎭'
    if (action.includes('flag')) return '🚩'
    if (action.includes('delete')) return '🗑️'
    if (action.includes('subscription')) return '📦'
    return '📝'
}

onMounted(() => fetchLogs(1))
</script>

<style scoped>
.audit-view {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

/* Filters */
.audit-filters {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 1rem 1.25rem;
}

.filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: .75rem;
    align-items: flex-end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: .3rem;
    flex: 1;
    min-width: 150px;
}

.filter-group--btn {
    flex: 0 0 auto;
    align-self: flex-end;
}

.filter-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--gray-500);
}

.filter-input {
    padding: .5rem .75rem;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--gray-800);
    outline: none;
    transition: border-color .15s;
    font-family: inherit;
    background: #fff;
}

.filter-input:focus {
    border-color: var(--primary);
}

.filter-reset {
    padding: .5rem 1rem;
    background: var(--gray-100);
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-600);
    cursor: pointer;
    font-family: inherit;
    transition: background .15s;
    white-space: nowrap;
}

.filter-reset:hover {
    background: var(--gray-200);
}

/* Stats strip */
.audit-stats {
    display: flex;
    gap: 1rem;
}

.audit-stat {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: .75rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.audit-stat__val {
    font-size: 22px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -.03em;
}

.audit-stat__label {
    font-size: 11px;
    color: var(--gray-400);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: .06em;
}

/* Log list */
.audit-list {
    display: flex;
    flex-direction: column;
}

.audit-item {
    display: flex;
    gap: 0;
}

.audit-item__left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 44px;
    flex-shrink: 0;
}

.audit-item__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    border: 2px solid;
}

.audit-item__icon--success {
    background: var(--success-light);
    border-color: var(--success);
}

.audit-item__icon--danger {
    background: var(--danger-light);
    border-color: var(--danger);
}

.audit-item__icon--warning {
    background: var(--warning-light);
    border-color: var(--warning);
}

.audit-item__icon--info {
    background: var(--info-light);
    border-color: var(--info);
}

.audit-item__icon--neutral {
    background: var(--gray-100);
    border-color: var(--gray-300);
}

.audit-item__line {
    width: 2px;
    flex: 1;
    background: var(--gray-100);
    min-height: 12px;
}

.audit-item:last-child .audit-item__line {
    display: none;
}

.audit-item__body {
    flex: 1;
    min-width: 0;
    padding: .125rem .875rem .875rem 0;
}

.audit-item__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: .5rem;
    margin-bottom: .375rem;
}

.audit-item__action {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--gray-900);
}

.audit-item__time {
    font-size: 11px;
    color: var(--gray-400);
    white-space: nowrap;
    font-family: 'DM Mono', monospace;
}

.audit-item__meta {
    display: flex;
    flex-wrap: wrap;
    gap: .375rem;
    margin-bottom: .375rem;
}

.audit-meta-chip {
    font-size: 11px;
    background: var(--gray-100);
    color: var(--gray-600);
    padding: 2px 7px;
    border-radius: 99px;
    font-weight: 500;
}

.audit-meta-chip--user {
    background: var(--primary-light);
    color: var(--primary);
}

.audit-meta-chip--company {
    background: var(--success-light);
    color: var(--success);
}

.audit-item__values {
    display: flex;
    flex-wrap: wrap;
    gap: .375rem;
}

.audit-value-tag {
    font-size: 11px;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    color: var(--gray-700);
    padding: 2px 7px;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    flex-wrap: wrap;
}

.pagination__btn {
    padding: .5rem .875rem;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    background: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    color: var(--gray-700);
    transition: all .15s;
    font-family: inherit;
}

.pagination__btn:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
}

.pagination__btn:disabled {
    opacity: .4;
    cursor: not-allowed;
}

.pagination__pages {
    display: flex;
    gap: .25rem;
}

.pagination__page {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm);
    background: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    color: var(--gray-700);
    transition: all .15s;
    font-family: inherit;
}

.pagination__page:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.pagination__page--active {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
}
</style>