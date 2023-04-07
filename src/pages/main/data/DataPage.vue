<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('DataListPageTitle')" />
        <DataList />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import DataList from "./DataList.vue";
</script>
