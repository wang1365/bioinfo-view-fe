<template>
    <q-btn
        v-bind="attrs"
        :class="buttonClasses"
        :disable="disabled"
        dense
        flat
        no-caps
        @click="$emit('click', $event)"
    >
        <div class="batch-ai-btn-inner">
            <span class="batch-ai-btn-glow" />
            <q-icon name="auto_awesome" class="batch-ai-btn-icon" />
            <span class="batch-ai-btn-label">AI解读</span>
            <q-badge v-if="count > 0" color="primary" class="batch-ai-btn-count">
                {{ count }}
            </q-badge>
        </div>
        <q-tooltip v-if="count < minCount">请至少选择 1 条记录</q-tooltip>
    </q-btn>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    count: {
        type: Number,
        default: 0,
    },
    minCount: {
        type: Number,
        default: 1,
    },
})

defineEmits(['click'])

const attrs = useAttrs()

const disabled = computed(() => props.count < props.minCount)

const buttonClasses = computed(() => [
    'app-action-btn',
    'batch-ai-btn',
    disabled.value ? 'batch-ai-btn--disabled' : '',
])
</script>

<style scoped>
.batch-ai-btn {
    position: relative;
    overflow: hidden;
    margin-left: 8px;
}

.batch-ai-btn--disabled {
    opacity: 0.5;
}

.batch-ai-btn--disabled .batch-ai-btn-glow {
    animation: none;
}

.batch-ai-btn--disabled .batch-ai-btn-icon {
    animation: none;
}

.batch-ai-btn-inner {
    display: flex;
    align-items: center;
    column-gap: 6px;
    position: relative;
    z-index: 1;
}

.batch-ai-btn-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        120deg,
        transparent 30%,
        rgba(36, 94, 168, 0.12) 50%,
        transparent 70%
    );
    background-size: 200% 100%;
    animation: ai-shimmer 3s ease-in-out infinite;
    border-radius: inherit;
    pointer-events: none;
}

.batch-ai-btn-icon {
    font-size: 16px;
    animation: ai-pulse 2.5s ease-in-out infinite;
}

.batch-ai-btn-label {
    font-size: 13px;
    font-weight: 600;
}

.batch-ai-btn-count {
    font-size: 10px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    line-height: 16px;
}

.batch-ai-btn:hover .batch-ai-btn-icon {
    animation: ai-spin 0.6s ease-in-out;
}

.batch-ai-btn:hover .batch-ai-btn-glow {
    animation: ai-shimmer-fast 1s ease-in-out infinite;
}

@keyframes ai-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes ai-shimmer-fast {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes ai-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
}

@keyframes ai-spin {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(15deg); }
    75% { transform: rotate(-15deg); }
    100% { transform: rotate(0deg); }
}
</style>
