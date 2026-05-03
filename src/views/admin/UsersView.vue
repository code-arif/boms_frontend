<template>
    <div class="users-view">

        <!-- Tabs -->
        <div class="tabs">
            <button class="tab" :class="{ 'tab--active': activeTab === 'employees' }" @click="activeTab = 'employees'">
                Employees <span class="tab-count">{{ companyStore.users.length }}</span>
            </button>
            <button class="tab" :class="{ 'tab--active': activeTab === 'menu' }"
                @click="activeTab = 'menu'; loadMenu()">
                Menu Items <span class="tab-count">{{ orderStore.menuItems.length }}</span>
            </button>
            <button class="tab" :class="{ 'tab--active': activeTab === 'teams' }"
                @click="activeTab = 'teams'; loadTeams()">
                Teams <span class="tab-count">{{ companyStore.teams.length }}</span>
            </button>
        </div>

        <!-- ── EMPLOYEES TAB ─────────────────────────────── -->
        <div v-if="activeTab === 'employees'">
            <div class="tab-toolbar">
                <div class="search-wrap">
                    <svg class="search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input v-model="userSearch" class="search-input" type="text" placeholder="Search employees…" />
                </div>
                <button class="btn-primary-sm" @click="openUserModal(null)">+ Add Employee</button>
            </div>

            <SkeletonLoader v-if="companyStore.loading" :count="5" :height="56" :gap="8" />

            <div v-else class="users-list">
                <EmptyState v-if="!filteredUsers.length" icon="👥" title="No employees found"
                    description="Add your first employee to get started." />
                <div v-for="user in filteredUsers" :key="user.id" class="user-card">
                    <div class="user-card__avatar"
                        :class="user.is_active ? 'user-card__avatar--active' : 'user-card__avatar--inactive'">
                        {{ (user.name || 'U')[0].toUpperCase() }}
                    </div>
                    <div class="user-card__body">
                        <p class="user-card__name">{{ user.name }}</p>
                        <p class="user-card__email">{{ user.email }}</p>
                    </div>
                    <div class="user-card__right">
                        <span class="role-badge" :class="'role-badge--' + user.role">{{ user.role.replace('_', ' ')
                            }}</span>
                        <div class="user-card__actions">
                            <button class="action-btn" :title="user.is_active ? 'Deactivate' : 'Activate'"
                                @click="handleToggleActive(user)">
                                <svg v-if="user.is_active" width="14" height="14" fill="none" stroke="currentColor"
                                    stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
                                </svg>
                                <svg v-else width="14" height="14" fill="none" stroke="var(--success)" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </button>
                            <button class="action-btn action-btn--edit" title="Edit" @click="openUserModal(user)">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button class="action-btn action-btn--delete" title="Delete"
                                @click="handleDeleteUser(user)">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── MENU ITEMS TAB ────────────────────────────── -->
        <div v-if="activeTab === 'menu'">
            <div class="tab-toolbar">
                <div class="search-wrap">
                    <svg class="search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input v-model="menuSearch" class="search-input" type="text" placeholder="Search menu…" />
                </div>
                <button class="btn-primary-sm" @click="openMenuModal(null)">+ Add Item</button>
            </div>

            <SkeletonLoader v-if="orderStore.loading" :count="5" :height="56" :gap="8" />

            <div v-else class="menu-grid">
                <EmptyState v-if="!filteredMenu.length" icon="🍽️" title="No menu items yet"
                    description="Add items for employees to order." />
                <div v-for="item in filteredMenu" :key="item.id" class="menu-card">
                    <div class="menu-card__top">
                        <div>
                            <p class="menu-card__name">{{ item.name }}</p>
                            <p class="menu-card__cat">{{ item.category || 'Uncategorized' }}</p>
                        </div>
                        <p class="menu-card__price">৳{{ item.price }}</p>
                    </div>
                    <p v-if="item.description" class="menu-card__desc">{{ item.description }}</p>
                    <div class="menu-card__footer">
                        <button class="avail-toggle"
                            :class="item.is_available ? 'avail-toggle--on' : 'avail-toggle--off'"
                            @click="handleToggleAvail(item)">
                            {{ item.is_available ? '✅ Available' : '❌ Unavailable' }}
                        </button>
                        <div class="menu-card__actions">
                            <button class="action-btn action-btn--edit" @click="openMenuModal(item)">
                                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button class="action-btn action-btn--delete" @click="handleDeleteMenu(item)">
                                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── TEAMS TAB ──────────────────────────────────── -->
        <div v-if="activeTab === 'teams'">
            <div class="tab-toolbar">
                <span class="tab-toolbar__label">Manage teams and assign employees.</span>
                <button class="btn-primary-sm" @click="openTeamModal">+ New Team</button>
            </div>
            <SkeletonLoader v-if="companyStore.loading" :count="3" :height="60" :gap="8" />
            <div v-else class="teams-list">
                <EmptyState v-if="!companyStore.teams.length" icon="🏷️" title="No teams yet" compact />
                <div v-for="team in companyStore.teams" :key="team.id" class="team-card">
                    <div class="team-card__icon">🏷️</div>
                    <div class="team-card__body">
                        <p class="team-card__name">{{ team.name }}</p>
                        <p class="team-card__desc">{{ team.description || 'No description' }}</p>
                    </div>
                    <button class="action-btn action-btn--delete" @click="handleDeleteTeam(team)">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                            viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- ── User Modal ─────────────────────────────────── -->
        <div v-if="showUserModal" class="modal-overlay" @click.self="showUserModal = false">
            <div class="modal-box">
                <div class="modal-box__header">
                    <h5 class="modal-box__title">{{ editingUser ? 'Edit Employee' : 'Add Employee' }}</h5>
                    <button class="modal-box__close" @click="showUserModal = false">✕</button>
                </div>
                <div class="modal-box__body">
                    <div class="form-group">
                        <label class="form-label">Full Name *</label>
                        <input v-model="userForm.name" type="text" class="form-input"
                            :class="{ 'form-input--error': userErrors.name }" placeholder="John Smith" />
                        <p v-if="userErrors.name" class="form-error">{{ userErrors.name }}</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email *</label>
                        <input v-model="userForm.email" type="email" class="form-input"
                            :class="{ 'form-input--error': userErrors.email }" placeholder="john@company.com" />
                        <p v-if="userErrors.email" class="form-error">{{ userErrors.email }}</p>
                    </div>
                    <template v-if="!editingUser">
                        <div class="form-group">
                            <label class="form-label">Password *</label>
                            <input v-model="userForm.password" type="password" class="form-input"
                                :class="{ 'form-input--error': userErrors.password }" placeholder="Min 8 characters" />
                            <p v-if="userErrors.password" class="form-error">{{ userErrors.password }}</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Confirm Password *</label>
                            <input v-model="userForm.password_confirmation" type="password" class="form-input"
                                placeholder="Repeat password" />
                        </div>
                    </template>
                </div>
                <div class="modal-box__footer">
                    <button class="btn-cancel" @click="showUserModal = false">Cancel</button>
                    <button class="btn-submit" :disabled="saving" @click="handleUserSubmit">
                        <span v-if="saving" class="btn-spinner" />
                        {{ saving ? 'Saving…' : editingUser ? 'Update' : 'Add Employee' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Menu Modal ────────────────────────────────── -->
        <div v-if="showMenuModal" class="modal-overlay" @click.self="showMenuModal = false">
            <div class="modal-box">
                <div class="modal-box__header">
                    <h5 class="modal-box__title">{{ editingMenu ? 'Edit Menu Item' : 'Add Menu Item' }}</h5>
                    <button class="modal-box__close" @click="showMenuModal = false">✕</button>
                </div>
                <div class="modal-box__body">
                    <div class="form-row-2">
                        <div class="form-group">
                            <label class="form-label">Name *</label>
                            <input v-model="menuForm.name" type="text" class="form-input" placeholder="Egg Paratha" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Price (৳) *</label>
                            <input v-model="menuForm.price" type="number" class="form-input" placeholder="0.00"
                                step="0.01" />
                        </div>
                    </div>
                    <div class="form-row-2">
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <input v-model="menuForm.category" type="text" class="form-input"
                                placeholder="Bread, Protein, Drinks…" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Available</label>
                            <select v-model="menuForm.is_available" class="form-input">
                                <option :value="true">Yes</option>
                                <option :value="false">No</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea v-model="menuForm.description" class="form-input form-textarea" rows="2"
                            placeholder="Brief description…" />
                    </div>
                </div>
                <div class="modal-box__footer">
                    <button class="btn-cancel" @click="showMenuModal = false">Cancel</button>
                    <button class="btn-submit" :disabled="saving" @click="handleMenuSubmit">
                        <span v-if="saving" class="btn-spinner" />
                        {{ saving ? 'Saving…' : editingMenu ? 'Update' : 'Add Item' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Team Modal ────────────────────────────────── -->
        <div v-if="showTeamModal" class="modal-overlay" @click.self="showTeamModal = false">
            <div class="modal-box">
                <div class="modal-box__header">
                    <h5 class="modal-box__title">New Team</h5>
                    <button class="modal-box__close" @click="showTeamModal = false">✕</button>
                </div>
                <div class="modal-box__body">
                    <div class="form-group">
                        <label class="form-label">Team Name *</label>
                        <input v-model="teamForm.name" type="text" class="form-input" placeholder="e.g. Kitchen Team" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea v-model="teamForm.description" class="form-input form-textarea" rows="2"
                            placeholder="Optional description" />
                    </div>
                </div>
                <div class="modal-box__footer">
                    <button class="btn-cancel" @click="showTeamModal = false">Cancel</button>
                    <button class="btn-submit" :disabled="saving" @click="handleTeamSubmit">
                        <span v-if="saving" class="btn-spinner" />
                        {{ saving ? 'Saving…' : 'Create Team' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { useOrderStore } from '@/stores/order'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const companyStore = useCompanyStore()
const orderStore = useOrderStore()
const toast = useToast()
const { confirmDelete, confirmAction } = useConfirm()

const activeTab = ref('employees')
const userSearch = ref('')
const menuSearch = ref('')
const saving = ref(false)

// User modal
const showUserModal = ref(false)
const editingUser = ref(null)
const userForm = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const userErrors = reactive({ name: '', email: '', password: '' })

// Menu modal
const showMenuModal = ref(false)
const editingMenu = ref(null)
const menuForm = reactive({ name: '', price: '', category: '', description: '', is_available: true })

// Team modal
const showTeamModal = ref(false)
const teamForm = reactive({ name: '', description: '' })

// Computed
const filteredUsers = computed(() => {
    const q = userSearch.value.toLowerCase()
    return companyStore.users.filter(u =>
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
})
const filteredMenu = computed(() => {
    const q = menuSearch.value.toLowerCase()
    return orderStore.menuItems.filter(m => !q || m.name.toLowerCase().includes(q))
})

// User actions
function openUserModal(user) {
    editingUser.value = user
    if (user) {
        Object.assign(userForm, { name: user.name, email: user.email, password: '', password_confirmation: '' })
    } else {
        Object.assign(userForm, { name: '', email: '', password: '', password_confirmation: '' })
    }
    Object.assign(userErrors, { name: '', email: '', password: '' })
    showUserModal.value = true
}

function validateUser() {
    let valid = true
    Object.assign(userErrors, { name: '', email: '', password: '' })
    if (!userForm.name.trim()) { userErrors.name = 'Name is required.'; valid = false }
    if (!userForm.email.trim()) { userErrors.email = 'Email is required.'; valid = false }
    if (!editingUser.value) {
        if (userForm.password.length < 8) { userErrors.password = 'Min 8 characters.'; valid = false }
        if (userForm.password !== userForm.password_confirmation) { userErrors.password = 'Passwords do not match.'; valid = false }
    }
    return valid
}

async function handleUserSubmit() {
    if (!validateUser()) return
    saving.value = true
    try {
        if (editingUser.value) {
            await companyStore.updateUser(editingUser.value.id, { name: userForm.name, email: userForm.email })
            toast.success('Employee updated.')
        } else {
            await companyStore.createUser({ name: userForm.name, email: userForm.email, password: userForm.password, password_confirmation: userForm.password_confirmation })
            toast.success('Employee added.')
        }
        showUserModal.value = false
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to save.')
    } finally {
        saving.value = false
    }
}

async function handleToggleActive(user) {
    const confirmed = await confirmAction({ title: `${user.is_active ? 'Deactivate' : 'Activate'} ${user.name}?`, confirmText: 'Confirm' })
    if (!confirmed) return
    try {
        await companyStore.toggleUserActive(user.id)
        toast.success(`${user.name} ${user.is_active ? 'deactivated' : 'activated'}.`)
    } catch (_) { }
}

async function handleDeleteUser(user) {
    const confirmed = await confirmDelete(user.name)
    if (!confirmed) return
    try {
        await companyStore.deleteUser(user.id)
        toast.success('Employee deleted.')
    } catch (_) { }
}

// Menu actions
function openMenuModal(item) {
    editingMenu.value = item
    if (item) {
        Object.assign(menuForm, { name: item.name, price: item.price, category: item.category || '', description: item.description || '', is_available: item.is_available })
    } else {
        Object.assign(menuForm, { name: '', price: '', category: '', description: '', is_available: true })
    }
    showMenuModal.value = true
}

async function handleMenuSubmit() {
    if (!menuForm.name.trim() || !menuForm.price) { toast.error('Name and price are required.'); return }
    saving.value = true
    try {
        if (editingMenu.value) {
            await orderStore.updateMenuItem(editingMenu.value.id, { ...menuForm })
            toast.success('Menu item updated.')
        } else {
            await orderStore.createMenuItem({ ...menuForm })
            toast.success('Menu item added.')
        }
        showMenuModal.value = false
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to save.')
    } finally {
        saving.value = false
    }
}

async function handleToggleAvail(item) {
    try {
        await orderStore.toggleMenuItemAvailability(item.id)
        toast.success(`${item.name} ${item.is_available ? 'disabled' : 'enabled'}.`)
    } catch (_) { }
}

async function handleDeleteMenu(item) {
    const confirmed = await confirmDelete(item.name)
    if (!confirmed) return
    try {
        await orderStore.deleteMenuItem(item.id)
        toast.success('Menu item deleted.')
    } catch (_) { }
}

// Team actions
function openTeamModal() {
    Object.assign(teamForm, { name: '', description: '' })
    showTeamModal.value = true
}

async function handleTeamSubmit() {
    if (!teamForm.name.trim()) { toast.error('Team name is required.'); return }
    saving.value = true
    try {
        await companyStore.createTeam({ ...teamForm })
        toast.success('Team created.')
        showTeamModal.value = false
    } catch (_) { }
    finally { saving.value = false }
}

async function handleDeleteTeam(team) {
    const confirmed = await confirmDelete(team.name)
    if (!confirmed) return
    try {
        await companyStore.deleteTeam(team.id)
        toast.success('Team deleted.')
    } catch (_) { }
}

async function loadMenu() { await orderStore.fetchMenu() }
async function loadTeams() { await companyStore.fetchTeams() }

onMounted(async () => {
    await companyStore.fetchUsers()
    await orderStore.fetchMenu()
})
</script>

<style scoped>
.users-view {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

/* Tabs */
.tabs {
    display: flex;
    gap: .25rem;
    background: var(--gray-100);
    padding: 4px;
    border-radius: var(--radius-lg);
    align-self: flex-start;
}

.tab {
    padding: .5rem 1.125rem;
    border: none;
    background: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
    color: var(--gray-500);
    cursor: pointer;
    font-family: inherit;
    transition: all .15s;
    display: flex;
    align-items: center;
    gap: .375rem;
}

.tab:hover {
    color: var(--gray-700);
}

.tab--active {
    background: #fff;
    color: var(--gray-900);
    box-shadow: var(--shadow-sm);
}

.tab-count {
    font-size: 11px;
    background: var(--gray-200);
    color: var(--gray-600);
    padding: 1px 6px;
    border-radius: 99px;
    font-weight: 600;
}

.tab--active .tab-count {
    background: var(--primary-light);
    color: var(--primary);
}

/* Toolbar */
.tab-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
    flex-wrap: wrap;
    margin-bottom: .875rem;
}

.tab-toolbar__label {
    font-size: 13px;
    color: var(--gray-500);
}

.search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
    max-width: 300px;
}

.search-icon {
    position: absolute;
    left: .75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-400);
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: .5rem .75rem .5rem 2.125rem;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--gray-800);
    outline: none;
    font-family: inherit;
    background: #fff;
}

.search-input:focus {
    border-color: var(--primary);
}

.btn-primary-sm {
    display: flex;
    align-items: center;
    gap: .375rem;
    padding: .5rem .875rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
}

.btn-primary-sm:hover {
    background: var(--primary-dark);
}

/* User list */
.users-list {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.user-card {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: .875rem 1.125rem;
    display: flex;
    align-items: center;
    gap: .875rem;
    transition: border-color .15s;
}

.user-card:hover {
    border-color: var(--gray-300);
}

.user-card__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.user-card__avatar--active {
    background: var(--primary-light);
    color: var(--primary);
}

.user-card__avatar--inactive {
    background: var(--gray-100);
    color: var(--gray-400);
}

.user-card__body {
    flex: 1;
    min-width: 0;
}

.user-card__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-900);
    margin: 0;
}

.user-card__email {
    font-size: 12px;
    color: var(--gray-400);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-card__right {
    display: flex;
    align-items: center;
    gap: .75rem;
    flex-shrink: 0;
}

.role-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    text-transform: capitalize;
}

.role-badge--employee {
    background: var(--gray-100);
    color: var(--gray-600);
}

.role-badge--company_admin {
    background: var(--info-light);
    color: var(--info);
}

.user-card__actions {
    display: flex;
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

/* Menu grid */
.menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
}

.menu-card {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.menu-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: .5rem;
}

.menu-card__name {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.menu-card__cat {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0;
}

.menu-card__price {
    font-size: 16px;
    font-weight: 800;
    color: var(--primary);
    flex-shrink: 0;
}

.menu-card__desc {
    font-size: 12px;
    color: var(--gray-400);
    margin: 0;
    line-height: 1.4;
}

.menu-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: .5rem;
    border-top: 1px solid var(--gray-100);
}

.avail-toggle {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 99px;
    border: none;
    cursor: pointer;
    font-family: inherit;
}

.avail-toggle--on {
    background: var(--success-light);
    color: var(--success);
}

.avail-toggle--off {
    background: var(--gray-100);
    color: var(--gray-500);
}

.menu-card__actions {
    display: flex;
    gap: .25rem;
}

/* Teams */
.teams-list {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.team-card {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: .875rem;
}

.team-card__icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.team-card__body {
    flex: 1;
    min-width: 0;
}

.team-card__name {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
}

.team-card__desc {
    font-size: 12px;
    color: var(--gray-400);
    margin: 0;
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
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
}

.modal-box__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--gray-100);
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
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
    position: sticky;
    bottom: 0;
    background: #fff;
}

.form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .875rem;
}

@media (max-width: 480px) {
    .form-row-2 {
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

.form-textarea {
    resize: vertical;
    min-height: 72px;
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