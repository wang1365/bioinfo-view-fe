<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{ $t('DataNewFormTitle') }}</q-toolbar-title>
            <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>
        <q-separator></q-separator>
        <q-form @submit="save">
            <q-card-section>
                <q-list>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.project_index"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('DataNewFormDataDetails')"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.library_number"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('DataNewFormLibraryNumber')"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <panel-list
                                    :label="'*'+$t('DataNewFormCaptureKit')"
                                    filled
                                    label-color="primary"
                                    v-model="form.reagent_box"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                />
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-mx-sm">
                                <q-input
                                    type="number"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    v-model="form.library_input"
                                    :rules="[ val => val > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*'+$t('DataNewFormLibraryConstructionInput')"
                                />
                            </div>
                            <div class="col q-pf-sm">
                                <q-input
                                    v-model="form.index_type"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('DataNewFormIndexType')"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.index_number"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('DataNewFormIndexNumber')"
                                />
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-mx-sm">
                                <q-input
                                    type="number"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    v-model="form.hybrid_input"
                                    :rules="[ val => val > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('DataNewFormHybridInput')"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.nucleic_break_type"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*'+$t('DataNewFormNucleicAcidFragmentationMethod')"
                                />
                            </div>

                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.identifier"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="$t('DataNewFormDataIdentificationNumber')"
                                    :readonly="true"
                                />
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.company"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*'+$t('DataNewFormSubmissionUnit')"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <q-select
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    v-model="form.nucleic_type"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :options="nucleic_type_options"
                                    :label="$t('DataNewFormTypeOfNucleicAcids')"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <q-select
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    v-model="form.nucleic_level"
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :options="nucleic_level_options"
                                    :label="$t('DataNewFormDegradationGradeOfNucleicAcids')"
                                />
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-between">
                            <div class="col q-mx-sm">
                                <q-checkbox
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    v-model="form.risk"
                                    :label="$t('DataNewFormRiskSequencing')"
                                    color="primary"
                                    filled
                                    stack-label
                                    label-color="primary"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <q-input
                                    @click="showLinkSample = true"
                                    readonly
                                    stack-label
                                    filled
                                    label-color="primary"
                                    v-model="form.sample_identifier"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*'+$t('DataNewFormSampleIdentificationNumber')"
                                />
                            </div>
                            <div class="col q-mx-sm">
                                <q-input
                                    @click="showLinkSample = true"
                                    readonly
                                    stack-label
                                    filled
                                    label-color="primary"
                                    v-model="form.sample_meta_id"
                                    :rules="[ val => val > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*'+$t('DataNewFormSampleID')"
                                />
                            </div>
                        </div>
                    </q-item>
                    <q-item>
                        <div class="row full-width justify-between">
                            <q-checkbox
                                v-model="form.fastq_merge_required"
                                :label="$t('DataNewFormDataMergeRequired')"
                            />
                        </div>
                    </q-item>
                    <q-item v-if="form.fastq_merge_required === false">
                        <div class="row full-width justify-between">
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.fastq1_path"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*'+$t('DataNewFormDataNameOfR1')"
                                    stack-label
                                    filled
                                    label-color="primary"
                                ></q-input>
                            </div>
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.fastq2_path"
                                    :rules="[ val => val.length > 0 || $t('NotAllowEmpty') ]"
                                    :label="'*'+$t('DataNewFormDataNameOfR2')"
                                    stack-label
                                    filled
                                    label-color="primary"
                                ></q-input>
                            </div>
                        </div>
                    </q-item>
                    <q-item v-else>
                        <div class="row full-width justify-between">
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.fastq1_path_list"
                                    :rules="fastqListRule"
                                    :label="'*'+$t('DataNewFormDataNameListOfR1')"
                                    stack-label
                                    filled
                                    label-color="primary"
                                ></q-input>
                            </div>
                            <div class="col q-mx-sm">
                                <q-input
                                    v-model="form.fastq2_path_list"
                                    :rules="fastqListRule"
                                    :label="'*'+$t('DataNewFormDataNameListOfR2')"
                                    stack-label
                                    filled
                                    label-color="primary"
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
                            <q-btn :label="$t('DataNewFormClose')" @click="close()" />
                            <q-btn color="primary" :label="$t('DataNewFormSave')" @click="save()" />
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-form>
        <q-dialog persistent v-model="showLinkSample">
            <SampleList :linkId="0" @itemSelected="linkSample($event)" />
        </q-dialog>
    </q-card>
