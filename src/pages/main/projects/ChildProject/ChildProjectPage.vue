<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="项目详情" />
        <ChildProjectDetail />
        <ChildProjectSamples />
        <ChildProjectList />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ChildProjectDetail from "./ChildProjectDetail.vue";
import ChildProjectList from "./ChildProjectList.vue";
import ChildProjectSamples from "./ChildProjectSamples.vue";
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
