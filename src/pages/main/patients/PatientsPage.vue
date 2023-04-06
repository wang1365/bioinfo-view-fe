<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('PatientPageListTitle')" />
        <PatientsList />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import PatientsList from "./PatientsList.vue";
</script>
