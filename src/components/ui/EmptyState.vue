<template>
    <div class="empty-state" :class="compact ? 'empty-state--compact' : ''">
        <div class="empty-state__icon">
            <slot name="icon">{{ icon }}</slot>
        </div>
        <h6 class="empty-state__title">{{ title }}</h6>
        <p v-if="description" class="empty-state__desc">{{ description }}</p>
        <slot />
    </div>
</template>

<script setup>
defineProps({
    icon: { type: String, default: '📭' },
    title: { type: String, default: 'Nothing here yet' },
    description: { type: String, default: '' },
    compact: { type: Boolean, default: false },
})
</script>

<style scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    gap: .5rem;
}

.empty-state--compact {
    padding: 1.5rem 1rem;
}

.empty-state__icon {
    font-size: 2.5rem;
    margin-bottom: .25rem;
}

.empty-state__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--gray-700);
    margin: 0;
}

.empty-state__desc {
    font-size: 13px;
    color: var(--gray-400);
    margin: 0;
    max-width: 260px;
    line-height: 1.5;
}
</style>