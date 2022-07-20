<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="文件管理" />
        <q-card class="my-card" flat bordered>
            <q-card-section style="padding: 0"> </q-card-section>
        </q-card>
        <q-table class="bg-primary" @click="test" />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
</script>
