<template>
    <div>
        <div class="row justify-end">
            <q-btn
                v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
                icon="bookmarks"
                size="small"
                color="primary"
                class="relative-position q-mr-md"
                :label="$t('ReportStickDone')"
                @click="reset()"
            />
            <q-btn
                v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
                icon="bookmarks"
                size="small"
                outline
                color="primary"
                class="relative-position  q-mr-md"
                @click="stickFilter()"
                :label="$t('ReportStickData')"
            />

            <q-btn
                icon="help_outline"
                size="small"
                outline
                color="orange"
                class="relative-position  q-mr-md"
                :label="$t('Intro')"
                @click="dlgVisible = !dlgVisible"
            />
        </div>

        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ $t('CopyNumberVariationAnalysis') }}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{ props.intro }}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">{{ $t('Close') }}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-splitter v-model="splitterModel" unit="px" before-class="">
            <template v-slot:before>
                <div
                    :class="['column', 'q-gutter-y-xs', 'q-pr-sm', { dimmed: viewConfig.stickDone }]"
                    style="width:100%"
                >
                    <q-input
                        v-model="innerSearchParams.geneSet"
                        :label="$t('GeneSet')"
                        readonly
                        dense
                        outlined
                        stack-label
                        class="full-width"
                        label-color="primary"
                    >
                        <template v-slot:append>
                            <q-btn padding="xs" size="sm" icon="edit" @click="openGeneSetDialog" />
                            <q-btn padding="xs" size="sm" icon="close" @click="innerSearchParams.geneSet = ''" />
                            <!-- <q-btn padding="xs" size="sm" icon="menu" /> -->
                        </template>
                    </q-input>
                    <q-checkbox v-model="innerSearchParams.excludeGensets" keep-color dense size="sm" color="primary">
                        <template v-slot:default>
                            <span class="text-primary">Exclude selected Gensets</span>
                        </template>
                    </q-checkbox>
                    <q-select
                        v-model="innerSearchParams.gene"
                        clearable
                        multiple
                        dense
                        outlined
                        hide-dropdown-icon
                        :options="searchOptions.gene_set"
                        :label="$t('Gene')"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        use-input
                        @filter="filterFunctions.gene_set"
                    />
                    <q-select
                        v-model="innerSearchParams.acmg"
                        clearable
                        multiple
                        dense
                        outlined
                        hide-dropdown-icon
                        :options="searchOptions.acmg_set"
                        :label="$t('ACMGPathogenicity')"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        use-input
                        @filter="filterFunctions.acmg_set"
                    />
                    <q-select
                        v-model="innerSearchParams.user_pathogenicity"
                        clearable
                        multiple
                        dense
                        outlined
                        hide-dropdown-icon
                        :options="verdictData.options"
                        :label="$t('UsersPathogenicity')"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        use-input
                        @filter="filterFunctions.user_pathogenicity_set"
                    />

                    <q-select
                        v-model="innerSearchParams.cnv_cover_type"
                        clearable
                        multiple
                        dense
                        outlined
                        hide-dropdown-icon
                        :options="searchOptions.cnv_cover_type_set"
                        :label="$t('CNVCoverType')"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        use-input
                        @filter="filterFunctions.cnv_cover_type_set"
                    />
                    <q-select
                        v-model="innerSearchParams.cnv_type"
                        clearable
                        multiple
                        dense
                        outlined
                        hide-dropdown-icon
                        :options="searchOptions.cnv_type_set"
                        :label="$t('CNVType')"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        use-input
                        @filter="filterFunctions.cnv_type_set"
                    />
                    <div class="row">
                        <div class="col-6">
                            <q-select
                                v-model="innerSearchParams.chromosome"
                                clearable
                                multiple
                                dense
                                outlined
                                hide-dropdown-icon
                                :options="searchOptions.chr_set"
                                :label="$t('Chromosome')"
                                stack-label
                                label-color="primary"
                                class="full-width "
                                use-input
                                @filter="filterFunctions.chr_set"
                            />
                        </div>
                        <div class="col-3">
                            <q-input
                                v-model="innerSearchParams.start"
                                dense
                                outlined
                                stack-label
                                class="full-width"
                                label-color="primary"
                                :label="$t('Start')"
                            >
                            </q-input>
                        </div>
                        <div class="col-3">
                            <q-input
                                v-model="innerSearchParams.end"
                                dense
                                outlined
                                stack-label
                                class="full-width"
                                label-color="primary"
                                :label="$t('End')"
                            >
                            </q-input>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <q-input
                                v-model="innerSearchParams.cnv_length_ge"
                                dense
                                outlined
                                class="full-width"
                                stack-label
                                label-color="primary"
                                :label="'CNV Length>='"
                            >
                                <template v-slot:append> bp</template>
                            </q-input>
                        </div>
                        <div class="col-6">
                            <div class="col-6">
                                <q-input
                                    v-model="innerSearchParams.cnv_length_le"
                                    dense
                                    outlined
                                    class="full-width"
                                    stack-label
                                    label-color="primary"
                                    :label="$t('CNV Length<=')"
                                >
                                    <template v-slot:append> bp</template>
                                </q-input>
                            </div>
                        </div>
                    </div>
                    <q-input
                        v-model="innerSearchParams.copy_number"
                        dense
                        outlined
                        class="col-3"
                        label-color="primary"
                        stack-label
                        :label="$t('CopyNumber')"
                    >
                    </q-input>
                    <div>
                        <div class="row q-gutter-x-sm">
                            <q-btn
                                color="primary"
                                :label="$t('Confirm')"
                                size="md"
                                dense
                                padding="sm"
                                icon="search"
                                @click="search"
                            />
                            <q-btn
                                color="primary"
                                :label="$t('Reset')"
                                size="md"
                                dense
                                padding="sm"
                                icon="settings_backup_restore"
                                @click="reset"
                            />
                            <q-btn
                                :href="tableFile"
                                :download="tableFileName"
                                :label="$t('Download')"
                                padding="sm"
                                dense
                                icon="download"
                                color="primary"
                                target="_blank"
                                size="md"
                                @click="downloadFile()"
                            />
                        </div>
                    </div>
                </div>
            </template>

            <template v-slot:after>
                <div style="position:relative">
                    <a-table
                        style="z-index:1"
                        :loading="loading"
                        :data-source="filteredRows"
                        :columns="columns"
                        :scroll="{ x: '100%', y: 650 }"
                        :custom-row="customRow"
                        :sticky="true"
                        rowKey="lineNumber"
                        :row-selection="rowSelection"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.dataIndex === 'expand'">
                                <div class="cursor-pointer" @click="record.expanded = !record.expanded">
                                    <q-icon
                                        :name="record.expanded ? 'unfold_less' : 'unfold_more'"
                                        :color="record.expanded ? 'purple' : 'primary'"
                                        size="sm"
                                    />
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'geneInfo'">
                                <q-scroll-area style="height: 300px;" v-if="record.expanded">
                                    <div
                                        class="text-weight-bolder text-green-5"
                                        v-for="item of record.gene_data"
                                        :key="item"
                                        @click="findCnvkit(item)"
                                    >
                                        {{ item }}
                                    </div>
                                    <div class="text-weight-bolder text-blue-5">
                                        {{ record.CNV_Cover_Type }}
                                    </div>
                                    <div class="text-weight-bolder text-orange-5">
                                        {{ record.Chr }}:{{ record.Start }}-{{ record.End }}
                                    </div>
                                    <div class="text-weight-bolder text-pink-5">
                                        {{ record.Chromosomal_Region }}
                                    </div>
                                    <div class="text-weight-bolder text-purple-5">
                                        {{ record.cnv_length_data }}
                                    </div>
                                </q-scroll-area>
                                <div v-if="!record.expanded">
                                    <div
                                        class="text-weight-bolder text-green-5"
                                        v-for="item of record.gene_data.slice(0, 2)"
                                        :key="item"
                                        @click="findCnvkit(item)"
                                    >
                                        {{ item }}
                                    </div>
                                    <div class="text-weight-bolder text-blue-5">
                                        {{ record.CNV_Cover_Type }}
                                    </div>
                                </div>
                                <div></div>
                            </template>
                            <template v-if="column.dataIndex === 'copyNumber'">
                                <div class="text-blue text-weight-bolder" v-if="record.CNV_Type == 'DUP'">
                                    {{ record.Copy_Number }} | {{ record.CNV_Type }}
                                </div>
                                <div class="text-red text-weight-bolder" v-if="record.CNV_Type == 'DEL'">
                                    {{ record.Copy_Number }} | {{ record.CNV_Type }}
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'geneRelatedDiseases'">
                                <q-scroll-area style="height: 300px;" v-if="record.expanded">
                                    <div v-for="item of record.gene_related_diseases_data" :key="item">
                                        {{ item }}
                                    </div>
                                </q-scroll-area>
                                <div v-if="!record.expanded">
                                    <div v-for="item of record.gene_related_diseases_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                            </template>

                            <template v-if="column.dataIndex === 'userVerdict'">
                                <div class="row justify-center">
                                    <template v-for="v in record.userVerdict" :key="v">
                                        <q-btn
                                            :label="v"
                                            color="primary"
                                            size="sm"
                                            outline
                                            padding="3px"
                                            class="q-ma-xs"
                                        />
                                    </template>
                                    <q-btn
                                        flat
                                        icon="people"
                                        size="sm"
                                        color="grey"
                                        padding="3px"
                                        @click="showVerdictDlg(record)"
                                    />
                                </div>
                                <!-- <div
                                    class="row"
                                    v-if="record.userVerdict.length == 0"
                                    @click="currentRow = record, userVerdictVisible = true"
                                >
                                    NA
                                </div>
                                <div class="row" v-if="record.userVerdict.length != 0">
                                    <q-chip
                                        @click="currentRow = record, userVerdictVisible = true"
                                        color="orange"
                                        outline
                                        square
                                        dense
                                        v-for="item of record.userVerdict"
                                        v-bind:key="item"
                                        >{{
                                            item }}</q-chip
                                    >
                                </div> -->
                            </template>
                            <template v-if="column.dataIndex === 'acmg'">
                                <div v-for="acmg in record.ACMG_result.split(';')" :key="acmg">
                                    <q-chip color="orange" outline square v-if='acmg !== "."' dense
                                        >{{
                                            acmg
                                        }}
                                    </q-chip>
                                </div>
                                <div>
                                    <span>
                                        <q-chip color="orange" outline square v-if='record.ACMG !== "."' dense>{{
                                                record.ACMG.replace(';', '/')
                                        }}</q-chip>
                                    </span>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'relatedHPOs'">
                                <q-scroll-area style="height: 300px;" v-if="record.expanded">
                                    <div v-for="item of record.hpo_data" :key="item">
                                        {{ item }}
                                    </div>
                                </q-scroll-area>
                                <div v-if="!record.expanded">
                                    <div v-for="item of record.hpo_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'dgv'">
                                <q-scroll-area style="height: 300px;" v-if="record.expanded">
                                    <div v-for="item of record.dgv_data" :key="item">
                                        {{ item }}
                                    </div>
                                </q-scroll-area>
                                <div v-if="!record.expanded">
                                    <div v-for="item of record.dgv_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'clinvar'">
                                <q-scroll-area style="height: 300px;" v-if="record.expanded">
                                    <div v-for="item of record.clinvar_data" :key="item">
                                        {{ item }}
                                    </div>
                                </q-scroll-area>
                                <div v-if="!record.expanded">
                                    <div v-for="item of record.clinvar_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'plot'">
                                <div class="row">
                                    <img
                                        :src="'/igv' + record.Plot.replace('//', '/')"
                                        alt="."
                                        class="cursor-pointer"
                                        style="width: 100px;height: 100px;"
                                        @click="clickDetail(record)"
                                    />
                                </div>
                            </template>
                            <!-- <template v-if="column.key === 'operation'">
                                <q-btn
                                    :label="$t('Detail')"
                                    color="primary"
                                    size="xs"
                                    outline
                                    padding="xs"
                                    class="q-mr-xs"
                                    @click="clickDetail(record)"
                                />
                                <q-btn
                                    label="IGV"
                                    color="primary"
                                    size="xs"
                                    outline
                                    padding="xs"
                                    @click="clickIgv(record)"
                                />
                            </template> -->
                        </template>
                    </a-table>
                </div>
            </template>
        </q-splitter>
        <q-dialog v-model="showDrawer" class="fit">
            <q-card style="width: 50%">
                <q-card-section>
                    <div class="q-col">
                        <div class="text-h6 q-mb-sm">{{ $t('MoreColumns') }}</div>
                        <div class="q-row-2">
                            <q-separator />
                            <q-scroll-area style="height: 500px">
                                <q-option-group
                                    :options="expandedColumns"
                                    type="checkbox"
                                    v-model="selectedExpandColIdx"
                                    @change="atOptionGroupChange"
                                    @update:model-value="atOptionGroupChange"
                                />
                            </q-scroll-area>
                            <q-separator />
                        </div>
                    </div>
                </q-card-section>

                <q-card-actions align="center">
                    <q-btn color="primary" @click="clickSelectAll">{{ $t('SelectAll') }}</q-btn>
                    <q-btn color="primary" @click="clickSelectNone">{{ $t('Clear') }}</q-btn>
                    <q-btn color="primary" v-close-popup>{{ $t('Confirm') }}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
    <q-dialog v-model="genesetEdit" persistent>
        <q-card style="min-width:500px;">
            <q-toolbar>
                <q-space />
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <div class="q-pa-md">
                <q-stepper v-model="geneSetStep" vertical color="primary" animated>
                    <q-step :name="1" :title="$t('InputGene')" icon="create_new_folder" :done="step > 1">
                        <div>Example: Gene1,Gene2,Gene3</div>
                        <div>
                            <q-input v-model="geneSetInput" label="" type="textarea" filled />
                        </div>
                        <q-stepper-navigation>
                            <q-btn @click="checkGeneSetInput" color="primary" label="Continue" />
                        </q-stepper-navigation>
                    </q-step>

                    <q-step :name="2" :title="$t('Verify')" icon="settings" :done="step > 2">
                        {{ geneSetMessage }}

                        <q-stepper-navigation>
                            <q-btn @click="geneSetStep = 1" color="primary" label="Back" />
                            <q-btn flat @click="confirmGeneSetInput" color="primary" label="Confirm" class="q-ml-sm" />
                        </q-stepper-navigation>
                    </q-step>
                </q-stepper>
            </div>
        </q-card>
    </q-dialog>

    <q-dialog class="q-py-sm" v-model="dialogVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <img :src="'/igv' + currentRow.Plot.replace('//', '/')" alt="." />
            </q-card-section>
            <q-card-actions align="center" vertical>
                <q-btn :label="$t('Close')" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>

    <q-dialog class="q-py-sm" v-model="userVerdictVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <h5>Select User Verdict</h5>
                <q-select
                    v-model="currentRow.userVerdict"
                    clearable
                    multiple
                    dense
                    outlined
                    hide-dropdown-icon
                    :options="['Pathogenic', 'Likely pathogenic', 'VUS++', 'VUS+', 'VUS', 'Likely benign', 'Benign']"
                    stack-label
                    label-color="primary"
                    class="full-width"
                    use-input
                />
            </q-card-section>
            <q-card-actions align="center" vertical>
                <q-btn :label="$t('Close')" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="verdictData.visible">
        <q-card class="q-pa-sm" style="width:50vw;height: 55vh;">
            <q-card-section>
                <div class="text-primary">{{ verdictData.record.geneIdentifier }}</div>
            </q-card-section>
            <q-card-section>
                <q-option-group v-model="verdictData.verdict" type="checkbox" :options="verdictData.options" />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn :label='$t("Confirm")' @click="onVerdictConfirm()" color="primary" />
                <q-btn :label='$t("Cancel")' color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="igvVisible">
        <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
            <Igv :taskId="props.task.id" :file="igvFile" />
        </q-card>
    </q-dialog>
