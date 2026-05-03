<template>
    <div class="companies-view">

        <!-- Page toolbar -->
        <div class="toolbar">
            <div class="toolbar__search">
                <svg class="toolbar__search-icon" width="16" height="16" fill="none" stroke="currentColor"
                    stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <input v-model="searchQuery" type="text" class="toolbar__search-input"
                    placeholder="Search companies…" />
            </div>
            <div class="toolbar__right">
                <select v-model="filterStatus" class="toolbar__filter">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button class="btn-primary-sm" @click="openCreateModal">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"
                        viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Company
                </button>
            </div>
        </div>

        <!-- Table -->
        <div class="companies-table-wrap">
            <SkeletonLoader v-if="companyStore.loading" :count="6" :height="52" :gap="8" />

            <table v-else-if="filteredCompanies.length" class="companies-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Plan</th>
                        <th>Users</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="company in filteredCompanies" :key="company.id">
                        <td>
                            <div class="company-cell">
                                <div class="company-cell__avatar">{{ company.name[0].toUpperCase() }}</div>
                                <div>
                                    <p class="company-cell__name">{{ company.name }}</p>
                                    <p class="company-cell__slug">{{ company.slug }}</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="plan-badge" :class="'plan-badge--' + company.plan">
                                {{ company.plan }}
                            </span>
                        </td>
                        <td>
                            <span class="text-sm">{{ company.users_count ?? '—' }}</span>
                        </td>
                        <td>
                            <span class="status-dot-wrap">
                                <span class="status-dot" :class="'status-dot--' + company.status" />
                                {{ company.status }}
                            </span>
                        </td>
                        <td class="text-sm text-muted">{{ formatDate(company.created_at) }}</td>
                        <td>
                            <div class="action-btns">
                                <button class="action-btn" title="Toggle status" @click="handleToggleStatus(company)">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24">
                                        <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
                                    </svg>
                                </button>
                                <button class="action-btn action-btn--edit" title="Edit"
                                    @click="openEditModal(company)">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button class="action-btn action-btn--delete" title="Delete"
                                    @click="handleDelete(company)">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path
                                            d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <EmptyState v-else icon="🏢" title="No companies found"
                description="Add your first tenant company to get started." />
        </div>

        <!-- Pagination -->
        <div v-if="companyStore.companiesMeta?.last_page > 1" class="pagination">
            <button class="pagination__btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">←
                Prev</button>
            <span class="pagination__info">
                Page {{ currentPage }} of {{ companyStore.companiesMeta.last_page }}
            </span>
            <button class="pagination__btn" :disabled="currentPage === companyStore.companiesMeta.last_page"
                @click="changePage(currentPage + 1)">Next →</button>
        </div>

        <!-- Create / Edit Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-box">
                <div class="modal-box__header">
                    <h5 class="modal-box__title">{{ editingCompany ? 'Edit Company' : 'Create New Company' }}</h5>
                    <button class="modal-box__close" @click="closeModal">✕</button>
                </div>

                <div class="modal-box__body">
                    <!-- Company info -->
                    <p class="form-section-label">Company Information</p>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Company Name *</label>
                            <input v-model="form.name" type="text" class="form-input"
                                :class="{ 'form-input--error': formErrors.name }" placeholder="Acme Corporation"
                                @input="autoSlug" />
                            <p v-if="formErrors.name" class="form-error">{{ formErrors.name }}</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Slug *</label>
                            <input v-model="form.slug" type="text" class="form-input"
                                :class="{ 'form-input--error': formErrors.slug }" placeholder="acme-corporation" />
                            <p v-if="formErrors.slug" class="form-error">{{ formErrors.slug }}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select v-model="form.status" class="form-input">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Plan</label>
                            <select v-model="form.plan" class="form-input">
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <!-- Admin info (create only) -->
                    <template v-if="!editingCompany">
                        <p class="form-section-label" style="margin-top:1.25rem">Admin Account</p>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Admin Name *</label>
                                <input v-model="form.admin_name" type="text" class="form-input"
                                    :class="{ 'form-input--error': formErrors.admin_name }" placeholder="John Smith" />
                                <p v-if="formErrors.admin_name" class="form-error">{{ formErrors.admin_name }}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Admin Email *</label>
                                <input v-model="form.admin_email" type="email" class="form-input"
                                    :class="{ 'form-input--error': formErrors.admin_email }"
                                    placeholder="admin@company.com" />
                                <p v-if="formErrors.admin_email" class="form-error">{{ formErrors.admin_email }}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Password *</label>
                                <input v-model="form.admin_password" type="password" class="form-input"
                                    :class="{ 'form-input--error': formErrors.admin_password }"
                                    placeholder="Min 8 characters" />
                                <p v-if="formErrors.admin_password" class="form-error">{{ formErrors.admin_password }}
                                </p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Confirm Password *</label>
                                <input v-model="form.admin_password_confirmation" type="password" class="form-input"
                                    placeholder="Repeat password" />
                            </div>
                        </div>
                    </template>
                </div>

                <div class="modal-box__footer">
                    <button class="btn-cancel" @click="closeModal">Cancel</button>
                    <button class="btn-submit" :disabled="saving" @click="handleSubmit">
                        <span v-if="saving" class="btn-spinner" />
                        {{ saving ? 'Saving…' : editingCompany ? 'Update Company' : 'Create Company' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const companyStore = useCompanyStore()
const toast = useToast()
const { confirmDelete, confirmAction } = useConfirm()

const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const showModal = ref(false)
const editingCompany = ref(null)
const saving = ref(false)

const form = reactive({
    name: '', slug: '', status: 'active', plan: 'free',
    admin_name: '', admin_email: '', admin_password: '', admin_password_confirmation: '',
})
const formErrors = reactive({
    name: '', slug: '', admin_name: '', admin_email: '', admin_password: '',
})

const filteredCompanies = computed(() => {
    let list = companyStore.companies
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(c => c.name.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q))
    }
    if (filterStatus.value) {
        list = list.filter(c => c.status === filterStatus.value)
    }
    return list
})

