<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>编辑样本</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-card-section>
            <q-list>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-input
                                :error="errors.sample_date.error"
                                :error-message="errors.sample_date.message"
                                label="*采样日期(YYYY-MM-DD)"
                                v-model="form.sample_date"
                                readonly
                            >
                                <template v-slot:append>
                                    <q-icon color="primary" name="event" class="cursor-pointer">
                                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                            <q-date v-model="form.sample_date" mask="YYYY-MM-DD">
                                                <div class="row items-center justify-end">
                                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                                </div>
                                            </q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                </template>
                            </q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                readonly
                                :error="errors.test_date.error"
                                :error-message="errors.test_date.message"
                                label="*送测日期(YYYY-MM-DD)"
                                v-model="form.test_date"
                            >
                                <template v-slot:append>
                                    <q-icon color="primary" name="event" class="cursor-pointer">
                                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                            <q-date v-model="form.test_date" mask="YYYY-MM-DD">
                                                <div class="row items-center justify-end">
                                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                                </div>
                                            </q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                </template>
                            </q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.sample_componet"
                                :error="errors.sample_componet.error"
                                :error-message="errors.sample_componet.message"
                                label="*采样部位"
                            ></q-input>
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <!-- <q-input
                                v-model="form.sample_type"
                                :error="errors.sample_type.error"
                                :error-message="errors.sample_type.message"
                                label="*样本类型"
                            ></q-input> -->
                            <q-select
                                v-model="form.sample_type"
                                :error="errors.sample_type.error"
                                :error-message="errors.sample_type.message"
                                use-input
                                input-debounce="0"
                                @new-value="createValue"
                                :options="sampleTypeOptions"
                                label="*样本类型"
                            />
                        </div>
                        <div class="col q-pf-sm">
                            <q-input
                                type="number"
                                v-model="form.panel_proportion"
                                :error="errors.panel_proportion.error"
                                :error-message="errors.panel_proportion.message"
                                label="肿瘤含量"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-checkbox
                                :error="errors.is_panel.error"
                                :error-message="errors.is_panel.message"
                                v-model="form.is_panel"
                                label="肿瘤样本"
                                color="primary"
                                left-label
                                size="lg"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-input
                                v-model="form.identifier"
                                :error="errors.identifier.error"
                                :error-message="errors.identifier.message"
                                label="样本识别号"
                                :readonly="true"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm cursor-pointer">
                            <q-input
                                @click="showLinkPatient=true"
                                readonly
                                v-model="form.patient_id"
                                :error="errors.patient_id.error"
                                :error-message="errors.patient_id.message"
                                label="*患者ID"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                @click="showLinkPatient=true"
                                readonly
                                v-model="form.patient_identifier"
                                :error="errors.patient_identifier.error"
                                :error-message="
                                    errors.patient_identifier.message
                                "
                                label="*患者识别号"
                            ></q-input>
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
                        <q-btn :label="$t('Close')" @click="close()" />
                        <q-btn color="primary" label="保存" @click="save()" />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
        <q-dialog persistent v-model="showLinkPatient">
            <PatientsList
                :linkId="0"
                @refresh="
                linkPatient($event);
            "
            />
        </q-dialog>
    </q-card>
</template>
<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import PatientsList from "./PatientList.vue";

const { apiPost } = useApi();
const { apiGet, apiPut } = useApi();
const emit = defineEmits(["refresh"]);
const showLinkPatient = ref(false);
const linkPatient = (event) => {
    showLinkPatient.value = false;
    form.value.patient_id = event.id
    form.value.patient_identifier = event.identifier
}
const sampleTypeOptions = ref(['FFPE蜡块', '新鲜组织', '血液'])
const createValue = (val, done) => {
    if (val.length > 0) {
        if (!sampleTypeOptions.value.includes(val)) {
            sampleTypeOptions.value.push(val)
            // form.value.sample_type = val
        }
        done(val, 'toggle')
    }
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
    sample_date: {
        // 采样日期
        message: "必填",
        error: false,
    },
    test_date: {
        // 送测日期
        message: "必填",
        error: false,
    },
    sample_componet: {
        // 采样部位
        message: "必填",
        error: false,
    },
    sample_type: {
        // 样本类型
        message: "必填",
        error: false,
    },
    panel_proportion: {
        // 肿瘤含量
        message: "必填",
        error: false,
    },
    is_panel: {
        // 肿瘤样本
        message: "必填",
        error: false,
    },
    patient_id: {
        // 患者ID
        message: "必填",
        error: false,
    },
    patient_identifier: {
        // 患者识别号
        message: "必填",
        error: false,
    },
    identifier: {
        // 样本识别号
        message: "必填",
        error: false,
    },
});
const form = ref({
    sample_date: "",
    test_date: "",
    sample_componet: "",
    sample_type: "",
    panel_proportion: 1,
    is_panel: false,
    patient_id: "",
    patient_identifier: "",
    identifier: "",
});
/* const form = ref({
*     sample_date: "2022-09-01",
*     test_date: "2022-09-01",
*     sample_componet: "sample_componet",
*     sample_type: "sample_type",
*     panel_proportion: 1,
*     is_panel: false,
*     patient_id: "patient_id",
*     patient_identifier: "patient_identifier",
*     identifier: "identifier",
* }); */
onMounted(() => {
    apiGet(`/sample/sampledatas/${props.id}/`, (res) => {
        console.log(res);
        form.value = res.data;
        form.value.patient_id = res.data.patient.id
        form.value.patient_identifier = res.data.patient.identifier
    });
});
const save = async () => {
    for (const key in errors.value) {
        errors.value[key].error = false;
        errors.value[key].message = "必填";
    }
    const data = {
        sample_date: form.value.sample_date,
        test_date: form.value.test_date,
        sample_componet: form.value.sample_componet,
        sample_type: form.value.sample_type,
        panel_proportion: Number.parseInt(form.value.panel_proportion),
        is_panel: form.value.is_panel,
        patient_id: Number.parseInt(form.value.patient_id),
        patient_identifier: form.value.patient_identifier,
        identifier: form.value.identifier,
    };

    apiPut(
        `/sample/sampledatas/${props.id}/`,
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