</template>
<script setup>
import {ref, onMounted, toRef, toRefs, watch, computed, onUnmounted} from 'vue'
import {useComparator} from 'src/utils/comparator'
import {readTaskFile, readTaskMuFile} from 'src/api/task'
import {getCsvHeader, getCsvData, parseCsvToList} from 'src/utils/csv'
import {useRoute} from 'vue-router'
import {errorMessage, infoMessage} from 'src/utils/notify'
import {useI18n} from 'vue-i18n'
import {useCustomCell, WES_PARAMS} from './index'
import {setVerdictResult} from 'src/api/verdict'
import {getCurrentUsername} from 'src/utils/user'
import {listVerdictByPatient} from 'src/api/verdict'
import {globalStore} from 'src/stores/global'
import {useQuasar} from "quasar";


const store = globalStore()
const $q = useQuasar()
const {t} = useI18n()
const splitterModel = ref(300)
const userVerdictVisible = ref(false)
const genesetEdit = ref(false)
const geneSetStep = ref(1)
const geneSetMessage = ref("Ok")
const geneSetInput = ref("")
const geneSetOkValue = ref([])
const geneSetErrValue = ref([])
const verdictMap = ref({})
const customCell = useCustomCell('Report')
const dlgVisible = ref(false)

const emit = defineEmits(['stickDone', 'reset', 'filterChange'])

