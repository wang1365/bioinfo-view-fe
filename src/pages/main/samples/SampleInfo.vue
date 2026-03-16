<template>
    <q-card style="width: 700px; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{ $t('SampleInfoPageTitle') }}</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-card-section>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{$t('SampleNewFormSamplingDate')}}: {{ form.sample_date }}</div>
                <div class="col q-pa-sm">{{$t('SampleNewFormSubmissionDate')}}: {{ form.test_date }}</div>
                <div class="col q-pa-sm">{{$t('SampleNewFormSamplingSite')}}: {{ form.sample_componet }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">{{$t('SampleNewFormSampleType')}}: {{ form.sample_type }}</div>
                <div class="col q-pa-sm">{{$t('SampleNewFormTumorContent')}}: {{ form.panel_proportion }}</div>
                <div class="col q-pa-sm">{{$t('SampleNewFormTumorSample')}}: {{ form.is_panel }}</div>
            </div>
             <div class="row q-my-sm">
                 <div class="col q-pa-sm">{{$t('SampleNewFormSampleIdentificationNumber')}}: {{ form.identifier }}</div>
                 <div class="col q-pa-sm">{{$t('SampleNewFormPatientID')}}: {{ form.patient_id }}</div>
                 <div class="col q-pa-sm">{{$t('SampleNewFormPatientIdentificationNumber')}}: {{ form.patient_identifier}}</div>
             </div>
            <div class="row q-my-sm">
                <div class="col-4 q-pa-sm">{{$t('SamplingTubeBrand')}}: {{ form.sampling_tube_brand }}</div>
                <div class="col-4 q-pa-sm">{{$t('SpecimenType')}}: {{ form.specimen_type }}</div>
                <div class="col-4 q-pa-sm">{{$t('SampleNewFormNCSample')}}: {{ displayNcSample(form.is_nc_sample) }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col-4 q-pa-sm">{{$t('SampleNewFormTagLabel')}}: {{ form.tag_label || '-' }}</div>
            </div>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-list>
                <q-item>
                    <q-section class="q-gutter-x-sm">
                        <q-btn color="primary" :label="$t('Close')" v-close-popup />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
    </q-card>
</template>
<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useApi } from "src/api/apiBase";
import { useI18n } from "vue-i18n";

const { apiGet } = useApi();
const emit = defineEmits(["refresh"]);
const { t } = useI18n();

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});

const form = ref({
    sample_date: "2022-09-01",
    test_date: "2022-09-01",
    sample_componet: "sample_componet",
    sample_type: "sample_type",
    panel_proportion: 1,
    is_panel: false,
    patient_id: "patient_id",
    patient_identifier: "patient_identifier",
    identifier: "identifier",
    sampling_tube_brand: '',
    specimen_type: '',
    is_nc_sample: null,
    tag_label: '',
});

const displayNcSample = (value) => {
    if (value === true) return t('Yes');
    if (value === false) return t('No');
    return '-';
};
onMounted(() => {
    apiGet(`/sample/sampledatas/${props.id}/`, (res) => {
        console.log(res);
        form.value = res.data;
        form.value.patient_id=res.data.patient.id
        form.value.patient_identifier=res.data.patient.identifier
    });
});
</script>
