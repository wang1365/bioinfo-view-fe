<template>
    <p class="title">{{ props.title }}</p>
    <q-separator />
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    title: String,
});
</script>

<style lang="scss">
.title {
    font-size: 1.5em;
}
</style>
