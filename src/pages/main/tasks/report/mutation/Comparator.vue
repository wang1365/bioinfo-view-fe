<template>
    <q-btn-toggle
        v-model="model"
        toggle-color="primary"
        dense
        :options="[
            { label: '>', value: '>' },
            { label: '<', value: '<' },
            { label: '=', value: '=' }
        ]"
    />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: '>',
    },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
    get: () => props.modelValue || '>',
    set: (val) => emit('update:modelValue', val),
})
</script>