function autoSlug() {
    if (!editingCompany.value) {
        form.slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
}

function formatDate(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openCreateModal() {
    editingCompany.value = null
    Object.assign(form, { name: '', slug: '', status: 'active', plan: 'free', admin_name: '', admin_email: '', admin_password: '', admin_password_confirmation: '' })
    Object.assign(formErrors, { name: '', slug: '', admin_name: '', admin_email: '', admin_password: '' })
    showModal.value = true
}

function openEditModal(company) {
    editingCompany.value = company
    Object.assign(form, { name: company.name, slug: company.slug, status: company.status, plan: company.plan })
    Object.assign(formErrors, { name: '', slug: '', admin_name: '', admin_email: '', admin_password: '' })
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    editingCompany.value = null
}

function validate() {
    let valid = true
    Object.assign(formErrors, { name: '', slug: '', admin_name: '', admin_email: '', admin_password: '' })

    if (!form.name.trim()) { formErrors.name = 'Company name is required.'; valid = false }
    if (!form.slug.trim()) { formErrors.slug = 'Slug is required.'; valid = false }
    else if (!/^[a-z0-9-]+$/.test(form.slug)) { formErrors.slug = 'Only lowercase letters, numbers and hyphens.'; valid = false }

    if (!editingCompany.value) {
        if (!form.admin_name.trim()) { formErrors.admin_name = 'Admin name is required.'; valid = false }
        if (!form.admin_email.trim()) { formErrors.admin_email = 'Admin email is required.'; valid = false }
        if (form.admin_password.length < 8) { formErrors.admin_password = 'Password must be at least 8 characters.'; valid = false }
        if (form.admin_password !== form.admin_password_confirmation) { formErrors.admin_password = 'Passwords do not match.'; valid = false }
    }
    return valid
}

async function handleSubmit() {
    if (!validate()) return
    saving.value = true
    try {
        if (editingCompany.value) {
            await companyStore.updateCompany(editingCompany.value.id, { name: form.name, slug: form.slug, status: form.status, plan: form.plan })
            toast.success('Company updated successfully.')
        } else {
            await companyStore.createCompany({ ...form })
            toast.success('Company created successfully.')
        }
        closeModal()
    } catch (err) {
        const msg = err.response?.data?.message || 'Failed to save company.'
        toast.error(msg)
    } finally {
        saving.value = false
    }
}

async function handleToggleStatus(company) {
    const newStatus = company.status === 'active' ? 'inactive' : 'active'
    const confirmed = await confirmAction({
        title: `${newStatus === 'active' ? 'Activate' : 'Deactivate'} ${company.name}?`,
        text: `This will change the company status to ${newStatus}.`,
        confirmText: 'Yes, proceed',
    })
    if (!confirmed) return
    try {
        await companyStore.toggleCompanyStatus(company.id)
        toast.success(`Company status changed to ${newStatus}.`)
    } catch (_) { }
}

async function handleDelete(company) {
    const confirmed = await confirmDelete(company.name)
    if (!confirmed) return
    try {
        await companyStore.deleteCompany(company.id)
        toast.success('Company deleted.')
    } catch (_) { }
}

async function changePage(page) {
    currentPage.value = page
    await companyStore.fetchCompanies(page)
}

onMounted(() => companyStore.fetchCompanies(1))
</script>

<style scoped>
.companies-view {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    gap: .75rem;
    flex-wrap: wrap;
}

.toolbar__search {
    position: relative;
    flex: 1;
    min-width: 200px;
}

.toolbar__search-icon {
    position: absolute;
    left: .75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-400);
    pointer-events: none;
}

.toolbar__search-input {
    width: 100%;
    padding: .625rem .75rem .625rem 2.25rem;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--gray-800);
    background: #fff;
    outline: none;
    font-family: inherit;
}

