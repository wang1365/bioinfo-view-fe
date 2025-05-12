<template>
    <div class="text-h5 q-py-xs">{{ props.title }}</div>
    <q-separator />
</template>

<script setup>

const props = defineProps({
    title: String,
});
</script>
