<template>
    <div class="sa-dashboard">
        <!-- KPI Cards -->
        <div class="kpi-grid">
            <SkeletonLoader v-if="companyStore.loading && !companyStore.overview" :count="1" :height="88" v-for="i in 4"
                :key="i" />
            <template v-else-if="companyStore.overview">
                <div class="kpi-card" v-for="kpi in kpiCards" :key="kpi.label">
                    <div class="kpi-card__icon" :style="{ background: kpi.bg, color: kpi.color }">
                        <component :is="kpi.icon" :size="20" :stroke-width="1.8" />
                    </div>
                    <div class="kpi-card__body">
                        <p class="kpi-card__value">{{ kpi.value }}</p>
                        <p class="kpi-card__label">{{ kpi.label }}</p>
                    </div>
                    <div class="kpi-card__trend"
                        :class="kpi.trendUp ? 'kpi-card__trend--up' : 'kpi-card__trend--neutral'">
                        {{ kpi.trend }}
                    </div>
                </div>
            </template>
        </div>

        <!-- Two column: company table + recent activity -->
        <div class="sa-dashboard__cols">
            <!-- Company breakdown -->
            <div class="sa-panel">
                <div class="sa-panel__header">
                    <h6 class="sa-panel__title">Company Performance</h6>
                    <div class="sa-panel__actions">
                        <select v-model="sortBy" class="sa-select" @change="loadAnalytics">
                            <option value="revenue">By Revenue</option>
                            <option value="orders">By Orders</option>
                            <option value="users">By Users</option>
                        </select>
                    </div>
                </div>
                <div class="sa-panel__body">
                    <SkeletonLoader v-if="loadingAnalytics" :count="5" :height="44" :gap="8" />
                    <template v-else-if="companyStore.analytics?.length">
                        <div v-for="(company, idx) in companyStore.analytics" :key="company.id" class="company-row">
                            <span class="company-row__rank">#{{ idx + 1 }}</span>
                            <div class="company-row__info">
                                <p class="company-row__name">{{ company.name }}</p>
                                <p class="company-row__meta">
                                    {{ company.users_count }} users · {{ company.orders_count }} orders
                                </p>
                            </div>
                            <div class="company-row__right">
                                <p class="company-row__revenue">৳{{ formatNum(company.revenue) }}</p>
                                <span class="company-row__badge"
                                    :class="company.status === 'active' ? 'badge--active' : 'badge--inactive'">
                                    {{ company.status }}
                                </span>
                            </div>
                        </div>
                    </template>
                    <EmptyState v-else title="No companies yet" compact>
                        <template #icon>
                            <Building2 :size="40" :stroke-width="1.5" />
                        </template>
                    </EmptyState>
                </div>
            </div>

            <!-- Revenue trend (simple bar chart) -->
            <div class="sa-panel">
                <div class="sa-panel__header">
                    <h6 class="sa-panel__title">Revenue Trend</h6>
                    <div class="sa-panel__actions">
                        <select v-model="trendDays" class="sa-select" @change="loadTrend">
                            <option :value="7">7 days</option>
                            <option :value="14">14 days</option>
                            <option :value="30">30 days</option>
                        </select>
                    </div>
                </div>
                <div class="sa-panel__body">
                    <SkeletonLoader v-if="loadingTrend" :count="1" :height="160" />
                    <div v-else-if="trendData.length" class="trend-chart">
                        <div class="trend-bars">
                            <div v-for="d in trendData" :key="d.date" class="trend-bar-wrap"
                                :title="`${d.date}: ৳${d.revenue}`">
                                <div class="trend-bar" :style="{ height: barHeight(d.revenue) + '%' }" />
                            </div>
                        </div>
                        <div class="trend-labels">
                            <span v-for="d in trendLabelsSparse" :key="d.date" class="trend-label">
                                {{ formatTrendDate(d.date) }}
                            </span>
                        </div>
                        <div class="trend-summary">
                            <span class="trend-summary__total">Total: ৳{{ formatNum(trendTotal) }}</span>
                            <span class="trend-summary__avg">Avg/day: ৳{{ formatNum(trendAvg) }}</span>
                        </div>
                    </div>
                    <EmptyState v-else title="No revenue data" compact>
                        <template #icon>
                            <TrendingUp :size="40" :stroke-width="1.5" />
                        </template>
                    </EmptyState>
                </div>
            </div>
        </div>

        <!-- Recent audit logs -->
        <div class="sa-panel">
            <div class="sa-panel__header">
                <h6 class="sa-panel__title">Recent Activity</h6>
                <router-link to="/super/audit" class="sa-panel__link">View all →</router-link>
            </div>
            <div class="sa-panel__body">
                <SkeletonLoader v-if="loadingRecent" :count="5" :height="40" :gap="8" />
                <template v-else-if="recentLogs.length">
                    <div v-for="log in recentLogs" :key="log.id" class="audit-row">
                        <div class="audit-row__dot" :class="auditDotClass(log.action)" />
                        <div class="audit-row__body">
                            <p class="audit-row__action">{{ formatAction(log.action) }}</p>
                            <p class="audit-row__meta">
                                {{ log.user?.name || 'System' }}
                                <span v-if="log.company"> · {{ log.company.name }}</span>
                            </p>
                        </div>
                        <span class="audit-row__time">{{ timeAgo(log.created_at) }}</span>
                    </div>
                </template>
                <EmptyState v-else title="No recent activity" compact>
                    <template #icon>
                        <ClipboardList :size="40" :stroke-width="1.5" />
                    </template>
                </EmptyState>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Building2, Users, ShoppingCart, DollarSign, TrendingUp, ClipboardList } from '@lucide/vue'
