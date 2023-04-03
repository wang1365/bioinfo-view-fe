<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>数据详情</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-card-section>
            <q-list>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">数据详情: {{ form.project_index }}</div>
                        <div class="col q-pa-sm">文库编号: {{ form.library_number }}</div>
                        <div class="col q-pa-sm">捕获试剂盒: {{ form.reagent_box }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">建库input(ng): {{ form.library_input }}</div>
                        <div class="col q-pa-sm">index类型: {{ form.index_type }}</div>
                        <div class="col q-pa-sm">index编号: {{ form.index_number }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">杂交input(ng): {{ form.hybrid_input }}</div>
                        <div class="col q-pa-sm">核酸打断方式: {{ form.nucleic_break_type }}</div>
                        <div class="col q-pa-sm">样本元信息ID: {{ form.sample_meta_id }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">样本识别号: {{ form.sample_identifier }}</div>
                        <div class="col q-pa-sm">数据识别号: {{ form.identifier }}</div>
                        <div class="col q-pa-sm">送检机构: {{ form.company }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">风险上机: {{ form.risk ? "是" : "否" }}</div>
                        <div class="col q-pa-sm">核酸类型: {{ form.nucleic_type }}</div>
                        <div class="col q-pa-sm">核酸降解等级: {{ form.nucleic_level }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">R1文件: {{ form.fastq1_path }}</div>
                        <div class="col q-pa-sm">R2文件: {{ form.fastq2_path }}</div>
                    </div>
                </q-item>
            </q-list>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-list>
                <q-item>
                    <q-section class="q-gutter-x-sm">
                        <q-btn :label="$t('Close')" v-close-popup />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
    </q-card>
</template>
<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useApi } from "src/api/apiBase";

const { apiGet } = useApi();
const emit = defineEmits(["refresh"]);

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});

const form = ref({
    project_index: "project_index",
    library_number: "library_number",
    reagent_box: "reagent_box",
    nucleic_break_type: "nucleic_break_type",
    library_input: "library_input",
    index_type: "index_type",
    index_number: "index_number",
    hybrid_input: "hybrid_input",
    risk: true,
    nucleic_level: "A",
    sample_meta_id: "sample_meta_id",
    sample_identifier: "sample_identifier",
    identifier: "identifier",
    company: "company",
    nucleic_type: "gDNA",
    fastq1_path: "fastq1_path",
    fastq2_path: "fastq2_path",
});
onMounted(() => {
    apiGet(`/sample/samples/${props.id}/`, (res) => {
        console.log(res);
        form.value = res.data;
    });
});
</script>
