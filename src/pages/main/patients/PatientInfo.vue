<template>
    <q-card class="patient-info-card">
        <q-card-section class="section-block">
            <div class="header-row">
                <div class="section-title">{{ t('PatientInfoPageTitle') }}</div>
                <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
            </div>
            <q-separator size="2px" class="bg-primary q-mb-sm" />

            <div class="field-grid grid-4">
                <div class="field-item" v-for="item in basicInfoFields" :key="item.label">
                    <div class="field-label">{{ item.label }}</div>
                    <div class="field-value">{{ item.value }}</div>
                </div>
            </div>

            <div class="section-title q-mt-md">{{ t('PatientNewFormClinicalInformation') }}</div>
            <q-separator size="2px" class="bg-primary q-mb-sm" />
            <div class="field-grid grid-4">
                <div class="field-item" v-for="item in clinicalInfoFields" :key="item.label">
                    <div class="field-label">{{ item.label }}</div>
                    <div class="field-value">{{ item.value }}</div>
                </div>
            </div>

            <div class="section-title q-mt-md">{{ t('PatientNewFormOtherInformation') }}</div>
            <q-separator size="2px" class="bg-primary q-mb-sm" />
            <div class="field-grid grid-4">
                <div class="field-item" v-for="item in otherInfoFields" :key="item.label">
                    <div class="field-label">{{ item.label }}</div>
                    <div class="field-value">{{ item.value }}</div>
                </div>
            </div>
        </q-card-section>

        <q-card-section class="section-block">
            <div class="section-title">{{ t('PatientInfoPageSamplesTitle') }}</div>
            <q-separator size="2px" class="bg-primary" />
            <div class="q-pt-sm bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>{{ t('SampleNewFormSamplingDate') }}</td>
                            <td>{{ t('SampleNewFormSubmissionDate') }}</td>
                            <td>{{ t('SampleNewFormSamplingSite') }}</td>
                            <td>{{ t('SampleNewFormSampleType') }}</td>
                            <td>{{ t('SampleNewFormTumorContent') }}</td>
                            <td>{{ t('SampleNewFormTumorSample') }}</td>
                            <td>{{ t('SampleNewFormSampleIdentificationNumber') }}</td>
                            <td>{{ t('Operate') }}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="hover" v-for="item in patient.samplemeta_set" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.sample_date }}</td>
                            <td>{{ item.test_date }}</td>
                            <td>{{ item.sample_componet }}</td>
                            <td>{{ item.sample_type }}</td>
                            <td>{{ item.panel_proportion }}</td>
                            <td>{{ item.is_panel }}</td>
                            <td>{{ item.identifier }}</td>
                            <td class="q-gutter-x-sm"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-py-sm">
            <q-btn color="primary" :label="t('Close')" v-close-popup />
        </q-card-actions>
    </q-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useApi } from 'src/api/apiBase'
import { useI18n } from 'vue-i18n'

const { apiGetById } = useApi()
const { t } = useI18n()

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const patient = ref({
    name: '',
    gender: '',
    age: '',
    birthday: '',
    id_card: '',
    location: '',
    identifier: '',
    inspection_agency: '',
    medical_doctor: '',
    diagnosis: '',
    tumor_stage: '',
    disease: '',
    gestation: '',
    pregnancy_status: '',
    family_history: '',
    medication_history: '',
    smoking: '',
    drinking: '',
    viral_infection: '',
    treatment_history: '',
    prognosis: '',
    prognosis_time: '',
    recurrence_time: '',
    survival_time: '',
    general_pathology_number: '',
    molecular_pathology_number: '',
    submitting_department: '',
    patient_phone_number: '',
    outpatient_or_inpatient_number: '',
    bed_number: '',
    samplemeta_set: [],
})

const norm = (value) => String(value ?? '').trim().toLowerCase()

const boolText = (value) => {
    const v = norm(value)
    if (['1', 'true', 'yes', 'y', '鏄?', '是'].includes(v) || value === true) {
        return t('Yes')
    }
    if (['0', 'false', 'no', 'n', '鍚?', '否'].includes(v) || value === false) {
        return t('No')
    }
    return '-'
}

const genderText = computed(() => {
    const v = norm(patient.value.gender)
    if (['male', 'm', '男', '鐢?'].includes(v)) {
        return t('Male')
    }
    if (['female', 'f', '女', '濂?'].includes(v)) {
        return t('Female')
    }
    return patient.value.gender || '-'
})

const valueOrDash = (value) => {
    const str = String(value ?? '').trim()
    return str ? str : '-'
}

