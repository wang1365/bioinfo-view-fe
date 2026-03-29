<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{ $t('DataInfoPageTitle') }}</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator color="primary" />
        <q-card-section>
            <q-list dense>
                <q-item>
                    <div class="row full-width justify-between q-col-gutter-md">
                        <div class="col">
                            <q-input
                                v-model="form.project_index"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormDataDetails')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.library_number"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormLibraryNumber')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.reagent_box"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormCaptureKit')"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between q-col-gutter-md">
                        <div class="col">
                            <q-input
                                v-model="form.library_input"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormLibraryConstructionInput')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.index_type"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormIndexType')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.index_number"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormIndexNumber')"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between q-col-gutter-md">
                        <div class="col">
                            <q-input
                                v-model="form.hybrid_input"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormHybridInput')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.nucleic_break_type"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormNucleicAcidFragmentationMethod')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.identifier"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormDataIdentificationNumber')"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between q-col-gutter-md">
                        <div class="col">
                            <q-input
                                v-model="form.company"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormSubmissionUnit')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.nucleic_type"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormTypeOfNucleicAcids')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.nucleic_level"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormDegradationGradeOfNucleicAcids')"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between q-col-gutter-md">
                        <div class="col-2 content-center">
                            <q-checkbox
                                v-model="form.risk"
                                disable
                                :label="$t('DataNewFormRiskSequencing')"
                                color="primary"
                            />
                        </div>
                        <div class="col-2 content-center">
                            <q-checkbox v-model="form.msre" disable label="MSRE" color="primary" />
                        </div>
                        <div class="col-4">
                            <q-input
                                v-model="form.sample_identifier"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormSampleIdentificationNumber')"
                            />
                        </div>
                        <div class="col-4">
                            <q-input
                                v-model="form.sample_meta_id"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormSampleID')"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between q-col-gutter-md">
                        <div class="col">
                            <q-input
                                v-model="form.tag_label"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormTagLabel')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.fastq1_path"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormDataNameOfR1')"
                            />
                        </div>
                        <div class="col">
                            <q-input
                                v-model="form.fastq2_path"
                                stack-label
                                readonly
                                label-color="primary"
                                :label="$t('DataNewFormDataNameOfR2')"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item v-if="form.fastq_merge_required === true">
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">
                            <q-input
                                class="primary"
                                :label="$t('DataNewFormDataNameListOfR1') + ' :'"
                                label-color="primary"
                                :model-value="form.fastq1_path_list"
                            />
                        </div>
                        <div class="col q-pa-sm">
                            <q-input
                                class="primary"
                                :label="$t('DataNewFormDataNameListOfR2') + ' :'"
                                label-color="primary"
                                :model-value="form.fastq2_path_list"
                            />
                        </div>
                    </div>
                </q-item>
            </q-list>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-list>
                <q-item>
                    <q-section class="q-gutter-x-sm">
                        <q-btn :label="$t('Close')" v-close-popup />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
    </q-card>
</template>
<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useApi } from "src/api/apiBase";

const { apiGet } = useApi();
const emit = defineEmits(["refresh"]);

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});

const form = ref({
    project_index: "project_index",
    library_number: "library_number",
    reagent_box: "reagent_box",
    nucleic_break_type: "nucleic_break_type",
    library_input: "library_input",
    index_type: "index_type",
    index_number: "index_number",
    hybrid_input: "hybrid_input",
    risk: true,
    nucleic_level: "A",
    sample_meta_id: "sample_meta_id",
    sample_identifier: "sample_identifier",
    identifier: "identifier",
    tag_label: "",
    company: "company",
    nucleic_type: "gDNA",
    msre: false,
    fastq_merge_required: false,
    fastq1_path: "fastq1_path",
    fastq2_path: "fastq2_path",
    fastq1_path_list: "fastq1_path",
    fastq2_path_list: "fastq2_path",
});
onMounted(() => {
    apiGet(`/sample/samples/${props.id}/`, (res) => {
        console.log(res);
        form.value = res.data;
    });
});
</script>
