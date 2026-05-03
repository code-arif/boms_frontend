import { useToast as _useToast } from 'vue-toastification'

export function useToast() {
  const toast = _useToast()

  return {
    success: msg => toast.success(msg, { timeout: 3000 }),
    error:   msg => toast.error(msg,   { timeout: 4000 }),
    info:    msg => toast.info(msg,    { timeout: 3000 }),
    warning: msg => toast.warning(msg, { timeout: 4000 }),
  }
}