const selectedRows = ref([])
let selectedDefaultRows = ref([])

const verdictData = ref({
    visible: false,
    record: null,
    verdict: [],
    verdictMap: {},
    options: [
        {label: 'Pathogenic', value: 'pathogenic',},
        {label: 'Likely pathogenic', value: 'likely_pathogenic',},
        {label: 'VUS++', value: 'vus++',},
        {label: 'VUS+', value: 'vus+',},
        {label: 'VUS', value: 'vus',},
        {label: 'Likely benign', value: 'likely_benign',},
        {label: 'Benign', value: 'benign',},
    ]
})
const openGeneSetDialog = () => {
    genesetEdit.value = true
    geneSetInput.value = [...geneSetOkValue.value, ...geneSetErrValue.value].join(",")
}

function showVerdictDlg(record) {
    verdictData.value.visible = true
    verdictData.value.record = record
    verdictData.value.verdict = record.userVerdict || []
}

function onVerdictConfirm() {
    const username = getCurrentUsername()

    setVerdictResult(username, verdictData.value.record.geneIdentifier, verdictData.value.verdict)
    verdictMap.value.set(verdictData.value.record.geneIdentifier, verdictData.value.verdict)
    console.log(verdictData.value.record.geneIdentifier, verdictMap.value)

    verdictData.value.record.userVerdict = verdictData.value.verdict
    verdictData.value.visible = false
}

