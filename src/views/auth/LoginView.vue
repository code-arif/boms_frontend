<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
    <div class="card shadow-sm border-0 rounded-4 w-100" style="max-width:420px">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="fs-1">🍳</div>
          <h1 class="h4 fw-semibold mt-2 mb-1">BOMS</h1>
          <p class="text-muted small">Breakfast Order Management</p>
        </div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="mb-3">
            <label class="form-label small fw-medium">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-control rounded-3"
              :class="{ 'is-invalid': errors.email }"
              placeholder="you@company.com"
              autocomplete="email"
            />
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-medium">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-control rounded-3"
              :class="{ 'is-invalid': errors.password }"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <div class="invalid-feedback">{{ errors.password }}</div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 rounded-3 py-2 fw-medium"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" />
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter }     from 'vue-router'
import { useAuthStore }  from '@/stores/auth'
import { useToast }      from '@/composables/useToast'

const auth    = useAuthStore()
const router  = useRouter()
const toast   = useToast()
const loading = ref(false)

const form   = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email    = form.email    ? '' : 'Email is required.'
  errors.password = form.password ? '' : 'Password is required.'
  return !errors.email && !errors.password
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  try {
    const user = await auth.login(form.email, form.password)
    toast.success(`Welcome back, ${user.name}!`)
    const home = user.role === 'super_admin'   ? '/super'
               : user.role === 'company_admin' ? '/admin'
               : '/'
    router.push(home)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed.')
  } finally {
    loading.value = false
  }
}
</script>