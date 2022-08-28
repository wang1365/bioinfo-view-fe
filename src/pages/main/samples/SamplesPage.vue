<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="样本管理" />
        <SamplesList />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import SamplesList from "./SamplesList.vue";
</script>