const checkGeneSetInput = () => {
    geneSetStep.value = 2
    let okValues = new Set()
    let errValues = new Set()

    for (const element of geneSetInput.value.split(",")) {
        let gene = element.trim()
        if (searchOptions.value.gene_set.indexOf(gene) > 0) {
            okValues.add(gene)
        } else if (gene.length > 0) {
            errValues.add(gene)
        }
    }
    geneSetOkValue.value = [...okValues]
    geneSetErrValue.value = [...errValues]
    if (geneSetErrValue.value.length == 0 && geneSetOkValue.value.length == 0) {
        geneSetMessage.value = "没有输入有效基因数据"
    } else if (geneSetErrValue.value.length != 0) {
        geneSetMessage.value = geneSetErrValue.value.join(",") + " " + t("NotInGeneList")
    } else {
        geneSetMessage.value = "OK"
    }
}

const confirmGeneSetInput = () => {
    innerSearchParams.value.geneSet = [...geneSetOkValue.value, ...geneSetErrValue.value].join(",")
    geneSetStep.value = 1;
    genesetEdit.value = false
}
const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    task: {
        type: Object,
        required: false,
    },
    showSticky: {
        type: Boolean,
        required: false,
        default: () => false,
    },

    stickDone: {
        type: Boolean,
        required: false,
        default: () => false,
    },
    rows: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    header: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    options: {
        type: Object,
        required: false,
        default() {
            return {
                mutationPosition: [],
                mutationMeaning: [],
                mutationRisk: [],
            }
        },
    },
    searchParams: {
        type: Object,
        required: false,
        default() {
            return {...WES_PARAMS}
        }
    },
    drugRows: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    selectedRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    selectedDefaultRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    defaultReportRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showCNVcircos: true,
                showCNVtable: true,
                showSticky: false,
                showCNVWES: false,
            }
        },
    },
    stepData: {
        type: Object,
        default: () => {
        }
    }
})

