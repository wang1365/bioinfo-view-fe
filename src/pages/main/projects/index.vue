<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('ProjectPageIndexTitle')" />
        <ProjectsList />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ProjectsList from "./ProjectsList.vue";
</script>

<style lang="scss"></style>
