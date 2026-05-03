import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";

export const useOrderStore = defineStore("order", () => {
  const activeSession = ref(null);
  const sessions = ref([]);
  const sessionsMeta = ref({});
  const myOrders = ref([]);
  const myOrdersMeta = ref({});
  const sessionOrders = ref([]);
  const sessionOrdersMeta = ref({});
  const menuItems = ref([]);
  const menuMeta = ref({});
  const loading = ref(false);
  const sessionLoading = ref(false);

  const menuByCategory = computed(() => {
    return menuItems.value.reduce((acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  });

  const openSession = computed(
    () => sessions.value.find((s) => s.status === "open") || null,
  );

  // ── Session actions ───────────────────────────────────────
  async function fetchSessions(page = 1) {
    sessionLoading.value = true;
    try {
      const { data } = await api.get("/order-sessions", { params: { page } });
      sessions.value = data.data.data ?? data.data;
      sessionsMeta.value = data.data;
    } finally {
      sessionLoading.value = false;
    }
  }

  async function fetchActiveSession() {
    loading.value = true;
    try {
      const { data } = await api.get("/order-sessions/active");
      activeSession.value = data.data;
    } catch (_) {
      activeSession.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function openOrderSession(payload) {
    const { data } = await api.post("/order-sessions", payload);
    await fetchSessions();
    return data.data;
  }

  async function closeOrderSession(id) {
    const { data } = await api.patch(`/order-sessions/${id}/close`);
    await fetchSessions();
    return data.data;
  }

  async function fetchSessionOrders(sessionId, page = 1) {
    loading.value = true;
    try {
      const { data } = await api.get(`/order-sessions/${sessionId}/orders`, {
        params: { page },
      });
      sessionOrders.value = data.data.data ?? data.data;
      sessionOrdersMeta.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  // ── Menu actions ──────────────────────────────────────────
  async function fetchMenu(page = 1) {
    loading.value = true;
    try {
      const { data } = await api.get("/menu-items", { params: { page } });
      menuItems.value = data.data.data ?? data.data;
      menuMeta.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  async function createMenuItem(payload) {
    const { data } = await api.post("/menu-items", payload);
    menuItems.value.unshift(data.data);
    return data.data;
  }

  async function updateMenuItem(id, payload) {
    const { data } = await api.put(`/menu-items/${id}`, payload);
    const idx = menuItems.value.findIndex((m) => m.id === id);
    if (idx !== -1) menuItems.value[idx] = data.data;
    return data.data;
  }

  async function deleteMenuItem(id) {
    await api.delete(`/menu-items/${id}`);
    menuItems.value = menuItems.value.filter((m) => m.id !== id);
  }

  async function toggleMenuItemAvailability(id) {
    const { data } = await api.patch(`/menu-items/${id}/toggle-availability`);
    const idx = menuItems.value.findIndex((m) => m.id === id);
    if (idx !== -1) menuItems.value[idx] = data.data;
    return data.data;
  }

  // ── Order actions ─────────────────────────────────────────
  async function fetchMyOrders(page = 1) {
    loading.value = true;
    try {
      const { data } = await api.get("/orders/my", { params: { page } });
      myOrders.value = data.data.data ?? data.data;
      myOrdersMeta.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  async function placeOrder(payload) {
    const { data } = await api.post("/orders", payload);
    return data.data;
  }

  async function updateOrderStatus(orderId, status) {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status });
    const idx = sessionOrders.value.findIndex((o) => o.id === orderId);
    if (idx !== -1) sessionOrders.value[idx] = data.data;
    return data.data;
  }

  async function cancelMyOrder(orderId) {
    const { data } = await api.patch(`/orders/${orderId}/cancel`);
    const idx = myOrders.value.findIndex((o) => o.id === orderId);
    if (idx !== -1) myOrders.value[idx] = data.data;
    return data.data;
  }

  return {
    activeSession,
    sessions,
    sessionsMeta,
    myOrders,
    myOrdersMeta,
    sessionOrders,
    sessionOrdersMeta,
    menuItems,
    menuMeta,
    menuByCategory,
    loading,
    sessionLoading,
    openSession,
    fetchSessions,
    fetchActiveSession,
    openOrderSession,
    closeOrderSession,
    fetchSessionOrders,
    fetchMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    fetchMyOrders,
    placeOrder,
    updateOrderStatus,
    cancelMyOrder,
  };
});
