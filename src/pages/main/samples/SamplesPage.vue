<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('SampleListPageTitle')" />
        <SamplesList />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import SamplesList from "./SamplesList.vue";
</script>
