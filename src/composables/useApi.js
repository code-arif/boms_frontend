import { ref } from "vue";
import api from "@/api";
import { useToast } from "@/composables/useToast";

export function useApi() {
  const loading = ref(false);
  const error = ref(null);
  const toast = useToast();

  async function request(method, url, payload = null, options = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api[method](url, payload);
      if (options.successMessage) toast.success(options.successMessage);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      error.value = msg;
      if (!options.silent) toast.error(msg);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  const get = (url, opts) => request("get", url, null, opts);
  const post = (url, data, opts) => request("post", url, data, opts);
  const put = (url, data, opts) => request("put", url, data, opts);
  const patch = (url, data, opts) => request("patch", url, data, opts);
  const del = (url, opts) => request("delete", url, null, opts);

  return { loading, error, get, post, put, patch, del };
}
