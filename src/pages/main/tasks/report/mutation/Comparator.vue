<template>
    <q-btn-toggle
        v-model="model"
        size="sm"
        padding="sm"
        toggle-color="primary"
        :options="[
                  {label: '>', value: '>'},
                  {label: '<', value: '<'},
                  {label: '=', value: '='}
                ]"
    />
</template>

<script setup>
import { ref } from 'vue'
const model = ref('>')
</script>
