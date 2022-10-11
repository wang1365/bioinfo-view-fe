<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>编辑数据</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-card-section>
            <q-list>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-input
                                @click="showLinkProject=true"
                                readonly
                                v-model="form.project_index"
                                :error="errors.project_index.error"
                                :error-message="errors.project_index.message"
                                label="项目编码"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.library_number"
                                :error="errors.library_number.error"
                                :error-message="errors.library_number.message"
                                label="文库编号"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <panel-list
                                label="*捕获试剂盒"
                                v-model="form.reagent_box"
                                :error="errors.reagent_box.error"
                                :error-message="errors.reagent_box.message"
                            />
                            <!--                            <q-input-->
                            <!--                                v-model="form.reagent_box"-->
                            <!--                                :error="errors.reagent_box.error"-->
                            <!--                                :error-message="errors.reagent_box.message"-->
                            <!--                                label="*捕获试剂盒"-->
                            <!--                            ></q-input>-->
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.library_input"
                                :error="errors.library_input.error"
                                :error-message="errors.library_input.message"
                                label="*建库input"
                            ></q-input>
                        </div>
                        <div class="col q-pf-sm">
                            <q-input
                                v-model="form.index_type"
                                :error="errors.index_type.error"
                                :error-message="errors.index_type.message"
                                label="index类型"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.index_number"
                                :error="errors.index_number.error"
                                :error-message="errors.index_number.message"
                                label="index编号"
                            ></q-input>
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.hybrid_input"
                                :error="errors.hybrid_input.error"
                                :error-message="errors.hybrid_input.message"
                                label="杂交input"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.nucleic_break_type"
                                :error="errors.nucleic_break_type.error"
                                :error-message="
                                    errors.nucleic_break_type.message
                                "
                                label="*核酸打断方式"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.identifier"
                                :error="errors.identifier.error"
                                :error-message="errors.identifier.message"
                                label="*数据识别号"
                            ></q-input>
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pf-sm">
                            <q-input
                                v-model="form.company"
                                :error="errors.company.error"
                                :error-message="errors.company.message"
                                label="*送检机构"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-select
                                :error="errors.nucleic_type.error"
                                :error-message="errors.nucleic_type.message"
                                v-model="form.nucleic_type"
                                :options="nucleic_type_options"
                                label="核酸类型"
                            />
                        </div>
                        <div class="col q-pr-sm">
                            <q-select
                                :error="errors.nucleic_level.error"
                                :error-message="errors.nucleic_level.message"
                                v-model="form.nucleic_level"
                                :options="nucleic_level_options"
                                label="核酸降解等级"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-checkbox
                                :error="errors.risk.error"
                                :error-message="errors.risk.message"
                                v-model="form.risk"
                                label="风险上机"
                                color="primary"
                                left-label
                                size="lg"
                            />
                        </div>

                        <div class="col q-pr-sm">
                            <q-input
                                @click="showLinkSample=true"
                                readonly
                                v-model="form.sample_identifier"
                                :error="errors.sampsample_identifier"
                                :error-message="errors.sampsample_identifier"
                                label="*样本识别号"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                @click="showLinkSample=true"
                                readonly
                                v-model="form.sample_meta_id"
                                :error="errors.sample_meta_id.error"
                                :error-message="errors.sample_meta_id.message"
                                label="*样本元信息ID"
                            ></q-input>
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.fastq1_path"
                                :error="errors.fastq1_path.error"
                                :error-message="errors.fastq1_path.message"
                                label="*R1文件"
                            ></q-input>
                            <!-- <q-btn
                                :label="'R1文件: ' + form.fastq1_path"
                                outline
                                color="primary"
                                class="full-width"
                            />
                            <q-btn
                                flat
                                outline
                                v-if="errors.fastq1_path.error"
                                color="negative"
                                :label="errors.fastq1_path.message"
                                class="full-width"
                                disable
                            /> -->
                        </div>
                        <div class="col q-pf-sm">
                            <q-input
                                v-model="form.fastq2_path"
                                :error="errors.fastq2_path.error"
                                :error-message="errors.fastq2_path.message"
                                label="*R2文件"
                            ></q-input>
                            <!-- <q-btn
                                :label="'R2文件: ' + form.fastq1_path"
                                outline
                                color="secondary"
                                class="full-width"
                            />
                            <q-btn
                                flat
                                outline
                                v-if="errors.fastq2_path.error"
                                color="negative"
                                :label="errors.fastq2_path.message"
                                class="full-width"
                                disable
                            /> -->
                        </div>
                    </div>
                </q-item>
            </q-list>
            <div class="q-pa-md q-gutter-y-sm content-start"></div>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-list>
                <q-item>
                    <q-section class="q-gutter-x-sm">
                        <q-btn label="关闭" @click="close()" />
                        <q-btn color="primary" label="保存" @click="save()" />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
        <q-dialog persistent v-model="showLinkSample">
            <SampleList
                :linkId="0"
                @itemSelected="
            linkSample($event);
        "
            />
        </q-dialog>
        <q-dialog persistent v-model="showLinkProject">
            <ProjectList
                :linkId="0"
                @itemSelected="
            linkProject($event);
        "
            />
        </q-dialog>
    </q-card>
</template>
<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import PanelList from "src/pages/main/settings/flow/components/PanelList";
import SampleList from "./SampleList.vue";
import ProjectList from "./ProjectList.vue";

const nucleic_level_options = ref(["A", "B", "C", "D"]);
const nucleic_type_options = ref(["gDNA", "cfDNA", "RNA"]);
const { apiGet, apiPut,apiPost } = useApi();
const emit = defineEmits(["refresh"]);

const showLinkSample = ref(false);
const linkSample = (event) => {
    form.value.sample_meta_id= event.id;
    form.value.sample_identifier=event.identifier
    showLinkSample.value=false
}
const showLinkProject = ref(false);
const showPanelTable = ref(false);

const linkProject = (event) => {
    form.value.project_index= event.name;
    showLinkProject.value=false
}
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
    reagent_box: "",
    nucleic_break_type: "",
    library_input: "",
    index_type: "",
    index_number: "",
    hybrid_input: "",
    risk: true,
    nucleic_level: "A",
    sample_meta_id: "",
    sample_identifier: "",
    identifier: "",
    company: "",
    nucleic_type: "gDNA",
    fastq1_path: "",
    fastq2_path: "",
 });
/* const form = ref({
*    project_index: "project_index",
*    library_number: "library_number",
*    reagent_box: "reagent_box",
*    nucleic_break_type: "nucleic_break_type",
*    library_input: "library_input",
*    index_type: "index_type",
*    index_number: "index_number",
*    hybrid_input: "hybrid_input",
*    risk: true,
*    nucleic_level: "A",
*    sample_meta_id: "sample_meta_id",
*    sample_identifier: "sample_identifier",
*    identifier: "identifier",
*    company: "company",
*    nucleic_type: "gDNA",
*    fastq1_path: "fastq1_path",
*    fastq2_path: "fastq2_path",
}); */
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
