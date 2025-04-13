<template>
    <q-card>
        <q-card-section>
            <div class="text-subtitle1 text-bold">{{ $t('PatientInfoPageTitle') }}</div>
            <q-separator size="2px" class="bg-primary" />
            <div class="row">
                <div class="col q-pa-sm">{{ $t('PatientNewFormName') }}: {{ patient.name }}</div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormGender') }}:
                    {{ patient.gender == '男' ? $t('Male') :
                        $t('Female') }}
                </div>
                <div class="col q-pa-sm">{{ $t('PatientInfoPageAge') }}: {{ patient.age }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormBirthday') }}: {{ patient.birthday }}</div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">{{ $t('PatientNewFormIDCard') }}: {{ patient.id_card }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormHomeAddress') }}: {{ patient.location }}</div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormPatientIdentificationNumber') }}: {{ patient.identifier }}
                </div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormSubmissionUnit') }}: {{ patient.inspection_agency }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormTreatingPhysician') }}: {{ patient.medical_doctor }}</div>
            </div>
            <div class="text-subtitle1 text-bold">{{ $t('PatientNewFormClinicalInformation') }}</div>
            <q-separator size="2px" class="bg-primary" />
            <div class="row">
                <div class="col q-pa-sm">{{ $t('PatientNewFormClinicalDiagnosis') }}: {{ patient.diagnosis }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormTumorStaging') }}: {{ patient.tumor_stage }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormGeneticDisease') }}: {{ patient.disease }}</div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">
                    {{ $t('Gestation') }}: {{ patient.gestation ? patient.gestation + $t('Week') : '' }}
                </div>
                <div class="col q-pa-sm">{{ $t('PregnancyStatus') }}: {{ patient.pregnancy_status }}</div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">{{ $t('PatientNewFormFamilyHistory') }}: {{ patient.family_history }}</div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormDrugUsingHistory') }}: {{ patient.medication_history }}
                </div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormSmoking') }}:
                    {{ patient.smoking == '是' ? $t('Yes') :
                        $t('No')
                    }}
                </div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormAlcoholDrinking') }}:
                    {{
                        patient.drinking == '是' ? $t('Yes') : $t('No') }}
                </div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormViralInfection') }}:
                    {{
                        patient.viral_infection == '是' ? $t('Yes') : $t('No') }}
                </div>
            </div>
            <!-- <div class="row q-gutter-xs" v-if="patient.viral_infection === '是'">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormViralResult') }}: {{ patient.viral_result }}
                </div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormViralFocus') }}: {{ patient.viral_focus }}
                </div>

            </div> -->
            <div class="text-subtitle1 text-bold">{{ $t('PatientNewFormOtherInformation') }}</div>
            <q-separator size="2px" class="bg-primary" />
            <div class="row">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormTreatmentHistory') }}: {{ patient.treatment_history }}
                </div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormPrognosisInformation') }}: {{ patient.prognosis }}</div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">{{ $t('PatientNewFormPrognosisTime') }}: {{ patient.prognosis_time }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormTimeToRelapse') }}: {{ patient.recurrence_time }}</div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormSurvivalTime') }}: {{ patient.survival_time }}</div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormGeneralPathologyNumber') }}: {{ patient.general_pathology_number }}
                </div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormMolecularPathologyNumber') }}: {{ patient.molecular_pathology_number }}
                </div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormSubmittingDepartment') }}: {{ patient.submitting_department }}
                </div>
            </div>
            <div class="row">
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormPatientPhoneNumber') }}: {{ patient.patient_phone_number }}
                </div>
                <div class="col q-pa-sm">
                    {{ $t('PatientNewFormOutpatientInpatientNumber') }}: {{ patient.outpatient_or_inpatient_number }}
                </div>
                <div class="col q-pa-sm">{{ $t('PatientNewFormBedNumber') }}: {{ patient.bed_number }}</div>
            </div>
        </q-card-section>
        <q-card-section>
            <div class="text-subtitle1 text-bold">{{ $t('PatientInfoPageSamplesTitle') }}</div>
            <q-separator size="2px" class="bg-primary" />
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>{{ $t('SampleNewFormSamplingDate') }}</td>
                            <td>{{ $t('SampleNewFormSubmissionDate') }}</td>
                            <td>{{ $t('SampleNewFormSamplingSite') }}</td>
                            <td>{{ $t('SampleNewFormSampleType') }}</td>
                            <td>{{ $t('SampleNewFormTumorContent') }}</td>
                            <td>{{ $t('SampleNewFormTumorSample') }}</td>
                            <td>{{ $t('SampleNewFormSampleIdentificationNumber') }}</td>
                            <td>{{ $t('Operate') }}</td>
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

const { apiGet, apiGetById } = useApi();

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
    gestation: "",
    pregnancy_status: "",
    family_history: "",
    medication_history: "",
    treatment_history: "",
    prognosis_time: "",
    recurrence_time: "",
    survival_time: "",
    general_pathology_number: "",
    molecular_pathology_number: "",
    submitting_department: "",
    patient_phone_number: "",
    outpatient_or_inpatient_number: "",
    bed_number: "",
});
onMounted(() => {
    apiGetById('patient', props.id, (res) => {
        patient.value = res.data.results[0];
    })
    // apiGet(`/patient/patients/${props.id}`, (res) => {
    //     patient.value = res.data;
    // });
});
</script>
