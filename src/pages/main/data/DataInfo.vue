<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>数据详情</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
            <q-list>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            项目编码: {{ form.project_index }}
                        </div>
                        <div class="col q-pr-sm">
                            文库编号: {{ form.library_number }}
                        </div>
                        <div class="col q-pr-sm">
                            捕获试剂盒: {{ form.reagent_box }}
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            建库input: {{ form.library_input }}
                        </div>
                        <div class="col q-pf-sm">
                            index类型: {{ form.index_type }}
                        </div>
                        <div class="col q-pr-sm">
                            index编号: {{ form.index_number }}
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            杂交input: {{ form.hybrid_input }}
                        </div>
                        <div class="col q-pr-sm">
                            核酸打断方式: {{ form.nucleic_break_type }}
                        </div>
                        <div class="col q-pr-sm">
                            样本元信息ID: {{ form.sample_meta_id }}
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            样本识别号: {{ form.sample_identifier }}
                        </div>
                        <div class="col q-pr-sm">
                            数据识别号: {{ form.identifier }}
                        </div>
                        <div class="col q-pf-sm">
                            送检机构: {{ form.company }}
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            风险上机: {{ form.risk ? "是" : "否" }}
                        </div>
                        <div class="col q-pr-sm">
                            核酸类型: {{ form.nucleic_type }}
                        </div>
                        <div class="col q-pr-sm">
                            核酸降解等级: {{ form.nucleic_level }}
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            R1文件: {{ form.fastq1_path }}
                        </div>
                        <div class="col q-pf-sm">
                            R2文件: {{ form.fastq2_path }}
                        </div>
                    </div>
                </q-item>
            </q-list>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-list>
                <q-item>
                    <q-section class="q-gutter-x-sm">
                        <q-btn label="关闭" v-close-popup />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
    </q-card>
</template>
<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";

const nucleic_level_options = ref(["A", "B", "C", "D"]);
const nucleic_type_options = ref(["gDNA", "cfDNA", "RNA"]);
const { apiPost } = useApi();
const { apiGet, apiPut } = useApi();
const emit = defineEmits(["refresh"]);

const close = () => {
    emit("refresh");
};
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});

const errors = ref({
    project_index: {
        //项目编码
        message: "必填",
        error: false,
    },
    library_number: {
        //文库编号
        message: "必填",
        error: false,
    },
    reagent_box: {
        //捕获试剂盒
        message: "必填",
        error: false,
    },
    nucleic_break_type: {
        // 核酸打断方式
        message: "必填",
        error: false,
    },
    library_input: {
        //建库input
        message: "必填",
        error: false,
    },
    index_type: {
        //index类型
        message: "必填",
        error: false,
    },
    index_number: {
        // index编号
        message: "必填",
        error: false,
    },
    hybrid_input: {
        // 杂交input
        message: "必填",
        error: false,
    },
    risk: {
        // 风险上机
        message: "必填",
        error: false,
    },
    nucleic_level: {
        // 核酸降解等级
        message: "必填",
        error: false,
    },
    sample_meta_id: {
        // 样本元信息ID
        message: "必填",
        error: false,
    },
    sample_identifier: {
        // 样本识别号
        message: "必填",
        error: false,
    },
    identifier: {
        // 数据识别号
        message: "必填",
        error: false,
    },
    company: {
        // 送检机构
        message: "必填",
        error: false,
    },
    nucleic_type: {
        // 核酸类型
        message: "必填",
        error: false,
    },
    fastq1_path: {
        // R1数据名称
        message: "必填",
        error: false,
    },
    fastq2_path: {
        // R2数据名称
        message: "必填",
        error: false,
    },
});
const form = ref({
    project_index: "",
    library_number: "",
    reagent_box: "asdf",
    nucleic_break_type: "",
    library_input: "asdfas",
    index_type: "",
    index_number: "",
    hybrid_input: "",
    risk: false,
    nucleic_level: "A",
    sample_meta_id: "1111",
    sample_identifier: "asdfasdf",
    identifier: "asdfasdf",
    company: "asdfasf",
    nucleic_type: "gDNA",
    fastq1_path: "test",
    fastq2_path: "test",
});
onMounted(() => {
    apiGet(`/sample/samples/${props.id}/`, (res) => {
        console.log(res);
        form.value = res.data;
    });
});
const save = async () => {
    for (const key in errors.value) {
        errors.value[key].error = false;
        errors.value[key].message = "必填";
    }
    const data = {
        project_index: form.value.project_index,
        library_number: form.value.library_number,
        reagent_box: form.value.reagent_box,
        nucleic_break_type: form.value.nucleic_break_type,
        library_input: form.value.library_input,
        index_type: form.value.index_type,
        index_number: form.value.index_number,
        hybrid_input: form.value.hybrid_input,
        risk: form.value.risk,
        nucleic_level: form.value.nucleic_level,
        sample_meta_id: form.value.sample_meta_id,
        sample_identifier: form.value.sample_identifier,
        identifier: form.value.identifier,
        company: form.value.company,
        nucleic_type: form.value.nucleic_type,
        fastq1_path: form.value.fastq1_path,
        fastq2_path: form.value.fastq2_path,
    };

    apiPut(
        `/sample/samples/${props.id}/`,
        (_) => {
            infoMessage("更新成功");
            emit("refresh");
        },
        data,
        null,
        (res) => {
            const errorDetail = res.data;
            for (const key in errorDetail) {
                errors.value[key].error = true;
                errors.value[key].message = errorDetail[key][0];
            }
        }
    );
};
</script>
