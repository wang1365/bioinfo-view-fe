<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{ $t('SampleEditFormTitle') }}</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-form @submit="save">
            <q-card-section>
                <q-list>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-pr-sm">
                                <q-input
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormSamplingDate')+'(YYYY-MM-DD)'"
                                    v-model="form.sample_date"
                                    readonly outlined label-color="primary"
                                >
                                    <template v-slot:prepend><span class="text-red">*</span></template>
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
                                    readonly outlined label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormSubmissionDate')+'(YYYY-MM-DD)'"
                                    v-model="form.test_date"
                                >
                                    <template v-slot:prepend><span class="text-red">*</span></template>
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
                                <q-input outlined label-color="primary"
                                    v-model="form.sample_componet"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormSamplingSite')"
                                ><template v-slot:prepend><span class="text-red">*</span></template></q-input>
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-pr-sm">
                                <q-select
                                    v-model="form.sample_type"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    use-input outlined label-color="primary"
                                    input-debounce="0"
                                    @new-value="createValue"
                                    :options="sampleTypeOptions"
                                    :label="$t('SampleNewFormSampleType')"
                                ><template v-slot:prepend><span class="text-red">*</span></template></q-select>
                            </div>
                            <div class="col q-pf-sm">
                                <q-input
                                    type="number" outlined label-color="primary"
                                    v-model="form.panel_proportion"
                                    :rules="[ val => val !== null || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormTumorContent')"
                                ></q-input>
                            </div>
                            <div class="col q-px-sm">
                                <q-checkbox
                                    v-model="form.is_panel"
                                    :label="$t('SampleNewFormTumorSample')"
                                    color="primary" class="text-primary"
                                    left-label outlined label-color="primary"
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
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormSampleIdentificationNumber')"
                                    :readonly="true" outlined label-color="primary"
                                />
                            </div>
                            <div class="col q-pr-sm cursor-pointer">
                                <q-input
                                    @click="showLinkPatient=true"
                                    readonly outlined label-color="primary"
                                    v-model="form.patient_id"
                                    :rules="[ val => val > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormPatientID')"
                                ><template v-slot:prepend><span class="text-red">*</span></template></q-input>
                            </div>
                            <div class="col q-pr-sm">
                                <q-input
                                    @click="showLinkPatient=true"
                                    readonly outlined label-color="primary"
                                    v-model="form.patient_identifier"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormPatientIdentificationNumber')"
                                />
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-start">
                            <div class="col-4 q-pr-sm">
                                <q-input outlined label-color="primary"
                                         v-model="form.sampling_tube_brand"
                                         stack-label
                                         :label="$t('SamplingTubeBrand')"
                                ></q-input>
                            </div>
                            <div class="col-4 q-pr-sm">
                                <q-input outlined label-color="primary"
                                         stack-label
                                         v-model="form.specimen_type"
                                         :label="$t('SpecimenType')"
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
                        <q-card-section class="q-gutter-x-sm">
                            <q-btn :label="$t('SampleNewFormClose')" @click="close()" />
                            <q-btn color="primary" type="submit" :label="$t('SampleNewFormSave')" />
                        </q-card-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-form>
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
import { ref, defineEmits, onMounted } from 'vue';
import { useApi } from 'src/api/apiBase';
import { infoMessage } from 'src/utils/notify';
import PatientsList from './PatientList.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

const { apiPost } = useApi();
const { apiGet, apiPut } = useApi();
const emit = defineEmits(['refresh']);
const showLinkPatient = ref(false);
const linkPatient = (event) => {
    showLinkPatient.value = false;
    form.value.patient_id = event.id;
    form.value.patient_identifier = event.identifier;
};
const sampleTypeOptions = computed(() => [t('SampleFormTypeFFPE'), t('SampleFormTypeFreshTissue'), t('SampleFormTypeBlood'), t('SampleFormTypeCerebrospinal'), t('SampleFormTypePleuralEffusion'), t('SampleFormTypeOtherBodyFluids'), t('SampleFormTypeBoneMarrow')]);
const createValue = (val, done) => {
    if (val.length > 0) {
        if (!sampleTypeOptions.value.includes(val)) {
            sampleTypeOptions.value.push(val);
            // form.value.sample_type = val
        }
        done(val, 'toggle');
    }
};
const close = () => {
    emit('refresh');
};
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});

const form = ref({
    sample_date: '',
    test_date: '',
    sample_componet: '',
    sample_type: '',
    panel_proportion: 1,
    is_panel: false,
    patient_id: '',
    patient_identifier: '',
    identifier: '',
    sampling_tube_brand: '',
    specimen_type: ''
});

onMounted(() => {
    apiGet(`/sample/sampledatas/${props.id}/`, (res) => {
        console.log(res);
        form.value = res.data;
        form.value.patient_id = res.data.patient.id;
        form.value.patient_identifier = res.data.patient.identifier;
    });
});

const save = async () => {
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
        sampling_tube_brand: form.value.sampling_tube_brand,
        specimen_type: form.value.specimen_type
    }

    apiPut(
        `/sample/sampledatas/${props.id}/`,
        (_) => {
            infoMessage(t('Success'));
            emit('refresh');
        },
        data,
        null,
        (res) => {
            const errorDetail = res.data;
            for (const key in errorDetail) {
                console.log(errorDetail[key][0])
            }
        },
    );
};
</script>
