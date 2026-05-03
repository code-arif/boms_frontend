import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useOrderStore = defineStore('order', () => {
  const activeSession = ref(null)
  const myOrders      = ref([])
  const menuItems     = ref([])
  const loading       = ref(false)

  async function fetchActiveSession() {
    loading.value = true
    try {
      const { data } = await api.get('/order-sessions/active')
      activeSession.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchMenu() {
    const { data } = await api.get('/menu-items')
    menuItems.value = data.data.data ?? data.data
  }

  async function fetchMyOrders() {
    loading.value = true
    try {
      const { data } = await api.get('/orders/my')
      myOrders.value = data.data.data ?? data.data
    } finally {
      loading.value = false
    }
  }

  async function placeOrder(payload) {
    const { data } = await api.post('/orders', payload)
    return data.data
  }

  async function cancelOrder(id) {
    await api.patch(`/orders/${id}/cancel`)
    await fetchMyOrders()
  }

  return { activeSession, myOrders, menuItems, loading,
           fetchActiveSession, fetchMenu, fetchMyOrders, placeOrder, cancelOrder }
})