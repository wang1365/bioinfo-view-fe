<template>
    <p class="text-h5">{{ props.title }}</p>
    <q-separator />
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    title: String,
});
</script>