import api from '@/api'

const companyStore = useCompanyStore()
const sortBy = ref('revenue')
const trendDays = ref(30)
const trendData = ref([])
const recentLogs = ref([])
const loadingAnalytics = ref(false)
const loadingTrend = ref(false)
const loadingRecent = ref(false)

// KPI cards
const kpiCards = computed(() => {
    const o = companyStore.overview
    if (!o) return []
    return [
        {
            label: 'Total Companies', value: o.companies, trend: `${o.active_companies} active`,
            trendUp: true,
            icon: Building2,
            bg: '#EEF2FF', color: '#4F46E5',
        },
        {
            label: 'Total Users', value: o.total_users, trend: 'All tenants',
            trendUp: true,
            icon: Users,
            bg: '#D1FAE5', color: '#059669',
        },
        {
            label: 'Total Orders', value: formatNum(o.total_orders), trend: `${o.orders_today} today`,
            trendUp: o.orders_today > 0,
            icon: ShoppingCart,
            bg: '#FEF3C7', color: '#D97706',
        },
        {
            label: 'Total Revenue', value: '৳' + formatNum(o.total_revenue), trend: `৳${formatNum(o.revenue_today)} today`,
            trendUp: o.revenue_today > 0,
            icon: DollarSign,
            bg: '#CFFAFE', color: '#0891B2',
        },
    ]
})

const trendMax = computed(() => Math.max(...trendData.value.map(d => d.revenue), 1))
const trendTotal = computed(() => trendData.value.reduce((s, d) => s + d.revenue, 0))
const trendAvg = computed(() => trendData.value.length ? trendTotal.value / trendData.value.length : 0)
const trendLabelsSparse = computed(() => {
    if (!trendData.value.length) return []
    const step = Math.ceil(trendData.value.length / 4)
    return trendData.value.filter((_, i) => i % step === 0)
})

function barHeight(rev) {
    return Math.max((rev / trendMax.value) * 100, 4)
}

function formatNum(n) {
    if (n == null) return '0'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return Number(n).toLocaleString()
}

