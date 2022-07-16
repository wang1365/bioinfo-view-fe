<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="样本管理" />
        <div class="col-12">
        <p-toolbar>{{$q.version}}</p-toolbar>
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
</script>