.toolbar__search-input:focus {
    border-color: var(--primary);
}

.toolbar__right {
    display: flex;
    align-items: center;
    gap: .625rem;
}

.toolbar__filter {
    padding: .625rem .75rem;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--gray-700);
    background: #fff;
    outline: none;
    cursor: pointer;
    font-family: inherit;
}

.btn-primary-sm {
    display: flex;
    align-items: center;
    gap: .375rem;
    padding: .625rem 1rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background .15s;
    white-space: nowrap;
}

.btn-primary-sm:hover {
    background: var(--primary-dark);
}

/* Table */
.companies-table-wrap {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.companies-table {
    width: 100%;
    border-collapse: collapse;
}

.companies-table th {
    background: var(--gray-50);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--gray-500);
    padding: .75rem 1rem;
    text-align: left;
    white-space: nowrap;
}

.companies-table td {
    padding: .875rem 1rem;
    border-top: 1px solid var(--gray-100);
}

.companies-table tbody tr:hover {
    background: var(--gray-50);
}

.company-cell {
    display: flex;
    align-items: center;
    gap: .625rem;
}

.company-cell__avatar {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    background: var(--primary-light);
    color: var(--primary);
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.company-cell__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-900);
    margin: 0;
}

.company-cell__slug {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0;
}

.plan-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
}

.plan-badge--free {
    background: var(--gray-100);
    color: var(--gray-500);
}

.plan-badge--paid {
    background: #FEF3C7;
    color: #B45309;
}

.status-dot-wrap {
    display: flex;
    align-items: center;
    gap: .375rem;
    font-size: 13px;
    color: var(--gray-700);
    text-transform: capitalize;
}

.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-dot--active {
    background: var(--success);
}

.status-dot--inactive {
    background: var(--gray-400);
}

.status-dot--suspended {
    background: var(--danger);
}

.text-sm {
    font-size: 13px;
    color: var(--gray-700);
}

.text-muted {
    color: var(--gray-400);
}

.action-btns {
    display: flex;
    align-items: center;
    gap: .25rem;
}

.action-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm);
    background: #fff;
    cursor: pointer;
    color: var(--gray-500);
    transition: all .15s;
}

.action-btn:hover {
    background: var(--gray-50);
    color: var(--gray-700);
}

.action-btn--edit:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
}

.action-btn--delete:hover {
    border-color: var(--danger);
    color: var(--danger);
    background: var(--danger-light);
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .75rem;
}

.pagination__btn {
    padding: .5rem 1rem;
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

.pagination__info {
    font-size: 13px;
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
    max-width: 620px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-xl);
    overflow: hidden;
}

.modal-box__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--gray-100);
    flex-shrink: 0;
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
    color: var(--gray-700);
}

.modal-box__body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: .875rem;
}

.modal-box__footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--gray-100);
    display: flex;
    justify-content: flex-end;
    gap: .625rem;
    flex-shrink: 0;
}

.form-section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--gray-500);
    margin: 0;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .875rem;
}

@media (max-width: 500px) {
    .form-row {
        grid-template-columns: 1fr;
    }
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

.form-input--error {
    border-color: var(--danger);
}

.form-error {
    font-size: 12px;
    color: var(--danger);
    margin: 0;
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