<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{ $t('DataInfoPageTitle') }}</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-card-section>
            <q-list>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">{{$t('DataNewFormDataDetails')}}: {{ form.project_index }}</div>
                        <div class="col q-pa-sm">{{$t('DataNewFormLibraryNumber')}}: {{ form.library_number }}</div>
                        <div class="col q-pa-sm">{{$t('DataNewFormCaptureKit')}}: {{ form.reagent_box }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">
                            {{$t('DataNewFormLibraryConstructionInput')}}: {{ form.library_input }}
                        </div>
                        <div class="col q-pa-sm">{{$t('DataNewFormIndexType')}}: {{ form.index_type }}</div>
                        <div class="col q-pa-sm">{{$t('DataNewFormIndexNumber')}}: {{ form.index_number }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">{{$t('DataNewFormHybridInput')}}: {{ form.hybrid_input }}</div>
                        <div class="col q-pa-sm">
                            {{$t('DataNewFormNucleicAcidFragmentationMethod')}}: {{ form.nucleic_break_type }}
                        </div>
                        <div class="col q-pa-sm">
                            {{$t('DataNewFormDataIdentificationNumber')}}: {{ form.sample_meta_id }}
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">{{$t('DataNewFormSubmissionUnit')}}: {{ form.sample_identifier }}</div>
                        <div class="col q-pa-sm">{{$t('DataNewFormTypeOfNucleicAcids')}}: {{ form.identifier }}</div>
                        <div class="col q-pa-sm">
                            {{$t('DataNewFormDegradationGradeOfNucleicAcids')}}: {{ form.company }}
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">
                            {{$t('DataNewFormRiskSequencing')}}: {{ form.risk ? $t('Yes') : $t('No') }}
                        </div>
                        <div class="col q-pa-sm">
                            {{$t('DataNewFormSampleIdentificationNumber')}}: {{ form.nucleic_type }}
                        </div>
                        <div class="col q-pa-sm">{{$t('DataNewFormSampleID')}}: {{ form.nucleic_level }}</div>
                    </div>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pa-sm">{{$t('DataNewFormDataNameOfR1')}}: {{ form.fastq1_path }}</div>
                        <div class="col q-pa-sm">{{$t('DataNewFormDataNameOfR2')}}: {{ form.fastq2_path }}</div>
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
    company: "company",
    nucleic_type: "gDNA",
    fastq1_path: "fastq1_path",
    fastq2_path: "fastq2_path",
});
onMounted(() => {
    apiGet(`/sample/samples/${props.id}/`, (res) => {
        console.log(res);
        form.value = res.data;
    });
});
</script>