const route = useRoute()
const igvVisible = ref(false)
const igvFile = ref(null)
const dialogVisible = ref(false)
const samples = toRef(props, 'samples');
const originDataRows = ref([])
const {rows, drugRows, header} = toRefs(props)
const propSelectedRows = toRef(props, 'selectedRows')
const propSelectedDefaultRows = toRef(props, 'selectedDefaultRows')
const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')
const innerSearchParams = ref({
    geneSet: "",
    excludeGensets: false,
    gene: [],
    acmg: [],
    user_pathogenicity: [],
    cnv_cover_type: [],
    cnv_type: [],
    chromosome: [],
    start: "",
    end: "",
    cnv_length_ge: "",
    cnv_length_le: "",
    copy_number: ""
})

const showDrawer = ref(false)

const filteredRows = ref([])
const currentRow = ref({})


const search = () => {
    console.log(innerSearchParams.value)
    let resultRows = []
    for (const row of originDataRows.value) {
        // 判断 gene 是否包含

        if (innerSearchParams.value.geneSet.length > 0) {
            console.log(row.Gene.split(";"))
            console.log(new Set(innerSearchParams.value.geneSet))
            if (innerSearchParams.value.excludeGensets) {
                if (row.Gene.split(";").some(item => new Set(innerSearchParams.value.geneSet.split(",")).has(item))) {
                    continue
                }
            } else {
                if (!row.Gene.split(";").some(item => new Set(innerSearchParams.value.geneSet.split(",")).has(item))) {
                    continue
                }
            }
        }
        if (innerSearchParams.value.gene && innerSearchParams.value.gene.length > 0) {
            let geneSet = new Set(innerSearchParams.value.gene)
            if (!row.Gene.split(";").some(item => geneSet.has(item))) {
                continue
            }
        }
        // 是否包含 ACMG_result
        if (innerSearchParams.value.acmg && innerSearchParams.value.acmg.length > 0) {
            let acmgSet = new Set(innerSearchParams.value.acmg)
            if (!acmgSet.has(row.ACMG_result)) {
                continue
            }
        }
        // 是否包含CNV_Cover_Type
        if (innerSearchParams.value.cnv_cover_type && innerSearchParams.value.cnv_cover_type.length > 0) {
            let cnvCoverTypeSet = new Set(innerSearchParams.value.cnv_cover_type)
            if (!cnvCoverTypeSet.has(row.CNV_Cover_Type)) {
                continue
            }
        }
        // 是否包含 CNV_Type
        if (innerSearchParams.value.cnv_type && innerSearchParams.value.cnv_type.length > 0) {
            let cnvTypeSet = new Set(innerSearchParams.value.cnv_type)
            if (!cnvTypeSet.has(row.CNV_Type)) {
                continue
            }
        }
        // 是否包含 chromosome
        if (innerSearchParams.value.chromosome && innerSearchParams.value.chromosome.length > 0) {
            let chrSet = new Set(innerSearchParams.value.chromosome)
            if (!chrSet.has(row.Chr)) {
                continue
            }
        }

        if (innerSearchParams.value.start && !isNaN(Number.parseInt(innerSearchParams.value.start))) {
            if (!(Number.parseInt(row.Start) >= Number.parseInt(innerSearchParams.value.start))) {
                continue
            }
        }
        if (innerSearchParams.value.end && !isNaN(Number.parseInt(innerSearchParams.value.end))) {
            if (!(Number.parseInt(row.End) <= Number.parseInt(innerSearchParams.value.end))) {
                continue
            }
        }
        if (innerSearchParams.value.cnv_length_ge && !isNaN(Number.parseInt(innerSearchParams.value.cnv_length_ge))) {
            if (!(Number.parseInt(row.CNV_Length) >= Number.parseInt(innerSearchParams.value.cnv_length_ge))) {
                continue
            }
        }

        if (innerSearchParams.value.cnv_length_le && !isNaN(Number.parseInt(innerSearchParams.value.cnv_length_le))) {
            if (!(Number.parseInt(row.CNV_Length) <= Number.parseInt(innerSearchParams.value.cnv_length_le))) {
                continue
            }
        }
        if (innerSearchParams.value.copy_number && !isNaN(Number.parseInt(innerSearchParams.value.copy_number))) {
            if (!(Number.parseInt(row.Copy_Number) === Number.parseInt(innerSearchParams.value.copy_number))) {
                continue
            }
        }

        let up = innerSearchParams.value.user_pathogenicity
        if (up && up.length > 0 && up.every(upi => !row.userVerdict.includes(upi.value.toLowerCase()))) {
            continue
        }

        resultRows.push(row)
    }
    buildShowRowData(resultRows)
}
const reset = () => {
    emit('reset', null)
    innerSearchParams.value = {
        geneSet: "",
        excludeGensets: false,
        gene: [],
        acmg: [],
        user_pathogenicity: [],
        cnv_cover_type: [],
        cnv_type: [],
        chromosome: [],
        start: "",
        end: "",
        cnv_length_ge: "",
        cnv_length_le: "",
        copy_number: ""
    }
    search()
}

