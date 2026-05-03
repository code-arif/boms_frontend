import { useToast as _useToast } from "vue-toastification";

export function useToast() {
  const toast = _useToast();

  return {
    success: (msg, opts = {}) => toast.success(msg, { timeout: 3000, ...opts }),
    error: (msg, opts = {}) => toast.error(msg, { timeout: 4500, ...opts }),
    info: (msg, opts = {}) => toast.info(msg, { timeout: 3000, ...opts }),
    warning: (msg, opts = {}) => toast.warning(msg, { timeout: 4000, ...opts }),
    clear: () => toast.clear(),
  };
}
