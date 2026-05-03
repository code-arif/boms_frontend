import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore }                   from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },

  // Employee routes
  {
    path: '/',
    component: () => import('@/layouts/EmployeeLayout.vue'),
    meta: { requiresAuth: true, role: 'employee' },
    children: [
      { path: '',        redirect: '/menu' },
      { path: 'menu',    component: () => import('@/views/employee/MenuView.vue') },
      { path: 'order',   component: () => import('@/views/employee/OrderView.vue') },
      { path: 'history', component: () => import('@/views/employee/HistoryView.vue') },
    ],
  },

  // Company Admin routes
  {
    path: '/admin',
    component: () => import('@/layouts/CompanyAdminLayout.vue'),
    meta: { requiresAuth: true, role: 'company_admin' },
    children: [
      { path: '',         component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'sessions', component: () => import('@/views/admin/OrderSessionView.vue') },
      { path: 'users',    component: () => import('@/views/admin/UsersView.vue') },
    ],
  },

  // Super Admin routes
  {
    path: '/super',
    component: () => import('@/layouts/SuperAdminLayout.vue'),
    meta: { requiresAuth: true, role: 'super_admin' },
    children: [
      { path: '',          component: () => import('@/views/super-admin/DashboardView.vue') },
      { path: 'companies', component: () => import('@/views/super-admin/CompaniesView.vue') },
      { path: 'audit',     component: () => import('@/views/super-admin/AuditLogsView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, _, next) => {
  const auth = useAuthStore()

  if (to.meta.guest) {
    return auth.isLoggedIn ? next(roleHome(auth.user.role)) : next()
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    // Super admin can visit any route
    if (auth.isSuperAdmin) return next()
    return next(roleHome(auth.user?.role))
  }

  next()
})

function roleHome(role) {
  return role === 'super_admin'   ? '/super'
       : role === 'company_admin' ? '/admin'
       : '/'
}

export default router