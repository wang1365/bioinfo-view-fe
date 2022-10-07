<template>
    <q-card style="width: 80vw; max-width: 80vw">
        <PopupContentScroll title="修改患者">
            <template v-slot:contentBody>
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
                            <q-select
                                :error="errors.gender.error"
                                :error-message="errors.gender.message"
                                v-model="form.gender"
                                :options="genderOptions"
                                label="性别"
                            />
                        </div>
                        <!-- <div class="col">
                            <q-input
                                :error="errors.age.error"
                                :error-message="errors.age.message"
                                type="number"
                                v-model="form.age"
                                label="年龄"
                            ></q-input>
                        </div> -->
                        <div class="col">
                            <q-input
                                :error="errors.birthday.error"
                                :error-message="errors.birthday.message"
                                label="*出生日期(YYYY-MM-DD)"
                                v-model="form.birthday"
                                readonly
                            >
                                <template v-slot:append>
                                    <q-icon color="primary" name="event" class="cursor-pointer">
                                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                            <q-date v-model="form.birthday" mask="YYYY-MM-DD">
                                                <div class="row items-center justify-end">
                                                    <q-btn v-close-popup label="Close" color="primary" flat />
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
                                label="*患者识别号"
                            ></q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.inspection_agency.error"
                                :error-message="
                                errors.inspection_agency.message
                            "
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
                                :error-message="
                                errors.medication_history.message
                            "
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
                                :error-message="
                                errors.treatment_history.message
                            "
                                v-model="form.treatment_history"
                                label="治疗史"
                            ></q-input>
                        </div>
                        <div class="col">
                            <q-input
                                type="number"
                                :error="errors.prognosis_time.error"
                                :error-message="errors.prognosis_time.message"
                                label="预后时间(天)"
                                v-model="form.prognosis_time"
                            >
                            </q-input>
                        </div>
                    </div>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                type="number"
                                :error="errors.recurrence_time.error"
                                :error-message="errors.recurrence_time.message"
                                label="*复发时间(天)"
                                v-model="form.recurrence_time"
                            >
                            </q-input>
                        </div>
                        <div class="col">
                            <q-input
                                type="number"
                                :error="errors.survival_time.error"
                                :error-message="errors.survival_time.message"
                                label="*存活时间(天)"
                                v-model="form.survival_time"
                            >
                            </q-input>
                        </div>
                    </div>
                </q-card-section>
            </template>
            <template v-slot:contentFooter>
                <q-btn label="关闭" @click="close()" />
                <q-btn color="primary" label="保存" @click="save()" />
            </template>
        </PopupContentScroll>
    </q-card>
</template>

<script setup>
import { useApi } from "src/api/apiBase";
import { errorMessage, infoMessage } from "src/utils/notify";
import { onMounted, ref } from "vue";
import PopupContentScroll from "src/components/popup-content-scroll/PopupContentScroll.vue";

const { apiGet, apiPut } = useApi();
const emit = defineEmits(["refresh"]);
const genderOptions = ['男','女']
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
    for (const key in errors.value) {
        errors.value[key].error = false;
    }
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
    // if(form.value.gender.label){
    //     data.gender=form.value.gender.value
    // }
    data.age = (new Date().getFullYear()) - (new Date(form.value.birthday).getFullYear())
    apiPut(
        `/patient/patients/${props.id}`,
        (_) => {
            infoMessage("更新成功");
            emit("refresh");
        },
        data,
        null,
        (res) => {
            errorMessage("请更正表单信息");
            const errorDetail = res.data;
            for (const key in errorDetail) {
                errors.value[key].error = true;
                errors.value[key].message = errorDetail[key][0];
            }
        }
    );
};
</script>
