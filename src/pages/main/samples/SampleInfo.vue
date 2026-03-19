<template>
    <q-card class="sample-info-card">
        <q-card-section class="section-block">
            <div class="header-row">
                <div class="section-title">{{ $t('SampleInfoPageTitle') }}</div>
                <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
            </div>
            <q-separator size="2px" class="bg-primary q-mb-sm" />

            <div class="field-grid grid-4">
                <div class="field-item" v-for="item in sampleFields" :key="item.label">
                    <div class="field-label">{{ item.label }}</div>
                    <div class="field-value">{{ item.value }}</div>
                </div>
            </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-py-sm">
            <q-btn color="primary" :label="$t('Close')" v-close-popup />
        </q-card-actions>
    </q-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useApi } from 'src/api/apiBase'
import { useI18n } from 'vue-i18n'

const { apiGet } = useApi()
const { t } = useI18n()

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const form = ref({
    sample_date: '',
    test_date: '',
    sample_componet: '',
    sample_type: '',
    panel_proportion: '',
    is_panel: false,
    patient_id: '',
    patient_identifier: '',
    identifier: '',
    sampling_tube_brand: '',
    specimen_type: '',
    is_nc_sample: null,
    tag_label: '',
})

const valueOrDash = (value) => {
    const str = String(value ?? '').trim()
    return str ? str : '-'
}

const boolText = (value) => {
    const str = String(value ?? '').trim().toLowerCase()
    if (value === true || ['true', '1', 'yes', 'y', '是', '鏄?'].includes(str)) {
        return t('Yes')
    }
    if (value === false || ['false', '0', 'no', 'n', '否', '鍚?'].includes(str)) {
        return t('No')
    }
    return '-'
}

const sampleFields = computed(() => [
    { label: t('SampleNewFormSamplingDate'), value: valueOrDash(form.value.sample_date) },
    { label: t('SampleNewFormSubmissionDate'), value: valueOrDash(form.value.test_date) },
    { label: t('SampleNewFormSamplingSite'), value: valueOrDash(form.value.sample_componet) },
    { label: t('SampleNewFormSampleType'), value: valueOrDash(form.value.sample_type) },
    { label: t('SampleNewFormTumorContent'), value: valueOrDash(form.value.panel_proportion) },
    { label: t('SampleNewFormTumorSample'), value: boolText(form.value.is_panel) },
    { label: t('SampleNewFormSampleIdentificationNumber'), value: valueOrDash(form.value.identifier) },
    { label: t('SampleNewFormPatientID'), value: valueOrDash(form.value.patient_id) },
    { label: t('SampleNewFormPatientIdentificationNumber'), value: valueOrDash(form.value.patient_identifier) },
    { label: t('SamplingTubeBrand'), value: valueOrDash(form.value.sampling_tube_brand) },
    { label: t('SpecimenType'), value: valueOrDash(form.value.specimen_type) },
    { label: t('SampleNewFormNCSample'), value: boolText(form.value.is_nc_sample) },
    { label: t('SampleNewFormTagLabel'), value: valueOrDash(form.value.tag_label) },
])

onMounted(() => {
    apiGet(`/sample/sampledatas/${props.id}/`, (res) => {
        const data = res?.data || {}
        form.value = {
            ...form.value,
            ...data,
            patient_id: data?.patient?.id ?? data?.patient_id ?? '',
            patient_identifier: data?.patient?.identifier ?? data?.patient_identifier ?? '',
        }
    })
})
</script>

<style scoped>
.sample-info-card {
    width: 980px;
    max-width: 92vw;
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

@media (max-width: 1200px) {
    .grid-4 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 840px) {
    .grid-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 560px) {
    .grid-4 {
        grid-template-columns: 1fr;
    }
}
</style>
