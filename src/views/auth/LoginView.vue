<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Brand -->
      <div class="login-brand">
        <div class="login-brand__icon">🍳</div>
        <h1 class="login-brand__name">BOMS</h1>
        <p class="login-brand__tagline">Breakfast Order Management System</p>
      </div>

      <!-- Form -->
      <form class="login-form" @submit.prevent="handleLogin" novalidate>
        <div class="login-form__group">
          <label class="login-label">Email address</label>
          <input v-model="form.email" type="email" class="login-input" :class="{ 'login-input--error': errors.email }"
            placeholder="you@company.com" autocomplete="email" :disabled="loading" />
          <p v-if="errors.email" class="login-error">{{ errors.email }}</p>
        </div>

        <div class="login-form__group">
          <label class="login-label">Password</label>
          <div class="login-input-wrap">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
              class="login-input login-input--password" :class="{ 'login-input--error': errors.password }"
              placeholder="••••••••" autocomplete="current-password" :disabled="loading" />
            <button type="button" class="login-eye" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"
                viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"
                viewBox="0 0 24 24">
                <path
                  d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="login-error">{{ errors.password }}</p>
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="login-spinner" />
          <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="login-footer">
        Enterprise Breakfast Order Management &copy; {{ year }}
      </p>
    </div>

    <!-- Decorative background -->
    <div class="login-bg">
      <div class="login-bg__circle login-bg__circle--1" />
      <div class="login-bg__circle login-bg__circle--2" />
      <div class="login-bg__circle login-bg__circle--3" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const showPassword = ref(false)
const year = computed(() => new Date().getFullYear())

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!form.email) {
    errors.email = 'Email is required.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  try {
    const user = await auth.login(form.email, form.password)
    toast.success(`Welcome back, ${user.name}! 👋`)
    router.push(auth.roleHome())
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed. Please try again.'
    toast.error(msg)
    errors.email = ' '
    errors.password = msg
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--gray-50);
  position: relative;
  overflow: hidden;
}

.login-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 1;
}

.login-brand {
  text-align: center;
  margin-bottom: 2rem;
}

.login-brand__icon {
  font-size: 2.5rem;
  margin-bottom: .5rem;
  display: block;
}

.login-brand__name {
  font-size: 24px;
  font-weight: 800;
  color: var(--gray-900);
  margin: 0 0 .25rem;
  letter-spacing: -.04em;
}

.login-brand__tagline {
  font-size: 13px;
  color: var(--gray-400);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.login-form__group {
  display: flex;
  flex-direction: column;
  gap: .375rem;
}

.login-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
}

.login-input-wrap {
  position: relative;
}

.login-input {
  width: 100%;
  padding: .75rem 1rem;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: 15px;
  color: var(--gray-900);
  background: #fff;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  font-family: inherit;
}

.login-input--password {
  padding-right: 2.75rem;
}

.login-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
}

.login-input--error {
  border-color: var(--danger);
}

.login-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .1);
}

.login-input:disabled {
  background: var(--gray-50);
  color: var(--gray-400);
}

.login-eye {
  position: absolute;
  right: .875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.login-eye:hover {
  color: var(--gray-600);
}

.login-error {
  font-size: 12px;
  color: var(--danger);
  margin: 0;
}

.login-btn {
  margin-top: .375rem;
  width: 100%;
  padding: .875rem 1rem;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  transition: background .15s, transform .1s;
  font-family: inherit;
}

.login-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.login-btn:active:not(:disabled) {
  transform: scale(.98);
}

.login-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.login-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  margin-bottom: 0;
  font-size: 12px;
  color: var(--gray-300);
}

/* Background decoration */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.login-bg__circle {
  position: absolute;
  border-radius: 50%;
  opacity: .06;
  background: var(--primary);
}

.login-bg__circle--1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
}

.login-bg__circle--2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  left: -80px;
  background: #06B6D4;
}

.login-bg__circle--3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #8B5CF6;
  opacity: .04;
}
</style>