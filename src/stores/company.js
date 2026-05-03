import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api";

export const useCompanyStore = defineStore("company", () => {
  const companies = ref([]);
  const companiesMeta = ref({});
  const currentCompany = ref(null);
  const users = ref([]);
  const usersMeta = ref({});
  const teams = ref([]);
  const payments = ref([]);
  const paymentsMeta = ref({});
  const analytics = ref(null);
  const overview = ref(null);
  const auditLogs = ref([]);
  const auditMeta = ref({});
  const loading = ref(false);

  // ── Companies (Super Admin) ───────────────────────────────
  async function fetchCompanies(page = 1) {
    loading.value = true;
    try {
      const { data } = await api.get("/admin/companies", { params: { page } });
      companies.value = data.data.data ?? data.data;
      companiesMeta.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCompany(id) {
    const { data } = await api.get(`/admin/companies/${id}`);
    currentCompany.value = data.data;
    return data.data;
  }

  async function createCompany(payload) {
    const { data } = await api.post("/admin/companies", payload);
    companies.value.unshift(data.data.company);
    return data.data;
  }

  async function updateCompany(id, payload) {
    const { data } = await api.put(`/admin/companies/${id}`, payload);
    const idx = companies.value.findIndex((c) => c.id === id);
    if (idx !== -1) companies.value[idx] = data.data;
    return data.data;
  }

  async function deleteCompany(id) {
    await api.delete(`/admin/companies/${id}`);
    companies.value = companies.value.filter((c) => c.id !== id);
  }

  async function toggleCompanyStatus(id) {
    const { data } = await api.patch(`/admin/companies/${id}/toggle-status`);
    const idx = companies.value.findIndex((c) => c.id === id);
    if (idx !== -1) companies.value[idx] = data.data;
    return data.data;
  }

  // ── Users (Company Admin & Super Admin) ───────────────────
  async function fetchUsers(page = 1) {
    loading.value = true;
    try {
      const { data } = await api.get("/users", { params: { page } });
      users.value = data.data.data ?? data.data;
      usersMeta.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  async function createUser(payload) {
    const { data } = await api.post("/users", payload);
    users.value.unshift(data.data);
    return data.data;
  }

  async function updateUser(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    const idx = users.value.findIndex((u) => u.id === id);
    if (idx !== -1) users.value[idx] = data.data;
    return data.data;
  }

  async function deleteUser(id) {
    await api.delete(`/users/${id}`);
    users.value = users.value.filter((u) => u.id !== id);
  }

  async function toggleUserActive(id) {
    const { data } = await api.patch(`/users/${id}/toggle-active`);
    const idx = users.value.findIndex((u) => u.id === id);
    if (idx !== -1) users.value[idx] = data.data;
    return data.data;
  }

  // ── Teams ─────────────────────────────────────────────────
  async function fetchTeams() {
    const { data } = await api.get("/teams");
    teams.value = data.data.data ?? data.data;
    return teams.value;
  }

  async function createTeam(payload) {
    const { data } = await api.post("/teams", payload);
    teams.value.unshift(data.data);
    return data.data;
  }

  async function deleteTeam(id) {
    await api.delete(`/teams/${id}`);
    teams.value = teams.value.filter((t) => t.id !== id);
  }

  // ── Payments ──────────────────────────────────────────────
  async function fetchPaymentHistory(page = 1) {
    loading.value = true;
    try {
      const { data } = await api.get("/payments/history", { params: { page } });
      payments.value = data.data.data ?? data.data;
      paymentsMeta.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  async function recordPayment(payload) {
    const { data } = await api.post("/payments", payload);
    return data.data;
  }

  async function bulkPay(sessionId, method) {
    const { data } = await api.post(`/order-sessions/${sessionId}/bulk-pay`, {
      method,
    });
    return data.data;
  }

  async function refundPayment(id, reason) {
    const { data } = await api.patch(`/payments/${id}/refund`, { reason });
    return data.data;
  }

  async function fetchSessionSummary(sessionId) {
    const { data } = await api.get(`/order-sessions/${sessionId}/summary`);
    return data.data;
  }

  // ── Super Admin analytics ─────────────────────────────────
  async function fetchOverview() {
    loading.value = true;
    try {
      const { data } = await api.get("/admin/overview");
      overview.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAnalytics(sortBy = "revenue") {
    const { data } = await api.get("/admin/analytics/companies", {
      params: { sort_by: sortBy },
    });
    analytics.value = data.data;
    return data.data;
  }

  async function fetchRevenueTrend(days = 30) {
    const { data } = await api.get("/admin/analytics/revenue-trend", {
      params: { days },
    });
    return data.data;
  }

  // ── Audit logs ────────────────────────────────────────────
  async function fetchAuditLogs(filters = {}, page = 1) {
    loading.value = true;
    try {
      const { data } = await api.get("/admin/audit-logs", {
        params: { ...filters, page },
      });
      auditLogs.value = data.data.data ?? data.data;
      auditMeta.value = data.data;
    } finally {
      loading.value = false;
    }
  }

  return {
    companies,
    companiesMeta,
    currentCompany,
    users,
    usersMeta,
    teams,
    payments,
    paymentsMeta,
    analytics,
    overview,
    auditLogs,
    auditMeta,
    loading,
    fetchCompanies,
    fetchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    toggleCompanyStatus,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    fetchTeams,
    createTeam,
    deleteTeam,
    fetchPaymentHistory,
    recordPayment,
    bulkPay,
    refundPayment,
    fetchSessionSummary,
    fetchOverview,
    fetchAnalytics,
    fetchRevenueTrend,
    fetchAuditLogs,
  };
});
