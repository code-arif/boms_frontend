<template>
    <div class="toast-msg" :class="`toast-msg--${type}`">
        <span class="toast-msg__icon">{{ icons[type] }}</span>
        <span class="toast-msg__text">{{ message }}</span>
    </div>
</template>

<script setup>
defineProps({
    message: { type: String, required: true },
    type: { type: String, default: 'info' }, // success | error | warning | info
})

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
</script>

<style scoped>
.toast-msg {
    display: flex;
    align-items: center;
    gap: .625rem;
    font-size: 14px;
    font-weight: 500;
}

.toast-msg__icon {
    font-size: 16px;
    flex-shrink: 0;
}

.toast-msg__text {
    line-height: 1.4;
}
</style>