</template>
<script setup>
import { ref, defineEmits } from 'vue';
import { useApi } from 'src/api/apiBase';
import { infoMessage } from 'src/utils/notify';
import SampleList from './SampleList.vue';
import PanelList from 'src/pages/main/settings/flow/components/PanelList';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();

const nucleic_level_options = ref(['A', 'B', 'C', 'D']);
const nucleic_type_options = ref(['gDNA', 'cfDNA', 'RNA']);
const { apiPost } = useApi();

const emit = defineEmits(['refresh']);

const showLinkSample = ref(false);

const linkSample = (event) => {
    form.value.sample_meta_id = event.id;
    form.value.sample_identifier = event.identifier;
    showLinkSample.value = false;
};

const showLinkProject = ref(false);

const linkProject = (event) => {
    form.value.project_index = event.name;
    showLinkProject.value = false;
};
const close = () => {
    emit('refresh');
};
const defaultInputMessage = computed(() => {
    return t('Required');
});

const test_data = {
    'project_index': '111',
    'library_number': '222',
    'reagent_box': 'NanOnco Plus Panel v3.0',
    'nucleic_break_type': '水电费',
    'library_input': '111',
    'index_type': '111',
    'index_number': '13232',
    'hybrid_input': '1',
    'risk': true,
    'nucleic_level': 'A',
    'sample_meta_id': 215,
    'sample_identifier': 'S00000215',
    'identifier': '',
    'company': '胜多负少',
    'nucleic_type': 'gDNA',
    'fastq1_path': '',
    'fastq2_path': '',
    'fastq_merge_required': true
    , 'fastq1_path_list': '12.gz,11.gz',
    'fastq2_path_list': '21.gz,22.gz'
}
// 切换测试数据
const use_test_data = false
const form = ref(use_test_data ? test_data :
    {
    project_index: '',
    library_number: '',
    reagent_box: '',
    nucleic_break_type: '',
    library_input: '',
    index_type: '',
    index_number: '',
    hybrid_input: '',
    risk: true,
    nucleic_level: 'A',
    sample_meta_id: '',
    sample_identifier: '',
    identifier: '',
    company: '',
    nucleic_type: 'gDNA',
    fastq_merge_required: false, // 是否需要进行fastq文件合并
    fastq1_path_list: '', // 合并前的fastq1文件列表，逗号分割
    fastq2_path_list: '', // 合并前的fastq2文件列表，逗号分割
    fastq1_path: '',      // 无需合并时，为手动输入的fastq1文件；需要合并时，自动生成合并后的文件名
    fastq2_path: '',      // 无需合并时，为手动输入的fastq2文件；需要合并时，自动生成合并后的文件名
})

const save = async () => {
    const data = {
        project_index: form.value.project_index,
        library_number: form.value.library_number,
        reagent_box: form.value.reagent_box,
        nucleic_break_type: form.value.nucleic_break_type,
        library_input: form.value.library_input,
        index_type: form.value.index_type,
        index_number: form.value.index_number,
        hybrid_input: form.value.hybrid_input,
        risk: form.value.risk,
        nucleic_level: form.value.nucleic_level,
        sample_meta_id: form.value.sample_meta_id,
        sample_identifier: form.value.sample_identifier,
        identifier: form.value.identifier,
        company: form.value.company,
        nucleic_type: form.value.nucleic_type,
        fastq1_path: form.value.fastq1_path,
        fastq2_path: form.value.fastq2_path,
        fastq_merge_required: form.value.fastq_merge_required, // 是否需要进行fastq文件合并
        fastq1_path_list: form.value.fastq1_path_list, // 合并前的fastq1文件列表，逗号分割
        fastq2_path_list: form.value.fastq2_path_list // 合并前的fastq2文件列表，逗号分割
    };

    if (data.fastq_merge_required) {
        data.fastq1_path = '';
        data.fastq2_path = '';
    } else {
        data.fastq1_path_list = '';
        data.fastq2_path_list = '';
    }

    $q.loading.show();
    apiPost(
        '/sample/samples/',
        (_) => {
            infoMessage(t('Success'));
            emit('refresh');
        },
        data,
        null
        // (res) => {
        //     const errorDetail = res.data;
        //     for (const key in errorDetail) {
        //         console.log(errorDetail[key][0])
        //     }
        // },
    ).finally(() => $q.loading.hide());


};

const fastqListRule = (val) => {
    const r1 = !form.value.fastq_merge_required || val.length > 0 || t('NotAllowEmpty');
    return [r1];
};
</script>
