<template>
    <q-card style="width: 700px; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>编辑样本</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
            <q-list>
                <q-item>
                    <q-section class="full-width">
                        <q-input v-model="text" label="样本名称"
                    /></q-section>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-btn
                                label="R1文件"
                                outline
                                color="primary"
                                class="full-width"
                            />
                        </div>
                        <div class="col q-pf-sm">
                            <q-btn
                                label="R2文件"
                                outline
                                color="secondary"
                                class="full-width"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="患者信息"
                            v-model="hasPatientInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasPatientInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="临床信息"
                            v-model="hasClinicalInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasClinicalInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="样本信息"
                            v-model="hasSampleInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasSampleInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="文库信息"
                            v-model="hasLibraryInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasLibraryInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="其他信息"
                            v-model="hasOtherInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasOtherInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
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
    </q-card>
</template>
<script setup>
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import { onMounted, ref } from "vue";

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
const form = ref({
    name: "",
    gender: "",
    age: "",
    birthday: "",
    id_card: "",
    location: "",
    identifier: "",
    inspection_agency: "",
    medical_doctor: "",
    diagnosis: "",
    tumor_stage: "",
    disease: "",
    family_history: "",
    medication_history: "",
    treatment_history: "",
    prognosis_time: "",
    recurrence_time: "",
    survival_time: "",
});

const errors = ref({
    name: {
        message: "必填",
        error: false,
    },
    gender: {
        message: "必填",
        error: false,
    },
    age: {
        message: "必填",
        error: false,
    },
    birthday: {
        message: "必填",
        error: false,
    },
    id_card: {
        message: "必填",
        error: false,
    },
    location: {
        message: "必填",
        error: false,
    },
    identifier: {
        message: "必填",
        error: false,
    },
    inspection_agency: {
        message: "必填",
        error: false,
    },
    medical_doctor: {
        message: "必填",
        error: false,
    },
    diagnosis: {
        message: "必填",
        error: false,
    },
    tumor_stage: {
        message: "必填",
        error: false,
    },
    disease: {
        message: "必填",
        error: false,
    },
    family_history: {
        message: "必填",
        error: false,
    },
    medication_history: {
        message: "必填",
        error: false,
    },
    treatment_history: {
        message: "必填",
        error: false,
    },
    prognosis_time: {
        message: "必填",
        error: false,
    },
    recurrence_time: {
        message: "必填",
        error: false,
    },
    survival_time: {
        message: "必填",
        error: false,
    },
});
onMounted(() => {
    apiGet(`/patient/patients/${props.id}`, (res) => {
        console.log(res);
        form.value = res.data;
    });
});
const save = async () => {
    const data = {
        name: form.value.name,
        gender: form.value.gender,
        age: form.value.age,
        birthday: form.value.birthday,
        id_card: form.value.id_card,
        location: form.value.location,
        identifier: form.value.identifier,
        inspection_agency: form.value.inspection_agency,
        medical_doctor: form.value.medical_doctor,
        diagnosis: form.value.diagnosis,
        tumor_stage: form.value.tumor_stage,
        disease: form.value.disease,
        family_history: form.value.family_history,
        medication_history: form.value.medication_history,
        treatment_history: form.value.treatment_history,
        prognosis_time: form.value.prognosis_time,
        recurrence_time: form.value.recurrence_time,
        survival_time: form.value.survival_time,
    };
    apiPut(
        `/patient/patients/${props.id}`,
        (_) => {
            infoMessage("更新成功");
            emit("refresh");
        },
        data,
        null,
        (res) => {
            const errorDetail = JSON.parse(res.data);
            for (const key in errorDetail) {
                errors.value[key].error = true;
                errors.value[key].message = errorDetail[key][0];
            }
        }
    );
};
</script>
