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
        default: 'default',
    },
})

const attrs = useAttrs()

const buttonClasses = computed(() => [
    'app-action-btn',
    props.variant !== 'default' ? `app-action-btn--${props.variant}` : '',
])
</script>
