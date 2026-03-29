<template>
    <q-btn
        v-bind="attrs"
        :class="buttonClasses"
        dense
        flat
        no-caps
    >
        <slot />
    </q-btn>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
    },
})

const attrs = useAttrs()

const buttonClasses = computed(() => [
    'table-operation-btn',
    `table-operation-btn--${props.variant}`,
])
</script>
