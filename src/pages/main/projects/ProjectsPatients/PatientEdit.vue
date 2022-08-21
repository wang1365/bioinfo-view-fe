<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>修改患者</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
            <div class="text-h6 text-bold">患者信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm q-gutter-xs">
                <div class="col">
                    <q-input
                        :error="errors.name.error"
                        :error-message="errors.name.message"
                        v-model="form.name"
                        label="姓名"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.gender.error"
                        :error-message="errors.gender.message"
                        v-model="form.gender"
                        label="性别"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.age.error"
                        :error-message="errors.age.message"
                        type="number"
                        v-model="form.age"
                        label="年龄"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.birthday.error"
                        :error-message="errors.birthday.message"
                        label="出生日期"
                        v-model="form.birthday"
                    >
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                >
                                    <q-date
                                        v-model="form.birthday"
                                        mask="YYYY-MM-DD"
                                    >
                                        <div
                                            class="row items-center justify-end"
                                        >
                                            <q-btn
                                                v-close-popup
                                                label="Close"
                                                color="primary"
                                                flat
                                            />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
            </div>
            <div class="row q-my-sm q-gutter-xs">
                <div class="col">
                    <q-input
                        :error="errors.id_card.error"
                        :error-message="errors.id_card.message"
                        v-model="form.id_card"
                        label="身份证"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.location.error"
                        :error-message="errors.location.message"
                        v-model="form.location"
                        label="家庭地址"
                    ></q-input>
                </div>
            </div>
            <div class="row q-my-sm q-gutter-xs">
                <div class="col">
                    <q-input
                        :error="errors.identifier.error"
                        :error-message="errors.identifier.message"
                        v-model="form.identifier"
                        label="患者识别号"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.inspection_agency.error"
                        :error-message="errors.inspection_agency.message"
                        v-model="form.inspection_agency"
                        label="送检机构"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.medical_doctor.error"
                        :error-message="errors.medical_doctor.message"
                        v-model="form.medical_doctor"
                        label="诊疗医生"
                    ></q-input>
                </div>
            </div>
            <div class="text-h6 text-bold">临床信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm q-gutter-xs">
                <div class="col">
                    <q-input
                        :error="errors.diagnosis.error"
                        :error-message="errors.diagnosis.message"
                        v-model="form.diagnosis"
                        label="临床诊断"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.tumor_stage.error"
                        :error-message="errors.tumor_stage.message"
                        v-model="form.tumor_stage"
                        label="肿瘤分期"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.disease.error"
                        :error-message="errors.disease.message"
                        v-model="form.disease"
                        label="遗传病"
                    ></q-input>
                </div>
            </div>
            <div class="row q-my-sm q-gutter-xs">
                <div class="col">
                    <q-input
                        :error="errors.family_history.error"
                        :error-message="errors.family_history.message"
                        v-model="form.family_history"
                        label="家族史"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.medication_history.error"
                        :error-message="errors.medication_history.message"
                        v-model="form.medication_history"
                        label="用药史"
                    ></q-input>
                </div>
            </div>
            <div class="text-h6 text-bold">其他信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm q-gutter-xs">
                <div class="col">
                    <q-input
                        :error="errors.treatment_history.error"
                        :error-message="errors.treatment_history.message"
                        v-model="form.treatment_history"
                        label="治疗史"
                    ></q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.prognosis_time.error"
                        :error-message="errors.prognosis_time.message"
                        label="预后时间"
                        v-model="form.prognosis_time"
                    >
                        <template v-slot:prepend>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                >
                                    <q-date
                                        v-model="form.prognosis_time"
                                        mask="YYYY-MM-DD HH:mm"
                                    >
                                        <div
                                            class="row items-center justify-end"
                                        >
                                            <q-btn
                                                v-close-popup
                                                label="Close"
                                                color="primary"
                                                flat
                                            />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>

                        <template v-slot:append>
                            <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                >
                                    <q-time
                                        v-model="form.prognosis_time"
                                        mask="YYYY-MM-DD HH:mm"
                                        format24h
                                    >
                                        <div
                                            class="row items-center justify-end"
                                        >
                                            <q-btn
                                                v-close-popup
                                                label="Close"
                                                color="primary"
                                                flat
                                            />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
            </div>
            <div class="row q-my-sm q-gutter-xs">
                <div class="col">
                    <q-input
                        :error="errors.recurrence_time.error"
                        :error-message="errors.recurrence_time.message"
                        label="复发时间"
                        v-model="form.recurrence_time"
                    >
                        <template v-slot:prepend>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                >
                                    <q-date
                                        v-model="form.recurrence_time"
                                        mask="YYYY-MM-DD HH:mm"
                                    >
                                        <div
                                            class="row items-center justify-end"
                                        >
                                            <q-btn
                                                v-close-popup
                                                label="Close"
                                                color="primary"
                                                flat
                                            />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>

                        <template v-slot:append>
                            <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                >
                                    <q-time
                                        v-model="form.recurrence_time"
                                        mask="YYYY-MM-DD HH:mm"
                                        format24h
                                    >
                                        <div
                                            class="row items-center justify-end"
                                        >
                                            <q-btn
                                                v-close-popup
                                                label="Close"
                                                color="primary"
                                                flat
                                            />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
                <div class="col">
                    <q-input
                        :error="errors.survival_time.error"
                        :error-message="errors.survival_time.message"
                        label="存活时间"
                        v-model="form.survival_time"
                    >
                        <template v-slot:prepend>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                >
                                    <q-date
                                        v-model="form.survival_time"
                                        mask="YYYY-MM-DD HH:mm"
                                    >
                                        <div
                                            class="row items-center justify-end"
                                        >
                                            <q-btn
                                                v-close-popup
                                                label="Close"
                                                color="primary"
                                                flat
                                            />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>

                        <template v-slot:append>
                            <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                >
                                    <q-time
                                        v-model="form.survival_time"
                                        mask="YYYY-MM-DD HH:mm"
                                        format24h
                                    >
                                        <div
                                            class="row items-center justify-end"
                                        >
                                            <q-btn
                                                v-close-popup
                                                label="Close"
                                                color="primary"
                                                flat
                                            />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
            </div>
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
import { useQuasar } from "quasar";
import { api, getTokenCookie } from "src/boot/axios";
import { onMounted, ref } from "vue";
const emit = defineEmits(["refresh"]);
const $q = useQuasar();

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
    console.log(props.id);
    api.get(`/patient/patients/${props.id}`, {
        headers: { Authorization: getTokenCookie() },
    }).then((resp) => {
        let data = resp.data;
        console.log(data);
        form.value = data;
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
    console.log(data);
    api.patch(`/patient/patients/${props.id}`, data, {
        headers: {
            Authorization: getTokenCookie(),
        },
    })
        .then((resp) => {
            $q.notify({
                position: "center",
                message: "保存成功",
                timeout: 300,
            });
            for (const key in errors.value) {
                errors.value[key].error = false;
            }
        })
        .catch((e) => {
            for (const key in e.response.data) {
                errors.value[key].error = true;
                errors.value[key].message = e.response.data[key][0];
            }
        });
};
</script>