function clickDetail(record) {
    currentRow.value = record
    dialogVisible.value = true
}

const onSelectChange = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    selectedRows.value = selectedRowKeys
    selectedDefaultRows.value = []
    for (let item of selectedRowKeys) {
        let found = false
        for (let lineNumber of propSelectedDefaultRows.value) {
            if (lineNumber === item) {
                found = true
                break
            }
        }
        if (found) {
            selectedDefaultRows.value.push(item)
        }
    }
    console.log('=============>selectedDefaultRows', selectedDefaultRows)
}

const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}

const isDefineReport = computed(() => useRoute().name === 'defineReport')
const rowSelection = computed(() => {
        if (!isDefineReport.value) {
            return null
        }
        return {
            selectedRowKeys: selectedRows,
            onChange: onSelectChange,
            columnWidth: 35,
            getCheckboxProps: getCheckboxProps
        }
    }
)

const getChangedData = () => {
    let filtered = true
    if (filteredRows.value.length === rows.value.length) {
        filtered = false
    }
    let selected = true
    if (selectedRows.value.length === 0) {
        selected = false
    }
    return {
        searchParams: innerSearchParams.value,
        selectedRows: selectedRows.value,
        selectedDefaultRows: selectedDefaultRows.value,
        filtered: filtered,
        selected: selected,
    }
}

const filterChange = () => {
    emit('filterChange', getChangedData())
}
defineExpose({getChangedData,})

onUnmounted(() => {
    filterChange()
})

