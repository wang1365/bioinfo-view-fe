<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{ $t('SampleNewFormTitle') }}</q-toolbar-title>
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
                                    :label="'*' + $t('SampleNewFormSamplingDate') + '(YYYY-MM-DD)'"
                                    v-model="form.sample_date"
                                    readonly
                                    stack-label
                                >
                                    <template v-slot:append>
                                        <q-icon
                                            color="primary"
                                            :ref="'sample_date'"
                                            name="event"
                                            class="cursor-pointer"
                                        >
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
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*' + $t('SampleNewFormSubmissionDate') + '(YYYY-MM-DD)'"
                                    v-model="form.test_date"
                                    readonly
                                    stack-label
                                >
                                    <template v-slot:append>
                                        <q-icon color="primary" id="test_date" name="event" class="cursor-pointer">
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
                                <q-input
                                    v-model="form.sample_componet"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*' + $t('SampleNewFormSamplingSite')"
                                    stack-label
                                ></q-input>
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-pr-sm">
                                <q-select
                                    v-model="form.sample_type"
                                    use-input
                                    stack-label
                                    input-debounce="0"
                                    @new-value="createValue"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :options="sampleTypeOptions"
                                    :label="'*' + $t('SampleNewFormSampleType')"
                                />
                            </div>
                            <div class="col q-pf-sm">
                                <q-input
                                    type="number"
                                    v-model="form.panel_proportion"
                                    :rules="[ val => val !== null || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormTumorContent')"
                                    stack-label
                                />
                            </div>
                            <div class="col q-pr-sm">
                                <q-checkbox
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    v-model="form.is_panel"
                                    :label="$t('SampleNewFormTumorSample')"
                                    color="primary"
                                    left-label
                                    stack-label
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
                                    stack-label
                                    :label="$t('SampleNewFormSampleIdentificationNumber')"
                                    :readonly="true"
                                ></q-input>
                            </div>
                            <div class="col q-pr-sm cursor-pointer">
                                <q-input
                                    @click="showLinkPatient = true"
                                    readonly
                                    stack-label
                                    v-model="form.patient_id"
                                    :rules="[ val => val > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*' + $t('SampleNewFormPatientID')"
                                ></q-input>
                            </div>
                            <div class="col q-pr-sm">
                                <q-input
                                    @click="showLinkPatient = true"
                                    readonly
                                    stack-label
                                    v-model="form.patient_identifier"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('SampleNewFormPatientIdentificationNumber')"
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
                        <q-section class="q-gutter-x-sm">
                            <q-btn :label="$t('SampleNewFormClose')" @click="close()" />
                            <!--                            <q-btn color="primary" :label="$t('SampleNewFormSave')" @click="save()" />-->
                            <q-btn color="primary" type="submit" :label="$t('SampleNewFormSave')" />
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-form>
        <q-dialog persistent v-model="showLinkPatient">
            <PatientsList :linkId="0" @refresh="linkPatient($event);" />
        </q-dialog>
    </q-card>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { useApi } from 'src/api/apiBase';
import { infoMessage } from 'src/utils/notify';
import PatientsList from './PatientList.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();
const { apiPost } = useApi();

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

const form = ref({
    sample_date: '',
    test_date: '',
    sample_componet: '',
    sample_type: '',
    panel_proportion: null,
    is_panel: false,
    patient_id: '',
    patient_identifier: '',
    identifier: '',
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
    };

    apiPost(
        '/sample/sampledatas/',
        (_) => {
            infoMessage(t('Success'));
            emit('refresh');
        },
        data,
        null,
        (res) => {
            const errorDetail = res.data;
            for (const key in errorDetail) {
                console.log(errorDetail[key][0]);
            }
        },
    );
};
</script>
