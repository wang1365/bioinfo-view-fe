<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="项目管理" />
        <ProjectsList />
        <!-- <ProjectsSamples /> -->
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ProjectsList from "./ProjectsList.vue";
import ProjectsSamples from "./ProjectsSamples.vue";
</script>

<style lang="scss"></style>
