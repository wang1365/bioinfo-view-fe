<template>
    <div class="text-h5 q-py-xs">{{ props.title }}</div>
    <q-separator />
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    title: String,
});
</script>
