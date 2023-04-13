<template>
    <q-card>
        <q-separator></q-separator>
        <q-card-section>
            <div class="text-subtitle1 text-bold">{{ $t('PatientInfoPageTitle') }}</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{ $t('PatientNewFormName') }}: {{ patient.name }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormGender') }}: {{ patient.gender }}</div>
                <div class="col q-pa-sm">{{ $t('PatientInfoPageAge') }}: {{ patient.age }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormBirthday') }}: {{ patient.birthday }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{ $t('PatientNewFormIDCard') }}: {{ patient.id_card }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormHomeAddress') }}: {{ patient.location }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormPatientIdentificationNumber') }}: {{ patient.identifier }}
                </div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormSubmissionUnit') }}: {{ patient.inspection_agency }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormTreatingPhysician') }}: {{ patient.medical_doctor }}</div>
            </div>
            <div class="text-subtitle1 text-bold">{{ $t('PatientNewFormClinicalInformatiaon') }}</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{ $t('PatientNewFormClinicalDiagnosis') }}: {{ patient.diagnosis }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormTumorStaging') }}: {{ patient.tumor_stage }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormGeneticDisease') }}: {{ patient.disease }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{ $t('PatientNewFormFamilyHistory') }}: {{ patient.family_history }}</div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormGrugUsingHistory') }}: {{ patient.medication_history }}
                </div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{ $t('PatientNewFormSmoking') }}: {{ patient.smoking }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormAlcoholDrinking') }}: {{ patient.drinking }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormViralInfection') }}: {{ patient.viral_infection }}</div>
            </div>
            <div class="text-subtitle1 text-bold">{{ $t('PatientNewFormOtherInformation') }}</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormTreatmentHistory') }}: {{ patient.treatment_history }}
                </div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormPrognosisInformation') }}: {{ patient.prognosis }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{ $t('PatientNewFormPrognosisTime') }}: {{ patient.prognosis_time }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormTimeToRelapse') }}: {{ patient.recurrence_time }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormSurvivalTime') }}: {{ patient.survival_time }}</div>
            </div>
        </q-card-section>
        <q-card-section>
            <div class="text-subtitle1 text-bold">{{ $t('PatientInfoPageSamplesTitle') }}</div>
            <q-separator></q-separator>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>{{$t('SampleNewFormSamplingDate')}}</td>
                            <td>{{$t('SampleNewFormSubmissionDate')}}</td>
                            <td>{{$t('SampleNewFormSamplingSite')}}</td>
                            <td>{{$t('SampleNewFormSampleType')}}</td>
                            <td>{{$t('SampleNewFormTumorContent')}}</td>
                            <td>{{$t('SampleNewFormTumorSample')}}</td>
                            <td>{{$t('SampleNewFormSampleIdentificationNumber')}}</td>
                            <td>{{$t('Operate')}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="hover" v-for="item in patient.samplemeta_set" v-bind:key="item.name">
                            <td>
                                {{ item.id }}
                            </td>
                            <td>
                                {{ item.sample_date }}
                            </td>
                            <td>
                                {{ item.test_date }}
                            </td>
                            <td>{{ item.sample_componet }}</td>
                            <td>
                                {{ item.sample_type }}
                            </td>
                            <td>
                                {{ item.panel_proportion }}
                            </td>
                            <td>{{ item.is_panel }}</td>
                            <td>{{ item.identifier }}</td>
                            <!-- <td>{{ item.user_id }}</td> -->
                            <!-- <td>{{ item.create_time }}</td>
                            <td>{{ item.modify_time }}</td> -->
                            <td class="q-gutter-x-sm"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { useApi } from "src/api/apiBase";
import { onMounted, ref } from "vue";

const { apiGet,apiGetById } = useApi();

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});
const patient = ref({
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
onMounted(() => {
    apiGetById('patient',props.id,(res)=>{
        patient.value = res.data.results[0];
    })
    // apiGet(`/patient/patients/${props.id}`, (res) => {
    //     patient.value = res.data;
    // });
});
</script>