const customRow = (record, index) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            // 字体颜色
            // 'color': record.id === physicalSurveyCurrRowId.value ? 'orange' : 'rgba(0, 0, 0, 0.65)',
            // 行背景色
            // 'background-color': record.col250 === 'Y'  ? '#FFFF99' : 'white',
            // 'background-color': record.col250 === 'Y'  ? '#1976d2' : 'white',
            // 'border-color': 'red',
            // 'border-style': 'solid',
            // 'border-width': '5px',
            // // 字体类型
            // 'font-family': 'Microsoft YaHei',
            // // 下划线
            // 'text-decoration': 'underline',
            // // 字体样式-斜体
            // 'font-style': 'italic',
            // // 字体样式-斜体
            // 'font-weight': record.id === clickedRow.value  ? 'bolder' : 'none'
        },
        // 鼠标单击行
        // onClick: event => {
        //     // 记录当前点击的行标识
        //     if (currentRow.value.id === record.id) {
        //         currentRow.value = {}
        //     } else {
        //         currentRow.value = record
        //     }
        // }
    }
}
const columns = computed(() => {
    const result = [
        {title: '', dataIndex: 'expand', width: 50, align: 'left', fixed: 'left'},
        {title: 'Gene Info', dataIndex: 'geneInfo', key: 'geneInfo', width: 200, align: 'left'},
        {title: 'Copy Number', dataIndex: 'copyNumber', key: 'copyNumber', width: 200, align: 'left'},
        {
            title: 'Gene Related Diseases',
            dataIndex: 'geneRelatedDiseases',
            key: 'geneRelatedDiseases',
            width: 200,
            align: 'left'
        },
        {title: 'User Verdict', dataIndex: 'userVerdict', key: 'userVerdict', width: 200, align: 'left'},
        {title: 'ACMG', dataIndex: 'acmg', key: 'acmg', width: 200, align: 'left'},
        {title: 'Related HPOs', dataIndex: 'relatedHPOs', key: 'relatedHPOs', width: 300, align: 'left'},
        {title: 'DGV', dataIndex: 'dgv', key: 'dgv', width: 200, align: 'left'},
        {title: 'Clinvar', dataIndex: 'clinvar', key: 'clinvar', width: 300, align: 'left'},
        {title: 'Plot', dataIndex: 'plot', key: 'plot', width: 200, align: 'left'},
        //{ title: 'Operation', dataIndex: 'operation', key: 'operation', width: 200, align: 'left' },
    ]
    result.forEach((item) => {
        item.customCell = customCell
    })
    return result;
})


onMounted(async () => {
    await loadTable()
})

// watch(langCode, v => loadData())

const searchOptions = ref({})

const dumpedSearchOptions = ref({})

const downloadFile = () => {
    readTaskFile(route.params.id, `CNV_WES/${samples.value[0].identifier}.CNV_WES.txt`).then((res) => {
        console.log(res);
        // Create a Blob from the data
        const blob = new Blob([res], {type: 'text/plain'});
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cnv_wes.txt'; // Set the desired file name
        // Trigger the download
        link.click();
        // Clean up
        URL.revokeObjectURL(link.href);
    }).catch((error) => {
        console.error('Error downloading file:', error);
    });
};


const cnvkitrows = ref([])
const findCnvkit = (gene) => {
    let data = []
    for (const element of cnvkitrows.value) {
        if (element.Gene == gene) {
            data.push(element)
        }
    }
    console.log(data)
}
// 加载表格数据
const loadTable = async () => {
    $q.loading.show({delay: 100})
    console.log(`CNV_WES/${samples.value}.CNV_WES.txt`)
    let verdict = await loadWesVerdictData()
    // verdict是个数组，将其转化为map，key为gene_identifier，value为result
    let map = new Map()
    verdict.forEach(v => {
        map.set(v.gene_identifier, v.result)
    })
    verdictData.value.verdictMap = map
    verdictMap.value = map
    console.log('verdictMap', map)
    readTaskFile(route.params.id, `CNV_WES/${samples.value[0].identifier}.CNV_WES.txt`).then((res) => {

        let data = parseCsvToList(res)
        originDataRows.value = data.rows

        buildShowRowData(data.rows)
        buildSearchOptions(data.rows)
        $q.loading.hide()
    })
    readTaskFile(route.params.id, `CNV_gene/cnvkit_gene.txt`).then((res) => {
        console.log("cnv ggene")
        let data = parseCsvToList(res)
        cnvkitrows.value = data.rows
    })
}

const buildSearchOptions = (originRows) => {
    let gene_set = new Set()
    let acmg_set = new Set()
    let cnv_cover_type_set = new Set()
    let cnv_type_set = new Set()
    let chr_set = new Set()
    for (let row of originRows) {
        cnv_cover_type_set.add(row.CNV_Cover_Type)
        cnv_type_set.add(row.CNV_Type)
        chr_set.add(row.Chr)
        acmg_set.add(row.ACMG_result)

        row.gene_data = row.Gene.split(';')
        for (const item of row.gene_data) {
            gene_set.add(item)
        }
    }

    searchOptions.value = {
        gene_set: Array.from(gene_set).sort().map(value => value),
        acmg_set: Array.from(acmg_set).sort().map(value => value),
        cnv_cover_type_set: Array.from(cnv_cover_type_set).sort().map(value => value),
        cnv_type_set: Array.from(cnv_type_set).sort().map(value => value),
        chr_set: Array.from(chr_set).sort().map(value => value)
    }
    dumpedSearchOptions.value = JSON.parse(JSON.stringify(searchOptions.value))
    console.log(dumpedSearchOptions.value)
}