function formatTrendDate(dt) {
    return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function timeAgo(dt) {
    const diff = Date.now() - new Date(dt).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function formatAction(action) {
    return action.replace(/\./g, ' › ').replace(/_/g, ' ')
}

function auditDotClass(action) {
    if (action.includes('delete') || action.includes('cancel')) return 'dot--danger'
    if (action.includes('payment')) return 'dot--success'
    if (action.includes('impersonat')) return 'dot--warning'
    return 'dot--info'
}

async function loadAnalytics() {
    loadingAnalytics.value = true
    try { await companyStore.fetchAnalytics(sortBy.value) }
    finally { loadingAnalytics.value = false }
}

async function loadTrend() {
    loadingTrend.value = true
    try {
        trendData.value = await companyStore.fetchRevenueTrend(trendDays.value)
    } finally {
        loadingTrend.value = false
    }
}

async function loadRecent() {
    loadingRecent.value = true
    try {
        const { data } = await api.get('/admin/audit-logs/recent')
        recentLogs.value = data.data || []
    } catch (_) { }
    finally { loadingRecent.value = false }
}

onMounted(async () => {
    await companyStore.fetchOverview()
    await Promise.all([loadAnalytics(), loadTrend(), loadRecent()])
})
</script>

<style scoped>
.sa-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* KPI */
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

@media (max-width: 1100px) {
    .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 560px) {
    .kpi-grid {
        grid-template-columns: 1fr;
    }
}

.kpi-card {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.kpi-card__icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.kpi-card__body {
    flex: 1;
    min-width: 0;
}

.kpi-card__value {
    font-size: 22px;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0;
    letter-spacing: -.03em;
}

.kpi-card__label {
    font-size: 12px;
    color: var(--gray-400);
    margin: 0;
}

.kpi-card__trend {
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
}

.kpi-card__trend--up {
    color: var(--success);
}

.kpi-card__trend--neutral {
    color: var(--gray-400);
}

/* Cols */
.sa-dashboard__cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
}

@media (max-width: 900px) {
    .sa-dashboard__cols {
        grid-template-columns: 1fr;
    }
}

/* Panel */
.sa-panel {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.sa-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--gray-100);
}

.sa-panel__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.sa-panel__link {
    font-size: 13px;
    color: var(--primary);
    font-weight: 500;
    text-decoration: none;
}

.sa-panel__body {
    padding: 1rem 1.25rem;
}

.sa-select {
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm);
    padding: .25rem .5rem;
    font-size: 12px;
    color: var(--gray-600);
    background: #fff;
    outline: none;
    cursor: pointer;
    font-family: inherit;
}

/* Company rows */
.company-row {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .625rem 0;
    border-bottom: 1px solid var(--gray-50);
}

.company-row:last-child {
    border-bottom: none;
}

.company-row__rank {
    font-size: 12px;
    color: var(--gray-400);
    font-weight: 600;
    width: 22px;
    text-align: right;
    flex-shrink: 0;
}

.company-row__info {
    flex: 1;
    min-width: 0;
}

.company-row__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-900);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.company-row__meta {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0;
}

.company-row__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
}

.company-row__revenue {
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.company-row__badge {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 99px;
}

.badge--active {
    background: var(--success-light);
    color: var(--success);
}

.badge--inactive {
    background: var(--gray-100);
    color: var(--gray-400);
}

/* Trend chart */
.trend-chart {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.trend-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 120px;
}

.trend-bar-wrap {
    flex: 1;
    display: flex;
    align-items: flex-end;
    height: 100%;
    cursor: pointer;
}

.trend-bar {
    width: 100%;
    background: var(--primary);
    border-radius: 3px 3px 0 0;
    opacity: .8;
    transition: opacity .15s;
    min-height: 4px;
}

.trend-bar-wrap:hover .trend-bar {
    opacity: 1;
}

.trend-labels {
    display: flex;
    justify-content: space-between;
}

.trend-label {
    font-size: 10px;
    color: var(--gray-400);
}

.trend-summary {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--gray-500);
    font-weight: 500;
}

/* Audit rows */
.audit-row {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: .5rem 0;
    border-bottom: 1px solid var(--gray-50);
}

.audit-row:last-child {
    border-bottom: none;
}

.audit-row__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
}

.dot--danger {
    background: var(--danger);
}

.dot--success {
    background: var(--success);
}

.dot--warning {
    background: var(--warning);
}

.dot--info {
    background: var(--info);
}

.audit-row__body {
    flex: 1;
    min-width: 0;
}

.audit-row__action {
    font-size: 13px;
    font-weight: 500;
    color: var(--gray-800);
    margin: 0;
    text-transform: capitalize;
}

.audit-row__meta {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0;
}

.audit-row__time {
    font-size: 11px;
    color: var(--gray-400);
    flex-shrink: 0;
}
</style>