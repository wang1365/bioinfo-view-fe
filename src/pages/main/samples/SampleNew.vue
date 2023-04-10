<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{ $t('SampleNewFormTitle') }}</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-card-section>
            <q-list>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-input
                                :error="errors.sample_date.error"
                                :error-message="errors.sample_date.message"
                                :label="'*'+$t('SampleNewFormSamplingDate')+'(YYYY-MM-DD)'"
                                v-model="form.sample_date"
                                readonly
                            >
                                <template v-slot:append>
                                    <q-icon color="primary" :ref="'sample_date'" name="event" class="cursor-pointer">
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
                                :error="errors.test_date.error"
                                :error-message="errors.test_date.message"
                                :label="'*'+$t('SampleNewFormSubmissionDate')+'(YYYY-MM-DD)'"
                                v-model="form.test_date"
                                readonly
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
                                :error="errors.sample_componet.error"
                                :error-message="errors.sample_componet.message"
                                :label="'*'+$t('SampleNewFormSamplingSite')"
                            ></q-input>
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-select
                                v-model="form.sample_type"
                                :error="errors.sample_type.error"
                                :error-message="errors.sample_type.message"
                                use-input
                                input-debounce="0"
                                @new-value="createValue"
                                :options="sampleTypeOptions"
                                :label="'*'+$t('SampleNewFormSampleType')"
                            />
                        </div>
                        <div class="col q-pf-sm">
                            <q-input
                                type="number"
                                v-model="form.panel_proportion"
                                :error="errors.panel_proportion.error"
                                :error-message="errors.panel_proportion.message"
                                :label="$t('SampleNewFormTumorContent')"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-checkbox
                                :error="errors.is_panel.error"
                                :error-message="errors.is_panel.message"
                                v-model="form.is_panel"
                                :label="$t('SampleNewFormTumorSample')"
                                color="primary"
                                left-label
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
                                :error="errors.identifier.error"
                                :error-message="errors.identifier.message"
                                :label="$t('SampleNewFormSampleIdentificationNumber')"
                                :readonly="true"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm cursor-pointer">
                            <q-input
                                @click="showLinkPatient=true"
                                readonly
                                v-model="form.patient_id"
                                :error="errors.patient_id.error"
                                :error-message="errors.patient_id.message"
                                :label="'*'+$t('SampleNewFormPatientID')"
                            ></q-input>
                        </div>
                        <div class="col q-pr-sm">
                            <q-input
                                @click="showLinkPatient=true"
                                readonly
                                v-model="form.patient_identifier"
                                :error="errors.patient_identifier.error"
                                :error-message="
                                    errors.patient_identifier.message
                                "
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
                        <q-btn color="primary" :label="$t('SampleNewFormSave')" @click="save()" />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
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
import { ref, defineEmits } from "vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import PatientsList from "./PatientList.vue";
import { useI18n } from "vue-i18n";
import { computed } from 'vue'
const { t } = useI18n();
const { apiPost } = useApi();

const emit = defineEmits(["refresh"]);
const showLinkPatient = ref(false);
const linkPatient = (event) => {
    showLinkPatient.value = false;
    form.value.patient_id = event.id
    form.value.patient_identifier = event.identifier
}
const rref = ref;

const sampleTypeOptions = computed(()=>[t('SampleFormTypeFFPE'), t('SampleFormTypeFreshTissue'), t('SampleFormTypeBlood'),])
const createValue = (val, done) => {
    if (val.length > 0) {
        if (!sampleTypeOptions.value.includes(val)) {
            sampleTypeOptions.value.push(val)
            // form.value.sample_type = val
        }
        done(val, 'toggle')
    }
}

const close = () => {
    emit("refresh");
};
const errors = ref({
    sample_date: {
        message: t('Required'),
        error: false,
    },
    test_date: {
        message: t('Required'),
        error: false,
    },
    sample_componet: {
        message: t('Required'),
        error: false,
    },
    sample_type: {
        message: t('Required'),
        error: false,
    },
    panel_proportion: {
        message: t('Required'),
        error: false,
    },
    is_panel: {
        message: t('Required'),
        error: false,
    },
    patient_id: {
        message: t('Required'),
        error: false,
    },
    patient_identifier: {
        message: t('Required'),
        error: false,
    },
    identifier: {
        message: t('Required'),
        error: false,
    },
});
const form = ref({
    sample_date: "",
    test_date: "",
    sample_componet: "",
    sample_type: "",
    panel_proportion: 1,
    is_panel: false,
    patient_id: "",
    patient_identifier: "",
    identifier: "",
});

const save = async () => {
    for (const key in errors.value) {
        errors.value[key].error = false;
        errors.value[key].message = t('Required');
    }
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
        "/sample/sampledatas/",
        (_) => {
            infoMessage(t('Success'));
            emit("refresh");
        },
        data,
        null,
        (res) => {
            const errorDetail = res.data;
            for (const key in errorDetail) {
                errors.value[key].error = true;
                errors.value[key].message = errorDetail[key][0];
            }
        }
    );
};
</script>
