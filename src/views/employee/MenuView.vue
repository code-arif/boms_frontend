<template>
  <div class="pb-5 mb-4 px-3 pt-3">
    <!-- Session banner -->
    <div v-if="orderStore.activeSession" class="alert alert-success rounded-3 d-flex align-items-center gap-2 mb-3">
      <span>📅</span>
      <span class="small fw-medium">{{ orderStore.activeSession.title }} — ordering open!</span>
    </div>
    <div v-else class="alert alert-warning rounded-3 small mb-3">
      ⚠️ No active session right now. Check back soon.
    </div>

    <h5 class="fw-semibold mb-3">Today's Menu</h5>

    <!-- Skeleton while loading -->
    <SkeletonLoader v-if="orderStore.loading" :count="6" :height="72" />

    <!-- Menu items grouped by category -->
    <template v-else>
      <div v-for="(items, category) in groupedMenu" :key="category" class="mb-4">
        <p class="text-muted small fw-medium text-uppercase mb-2 ps-1">{{ category }}</p>
        <div class="list-group list-group-flush rounded-3 shadow-sm overflow-hidden">
          <button
            v-for="item in items"
            :key="item.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
            :class="{ 'opacity-50': !item.is_available }"
            :disabled="!item.is_available || !orderStore.activeSession"
            @click="addToCart(item)"
          >
            <div>
              <div class="fw-medium">{{ item.name }}</div>
              <div v-if="item.description" class="small text-muted">{{ item.description }}</div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="badge bg-light text-dark border">৳{{ item.price }}</span>
              <span v-if="cartCount(item.id)" class="badge bg-primary rounded-pill">
                {{ cartCount(item.id) }}
              </span>
              <span v-if="!item.is_available" class="small text-danger">Unavailable</span>
            </div>
          </button>
        </div>
      </div>
    </template>

    <!-- Floating cart button -->
    <Transition name="slide-up">
      <div v-if="cart.length" class="position-fixed bottom-cart w-100 px-3">
        <button class="btn btn-primary w-100 rounded-3 py-3 shadow-lg fw-medium" @click="openCartModal">
          🛒 View order ({{ totalItems }} items) — ৳{{ totalPrice }}
        </button>
      </div>
    </Transition>

    <!-- Cart modal -->
    <div class="modal fade" ref="cartModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content rounded-4 border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-semibold">Your Order</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" />
          </div>
          <div class="modal-body">
            <div v-for="(item, idx) in cart" :key="idx" class="d-flex align-items-center gap-3 mb-3">
              <div class="flex-grow-1">
                <div class="fw-medium small">{{ item.name }}</div>
                <div class="text-muted small">৳{{ item.price }} × {{ item.quantity }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary rounded-circle" @click="decrement(item)">−</button>
                <span class="fw-medium">{{ item.quantity }}</span>
                <button class="btn btn-sm btn-outline-primary rounded-circle"   @click="increment(item)">+</button>
              </div>
              <span class="fw-semibold small">৳{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>

            <div class="mb-3">
              <label class="form-label small">Special notes</label>
              <textarea v-model="notes" class="form-control rounded-3" rows="2" placeholder="e.g. No chilli…" />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <div class="w-100 d-flex justify-content-between align-items-center mb-3 px-1">
              <span class="text-muted">Total</span>
              <span class="fw-semibold fs-5">৳{{ totalPrice }}</span>
            </div>
            <button class="btn btn-primary w-100 rounded-3 py-2 fw-medium" :disabled="submitting" @click="submitOrder">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2" />
              {{ submitting ? 'Placing order…' : 'Place order' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal }         from 'bootstrap'
import { useOrderStore } from '@/stores/order'
import { useToast }      from '@/composables/useToast'
import SkeletonLoader    from '@/components/ui/SkeletonLoader.vue'

const orderStore = useOrderStore()
const toast      = useToast()

const cart       = ref([])
const notes      = ref('')
const submitting = ref(false)
const cartModal  = ref(null)
let   bsModal    = null

onMounted(async () => {
  await Promise.all([orderStore.fetchActiveSession(), orderStore.fetchMenu()])
  bsModal = new Modal(cartModal.value)
})

const groupedMenu = computed(() => {
  return orderStore.menuItems.reduce((acc, item) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
})

const totalItems = computed(() => cart.value.reduce((s, i) => s + i.quantity, 0))
const totalPrice = computed(() => cart.value.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2))
const cartCount  = id => cart.value.find(i => i.id === id)?.quantity || 0

function addToCart(item) {
  const existing = cart.value.find(i => i.id === item.id)
  if (existing) existing.quantity++
  else cart.value.push({ ...item, quantity: 1 })
}

function increment(item) { item.quantity++ }
function decrement(item) {
  if (item.quantity > 1) item.quantity--
  else cart.value = cart.value.filter(i => i.id !== item.id)
}

function openCartModal() { bsModal.show() }

async function submitOrder() {
  if (!orderStore.activeSession) return toast.error('No active session.')
  submitting.value = true
  try {
    await orderStore.placeOrder({
      order_session_id: orderStore.activeSession.id,
      notes: notes.value,
      items: cart.value.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
    })
    toast.success('Order placed! Bon appétit 🍳')
    cart.value = []
    notes.value = ''
    bsModal.hide()
  } catch (_) {
    // error handled by useApi
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.bottom-cart { bottom: 74px; left: 0; z-index: 900; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform .25s, opacity .25s; }
.slide-up-enter-from, .slide-up-leave-to       { transform: translateY(20px); opacity: 0; }
</style>