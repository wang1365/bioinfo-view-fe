<template>
    <q-card>
        <q-card-section>
            <div class="row q-gutter-xs justify-around">
                <sample-field :model-value="sample.patient.name" :label="$t('PatientName')" />
                <sample-field :model-value="sample.patient.age" :label="$t('PatientAge')" />
                <sample-field :model-value="sample.identifier" :label="$t('SampleIdentifier')" />
                <sample-field :model-value="sample.is_panel ? '√' : '×'" :label="$t('TumorSample')" />
                <sample-field :model-value="sample.panel_proportion" :label="$t('TumorContent')" />
                <sample-field :model-value="sample.patient_identifier" :label="$t('PatientIdentifier')" />
                <sample-field :model-value="sample.sample_componet" :label="$t('SamplingSite')" />
                <sample-field :model-value="sample.sample_date" :label="$t('SamplingDate')" />
                <sample-field :model-value="sample.sample_type" :label="$t('SampleType')" />
                <sample-field :model-value="sample.test_date" :label="$t(SubmissionDate')" />
            </div>
        </q-card-section>
    </q-card>
</template>
<script setup>
import {toRefs} from 'vue'
import SampleField from './SampleField'


const props = defineProps({
    sample: {
        required: true,
        default: null
    }
})

const {sample} = toRefs(props)
</script>
