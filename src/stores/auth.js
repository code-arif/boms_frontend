import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('boms_token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('boms_user') || 'null'))

  const isLoggedIn     = computed(() => !!token.value)
  const isSuperAdmin   = computed(() => user.value?.role === 'super_admin')
  const isCompanyAdmin = computed(() => user.value?.role === 'company_admin')
  const isEmployee     = computed(() => user.value?.role === 'employee')

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    token.value = data.data.token
    user.value  = data.data.user
    localStorage.setItem('boms_token', token.value)
    localStorage.setItem('boms_user',  JSON.stringify(user.value))
    return data.data.user
  }

  async function logout() {
    try { await api.post('/auth/logout') } catch (_) {}
    token.value = null
    user.value  = null
    localStorage.removeItem('boms_token')
    localStorage.removeItem('boms_user')
  }

  async function fetchMe() {
    const { data } = await api.get('/auth/me')
    user.value = data.data.user
    localStorage.setItem('boms_user', JSON.stringify(user.value))
    return user.value
  }

  return { token, user, isLoggedIn, isSuperAdmin, isCompanyAdmin, isEmployee, login, logout, fetchMe }
})