const createSortedArray = (set, customSort = null) => {
    const array = Array.from(set);
    return customSort ? array.sort(customSort) : array.sort((a, b) => a.localeCompare(b));
};
// Custom sorting logic for acmg_set
const acmgCustomSort = (a, b) => {
    console.log(a, b)
    if (a === '2C' && b === 'LP') return -1;
    if (a === 'LP' && b === '2C') return 1;
    return a.localeCompare(b);
};

const loadWesVerdictData = async () => {
    const user_id = store.currentUser.username
    return await listVerdictByPatient(user_id)
}

const buildShowRowData = (originRows) => {
    // verdict是个数组，将其转化为map，key为gene_identifier，value为result
    let rows = []
    console.log(originRows)
    originRows.forEach((originRow, index) => {
        let row = originRow
        row.lineNumber = index + 1
        let gene_identifier = `${row['Gene']}|${row['Chr']}|${row['Start']}|${row['End']}|${row['CNV_Type']}`.slice(-99)
        row.geneIdentifier = gene_identifier
        row.userVerdict = verdictMap.value.get(gene_identifier) || []
        row.acmg_data = []
        row.acmg_data.push(originRow.ACMG_result)

        for (const element of row.ACMG.split(';')) {
            row.acmg_data.push(element)
        }
        row.acmg_data = row.acmg_data.sort()

        row.hpo_data = row.HPO.split(';')
        row.show_hpo_more = false

        row.gene_data = row.Gene.split(';')
        row.show_gene_more = false

        row.cnv_length_data = ''

        if (!isNaN(Number.parseInt(row.CNV_Length))) {
            row.CNV_Length = Number.parseInt(row.CNV_Length)
            if (row.CNV_Length < 1000) {
                row.cnv_length_data = `${row.CNV_Length.toFixed(2)} bp`
            } else if (row.CNV_Length >= 1000 && row.CNV_Length < 1000000) {
                row.cnv_length_data = `${(row.CNV_Length / 1000).toFixed(2)} Kbp`
            } else if (row.CNV_Length >= 1000000) {
                row.cnv_length_data = `${(row.CNV_Length / 10000000).toFixed(2)} Mbp`
            }
        }
        row.gene_related_diseases_data = row.Gene_Related_Diseases.split(';')
        row.show_gene_related_diseases_more = false

        row.dgv_data = []
        for (const element of row.DGV.split(';')) {
            row.dgv_data.push(element.replace(",", ""))
        }
        row.show_dgv_more = false

        row.clinvar_data = []
        for (const element of row.Clinvar.split(';')) {
            row.clinvar_data.push(element.replace(",", ""))
        }
        row.show_clinvar_more = false
        row.expanded = false
        rows.push(row)
    })
    filteredRows.value = rows
}

const filterFunctions = {
    gene_set: (v, u) => makeOptionFilter(v, u, 'gene_set'),
    acmg_set: (v, u) => makeOptionFilter(v, u, 'acmg_set'),
    cnv_cover_type_set: (v, u) => makeOptionFilter(v, u, 'cnv_cover_type_set'),
    cnv_type_set: (v, u) => makeOptionFilter(v, u, 'cnv_type_set'),
    chr_set: (v, u) => makeOptionFilter(v, u, 'chr_set'),
}

function makeOptionFilter(val, update, optionName) {

    if (val === '') {
        update(() => {
            searchOptions.value[optionName] = dumpedSearchOptions.value[optionName]
        })
        console.log(searchOptions.value[optionName])
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        searchOptions.value[optionName] = dumpedSearchOptions.value[optionName].filter(v => v.toLowerCase().indexOf(needle) > -1)
    })
}

const stickFilter = () => {
    try {
        let data = getChangedData()
        emit('stickDone', data)
    } catch (e) {
        console.log(e)
    }
}
</script>

<style lang="scss" scoped>
/*//点击行的样式*/
.clickRowStyl {
    background-color: #bbbbff !important;
    font-size: 20px;
}

/*//偶数行的样式*/
.evenRowStyl {
    background-color: #aad4fd46 !important;
}

.ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td {
    background: #bbbbff;
}

/*//鼠标移入样式*/
.ant-table-tbody > tr:hover > td {
    background: #bbbbff !important;
}

.ant-table-selection-column #select-info {
    position: absolute;
    top: 5px;
    right: -55px;
    width: 150px;
    display: none;
    z-index: 99999;
}

.ant-table-selection-column:hover #select-info {
    display: block;
}

.q-tab-panel {
    padding: 0 !important;
}
</style>
