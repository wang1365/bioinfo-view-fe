<template>
    <q-card style="width: 80vw; max-width: 80vw">
        <PopupContentScroll :title="$t('PatientEditFormTitle')">
            <template v-slot:contentBody>
                <q-card-section>
                    <div class="text-h6 text-bold">{{ $t('PatientNewFormPatientInfo') }}</div>
                    <q-separator></q-separator>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                :error="errors.name.error"
                                :error-message="errors.name.message"
                                v-model="form.name"
                                :label="$t('PatientNewFormName')"
                            >
                                <template v-slot:prepend><span style="color:red">*</span></template>
                            </q-input>
                        </div>
                        <div class="col">
                            <q-select
                                :error="errors.gender.error"
                                :error-message="errors.gender.message"
                                v-model="form.gender"
                                :options="genderOptions"
                                :label="$t('PatientNewFormGender')"
                            >
                                <template v-slot:prepend><span style="color:red">*</span></template>
                            </q-select>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.birthday.error"
                                :error-message="errors.birthday.message"
                                :label="$t('PatientNewFormBirthday')+'(YYYY-MM-DD)'"
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
                                <template v-slot:prepend><span style="color:red">*</span></template>
                            </q-input>
                        </div>
                    </div>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                :error="errors.id_card.error"
                                :error-message="errors.id_card.message"
                                v-model="form.id_card"
                                :label="$t('PatientNewFormIDCard')"
                            >
                                <template v-slot:prepend><span style="color:red">*</span></template>
                            </q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.location.error"
                                :error-message="errors.location.message"
                                v-model="form.location"
                                :label="$t('PatientNewFormIDCard')"
                            ></q-input>
                        </div>
                    </div>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                :error="errors.identifier.error"
                                :error-message="errors.identifier.message"
                                v-model="form.identifier"
                                :label="$t('PatientNewFormPatientIdentificationNumber')"
                                readonly
                            ></q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.inspection_agency.error"
                                :error-message="
                                errors.inspection_agency.message
                            "
                                v-model="form.inspection_agency"
                                :label="$t('PatientNewFormSubmissionUnit')"
                            >
                                <template v-slot:prepend><span style="color:red">*</span></template>
                            </q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.medical_doctor.error"
                                :error-message="errors.medical_doctor.message"
                                v-model="form.medical_doctor"
                                :label="$t('PatientNewFormTreatingPhysician')"
                            >
                                <template v-slot:prepend><span style="color:red">*</span></template>
                            </q-input>
                        </div>
                    </div>
                    <div class="text-h6 text-bold">{{ $t('PatientNewFormClinicalInformatiaon') }}</div>
                    <q-separator></q-separator>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                :error="errors.diagnosis.error"
                                :error-message="errors.diagnosis.message"
                                v-model="form.diagnosis"
                                :label="$t('PatientNewFormClinicalDiagnosis')"
                            >
                                <template v-slot:prepend><span style="color:red">*</span></template>
                            </q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.tumor_stage.error"
                                :error-message="errors.tumor_stage.message"
                                v-model="form.tumor_stage"
                                :label="$t('PatientNewFormTumorStaging')"
                            ></q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.disease.error"
                                :error-message="errors.disease.message"
                                v-model="form.disease"
                                :label="$t('PatientNewFormGeneticDisease')"
                            ></q-input>
                        </div>
                    </div>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                :error="errors.family_history.error"
                                :error-message="errors.family_history.message"
                                v-model="form.family_history"
                                :label="$t('PatientNewFormFamilyHistory')"
                            ></q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.medication_history.error"
                                :error-message="
                                errors.medication_history.message
                            "
                                v-model="form.medication_history"
                                :label="$t('PatientNewFormGrugUsingHistory')"
                            ></q-input>
                        </div>
                    </div>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col q-pr-sm">
                            <q-select
                                :error="errors.smoking.error"
                                :error-message="errors.smoking.message"
                                v-model="form.smoking"
                                :label="$t('PatientNewFormSmoking')"
                                :options="['是','否']"
                            />
                        </div>
                        <div class="col q-pr-sm">
                            <q-select
                                :error="errors.drinking.error"
                                :error-message="errors.drinking.message"
                                v-model="form.drinking"
                                :label="$t('PatientNewFormAlcoholDrinking')"
                                :options="['是','否']"
                            />
                        </div>
                        <div class="col q-pr-sm">
                            <q-select
                                :error="errors.viral_infection.error"
                                :error-message="errors.viral_infection.message"
                                v-model="form.viral_infection"
                                :label="$t('PatientNewFormViralInfection')"
                                :options="['是','否']"
                            />
                        </div>
                    </div>
                    <div class="text-h6 text-bold">{{$t('PatientNewFormOtherInformation')}}</div>
                    <q-separator></q-separator>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                :error="errors.treatment_history.error"
                                :error-message="
                                errors.treatment_history.message
                            "
                                v-model="form.treatment_history"
                                :label="$t('PatientNewFormTreatmentHistory')"
                            ></q-input>
                        </div>
                        <div class="col">
                            <q-input
                                :error="errors.prognosis.error"
                                :error-message="
                                errors.prognosis.message
                            "
                                v-model="form.prognosis"
                                :label="$t('PatientNewFormPrognosisInformation')"
                            ></q-input>
                        </div>
                    </div>
                    <div class="row q-my-sm q-gutter-xs">
                        <div class="col">
                            <q-input
                                type="number"
                                :error="errors.prognosis_time.error"
                                :error-message="errors.prognosis_time.message"
                                :label="$t('PatientNewFormPrognosisTime')"
                                v-model="form.prognosis_time"
                            >
                            </q-input>
                        </div>
                        <div class="col">
                            <q-input
                                type="number"
                                :error="errors.recurrence_time.error"
                                :error-message="errors.recurrence_time.message"
                                :label="$t('PatientNewFormTimeToRelapse')"
                                v-model="form.recurrence_time"
                            >
                            </q-input>
                        </div>
                        <div class="col">
                            <q-input
                                type="number"
                                :error="errors.survival_time.error"
                                :error-message="errors.survival_time.message"
                                :label="$t('PatientNewFormSurvivalTime')"
                                v-model="form.survival_time"
                            >
                            </q-input>
                        </div>
                    </div>
                </q-card-section>
            </template>
            <template v-slot:contentFooter>
                <q-btn :label="$t('PatientNewFormClose')" @click="close()" />
                <q-btn color="primary" :label="$t('PatientNewFormSave')" @click="save()" />
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
const genderOptions = ['男', '女']
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
    smoking: '否',
    drinking: '否',
    viral_infection: '否',
    prognosis: "",
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
    smoking: {
        message: "必填",
        error: false,
    },
    drinking: {
        message: "必填",
        error: false,
    },
    viral_infection: {
        message: "必填",
        error: false,
    },
    prognosis: {
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
        smoking: form.value.smoking,
        drinking: form.value.drinking,
        viral_infection: form.value.viral_infection,
        prognosis: form.value.prognosis,
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