const basicInfoFields = computed(() => [
    { label: t('PatientNewFormName'), value: valueOrDash(patient.value.name) },
    { label: t('PatientNewFormGender'), value: genderText.value },
    { label: t('PatientInfoPageAge'), value: valueOrDash(patient.value.age) },
    { label: t('PatientNewFormBirthday'), value: valueOrDash(patient.value.birthday) },
    { label: t('PatientNewFormIDCard'), value: valueOrDash(patient.value.id_card) },
    { label: t('PatientNewFormHomeAddress'), value: valueOrDash(patient.value.location) },
    { label: t('PatientNewFormPatientIdentificationNumber'), value: valueOrDash(patient.value.identifier) },
    { label: t('PatientNewFormSubmissionUnit'), value: valueOrDash(patient.value.inspection_agency) },
    { label: t('PatientNewFormTreatingPhysician'), value: valueOrDash(patient.value.medical_doctor) },
])

const clinicalInfoFields = computed(() => [
    { label: t('PatientNewFormClinicalDiagnosis'), value: valueOrDash(patient.value.diagnosis) },
    { label: t('PatientNewFormTumorStaging'), value: valueOrDash(patient.value.tumor_stage) },
    { label: t('PatientNewFormGeneticDisease'), value: valueOrDash(patient.value.disease) },
    {
        label: t('Gestation'),
        value: patient.value.gestation ? `${patient.value.gestation}${t('Week')}` : '-',
    },
    { label: t('PregnancyStatus'), value: valueOrDash(patient.value.pregnancy_status) },
    { label: t('PatientNewFormFamilyHistory'), value: valueOrDash(patient.value.family_history) },
    { label: t('PatientNewFormDrugUsingHistory'), value: valueOrDash(patient.value.medication_history) },
    { label: t('PatientNewFormSmoking'), value: boolText(patient.value.smoking) },
    { label: t('PatientNewFormAlcoholDrinking'), value: boolText(patient.value.drinking) },
    { label: t('PatientNewFormViralInfection'), value: boolText(patient.value.viral_infection) },
])

const otherInfoFields = computed(() => [
    { label: t('PatientNewFormTreatmentHistory'), value: valueOrDash(patient.value.treatment_history) },
    { label: t('PatientNewFormPrognosisInformation'), value: valueOrDash(patient.value.prognosis) },
    { label: t('PatientNewFormPrognosisTime'), value: valueOrDash(patient.value.prognosis_time) },
    { label: t('PatientNewFormTimeToRelapse'), value: valueOrDash(patient.value.recurrence_time) },
    { label: t('PatientNewFormSurvivalTime'), value: valueOrDash(patient.value.survival_time) },
    {
        label: t('PatientNewFormGeneralPathologyNumber'),
        value: valueOrDash(patient.value.general_pathology_number),
    },
    {
        label: t('PatientNewFormMolecularPathologyNumber'),
        value: valueOrDash(patient.value.molecular_pathology_number),
    },
    { label: t('PatientNewFormSubmittingDepartment'), value: valueOrDash(patient.value.submitting_department) },
    { label: t('PatientNewFormPatientPhoneNumber'), value: valueOrDash(patient.value.patient_phone_number) },
    {
        label: t('PatientNewFormOutpatientInpatientNumber'),
        value: valueOrDash(patient.value.outpatient_or_inpatient_number),
    },
    { label: t('PatientNewFormBedNumber'), value: valueOrDash(patient.value.bed_number) },
])

onMounted(() => {
    apiGetById('patient', props.id, (res) => {
        patient.value = {
            ...patient.value,
            ...(res?.data?.results?.[0] || {}),
            samplemeta_set: res?.data?.results?.[0]?.samplemeta_set || [],
        }
    })
})
</script>

<style scoped>
.patient-info-card {
    width: 100%;
}

.section-block {
    padding-top: 8px;
    padding-bottom: 8px;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2d3d;
    margin-bottom: 6px;
}

.field-grid {
    display: grid;
    gap: 8px;
}

.grid-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.field-item {
    border: 1px solid #d9e0ea;
    border-radius: 6px;
    background: #fafbfd;
    padding: 6px 8px;
    min-height: 50px;
}

.field-label {
    color: #5f6b7a;
    font-size: 11px;
    line-height: 1.2;
    margin-bottom: 3px;
}

.field-value {
    color: #1f2d3d;
    font-size: 13px;
    line-height: 1.35;
    word-break: break-word;
}

@media (max-width: 1400px) {
    .grid-4 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 980px) {
    .grid-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .grid-4 {
        grid-template-columns: 1fr;
    }
}
</style>
