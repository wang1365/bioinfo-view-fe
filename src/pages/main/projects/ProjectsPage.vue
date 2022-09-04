<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="项目管理" />
        <ProjectsList />
        <ProjectsSamples />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ProjectsList from "./ProjectsList.vue";
import ProjectsSamples from "./ProjectsSamples.vue";
</script>

<style lang="scss">
table {
    width: 100%;
    border-collapse: collapse;
    td {
        padding: 5px;
        border-bottom: silver 1px solid;
    }
    tbody {
        tr {
            // &:nth-child(odd) {
            //     td {
            //         background-color: rgba(0, 0, 0, 0.05);
            //     }
            // }
            // &:nth-child(even) {
            //     td {
            //         background-color: rgba(0, 0, 0, 0.08);
            //     }
            // }
        }

        tr {
            border-bottom: solid silver 1px;
            &:hover {
                td {
                    background-color: rgba(0, 0, 0, 0.15);
                }
            }
        }
    }
}
</style>
