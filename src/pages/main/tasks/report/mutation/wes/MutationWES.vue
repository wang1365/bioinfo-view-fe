<template>
    <div>
        <q-splitter v-model="splitterModel" unit="px" style="height: 680px" before-class="">
            <template v-slot:before>
                <search-control
                    v-model:search-params="innerSearchParams"
                    :show-sticky="showSticky"
                    :stick-done="stickDone"
                    :options="options"
                />
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
                    />
                </div>
            </template>

            <template v-slot:after>
                <div style="position:relative">
                    <q-icon
                        v-if="isDefineReport"
                        color="accent"
                        name="question_mark"
                        size="xs"
                        style="position:absolute;z-index:100;left:0;top:0"
                    >
                        <q-tooltip>{{ $t('OnlySelectAllThisPageFilterResult') }}</q-tooltip>
                    </q-icon>
                    <a-table
                        style="z-index:1"
                        :loading="loading"
                        :data-source="filteredRows"
                        :columns="columns"
                        :scroll="{ x: scrollX, y: 550 }"
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
                                <div class="row">
                                    <template v-if="record.expanded">
                                        <div class="col-2 column justify-between">
                                            <div
                                                class="col-2 text-weight-bolder text-green-5 q-pl-sm justify-between"
                                                style="font-size: 14px"
                                            >
                                                {{ record.Class }}
                                            </div>
                                        </div>
                                        <div class="col-10 text-left">
                                            <div class="text-primary" style="font-size: 16px">
                                                {{ record['Gene.refGene'] }}
                                            </div>
                                            <div>{{ record['ExonicFunc.refGene'] }}</div>
                                            <div>
                                                {{ record['Chr'] + ':' + record.Start + ' ' + record.Ref + '>' + record.Alt
                                                }}
                                            </div>
                                            <div>{{ record.NUChange }}</div>
                                            <div>{{ record.AAChange }}</div>
                                            <div>{{ record['GeneDetail.refGene'] + ' ' + record.exon }}</div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="col-2">
                                            <div
                                                class="text-weight-bolder text-green-5 q-pl-sm"
                                                style="font-size: 16px"
                                            >
                                                {{ record.Class }}
                                            </div>
                                            <div class="text-primary content-center" style="font-size: 16px">
                                                {{ record['Gene.refGene'] }}
                                            </div>
                                        </div>
                                        <div class="col-10 text-blue-grey-6 justify-between">
                                            <div>{{ record['ExonicFunc.refGene'] }}</div>
                                            <div>{{ record.NUChange }}</div>
                                        </div>
                                    </template>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'genoTypeQuality'">
                                <template v-if="record.expanded">
                                    <div class="row q-gutter-x-sm">
                                        <div class="col">
                                            <div class="text-grey">Genotype Quality</div>
                                            <div>{{ record.Genotype_Quality || '-' }}</div>

                                            <div class="text-grey">Variant Quality</div>
                                            <div>{{ record.Variant_Quality || '-' }}</div>

                                            <div class="text-grey">Depth Quality</div>
                                            <div>{{ record.Depth_Quality }}</div>
                                        </div>
                                        <div class="col">
                                            <div class="text-grey">Allele Fraction</div>
                                            <div>{{ (record.Mutation_Rate_ * 100).toFixed(2) || '-' }}%</div>

                                            <div class="text-grey">Depth</div>
                                            <div>{{ record.Seq_Depths_ || '-' }}</div>

                                            <div class="text-grey">Genotype</div>
                                            <div>{{ record.Genotype }}</div>
                                        </div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="row q-gutter-x-sm">
                                        <div>{{ record.Depth_Quality }}(DP:{{ record.Seq_Depths_ }})</div>
                                        <div>AF: {{ (record.Mutation_Rate_ * 100).toFixed(2) || '-' }}%</div>
                                    </div>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'Gene_Related_Diseases'">
                                <template v-if="record.expanded">
                                    <template v-for="grd in record.Gene_Related_Diseases" :key="grd">
                                        <a-tooltip :title="grd">
                                            <div>{{ grd }}</div>
                                        </a-tooltip>
                                    </template>
                                </template>
                                <template v-else>
                                    <a-tooltip :title="record.Gene_Related_Diseases[0]">
                                        <div>{{ record.Gene_Related_Diseases[0] }}</div>
                                    </a-tooltip>
                                    <div v-if="record.Gene_Related_Diseases.length > 1" class="row justify-between">
                                        <a-tooltip :title="record.Gene_Related_Diseases[1]">
                                            <div class="col-10">{{ record.Gene_Related_Diseases[1] }}</div>
                                        </a-tooltip>
                                    </div>
                                    <div
                                        v-if="record.Gene_Related_Diseases.length > 2"
                                        class="col-1 text-primary cursor-pointer"
                                        @click="record.expanded = !record.expanded"
                                    >
                                        +{{ record.Gene_Related_Diseases.length - 2 }}
                                    </div>
                                </template>
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
                            </template>

                            <template v-if="column.dataIndex === 'ACMG_result'">
                                <div class="text-purple">{{ record.ACMG_result }}</div>
                                <template v-if="record.expanded">
                                    <template v-for="acmg in record.ACMG" :key="acmg">
                                        <q-chip color="orange" outline square v-if='acmg !== "."' dense
                                            >{{ acmg }}
                                        </q-chip>
                                    </template>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'Clinvar'">
                                <div class="text-purple">{{ record.Clinvar }}</div>
                                <q-rating
                                    v-if="record.expanded"
                                    :model-value="record.Clinvar_ReviewStatus"
                                    color="orange"
                                    icon="star_border"
                                    icon-selected="star"
                                    readonly
                                />
                            </template>

                            <template v-if="column.dataIndex === 'Frequencies'">
                                <div>My Cohort: {{record.cohort}}</div>
                                <div>
                                    <template v-if="record.expanded">
                                        <div>
                                            <div v-if='record.gnomAD_genome_ALL !== "."'>
                                                GnomAD Genome Total: {{ record.gnomAD_genome_ALL }}
                                            </div>
                                            <div v-if='record.gnomAD_exome_ALL !== "."'>
                                                GnomAD Exome Total: {{ record.gnomAD_exome_ALL }}
                                            </div>
                                            <div v-if='record.ExAC_ALL !== "."'>ExAC Total: {{ record.ExAC_ALL }}</div>
                                            <div v-if='record["1000g2015aug_all"] !== "."'>
                                                1000g2015aug Total: {{ record['1000g2015aug_all'] }}
                                            </div>
                                            <div class="row justify-end">
                                                <q-icon
                                                    class="col-1 cursor-pointer"
                                                    name="menu"
                                                    color="grey"
                                                    size="20px"
                                                    @click="frequenciesDrawerVisible = true; drawerRecord = record"
                                                />
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <template v-if="getValidFrequencies(record).length <= 2">
                                            <div v-if="getValidFrequencies(record).length === 1">
                                                {{getValidFrequencies(record)[0].name}}:
                                                {{ getValidFrequencies(record)[0].value }}
                                            </div>
                                            <div v-if="getValidFrequencies(record).length === 2">
                                                {{getValidFrequencies(record)[1].name}}:
                                                {{ getValidFrequencies(record)[1].value }}
                                            </div>
                                            <div class="row justify-end">
                                                <q-icon
                                                    class="col-1 cursor-pointer"
                                                    name="menu"
                                                    color="grey"
                                                    size="20px"
                                                    @click="frequenciesDrawerVisible = true; drawerRecord = record"
                                                />
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div>
                                                {{getValidFrequencies(record)[0].name}}:
                                                {{ getValidFrequencies(record)[0].value }}
                                            </div>
                                            <div>
                                                {{getValidFrequencies(record)[1].name}}:
                                                {{ getValidFrequencies(record)[1].value }}
                                            </div>
                                            <div class="row justify-between">
                                                <div
                                                    class="col text-primary cursor-pointer"
                                                    v-if="getValidFrequencies(record).length > 2"
                                                    @click="record.expanded = !record.expanded"
                                                >
                                                    +{{ getValidFrequencies(record).length - 2 }}
                                                </div>
                                                <q-icon
                                                    class="col-1 cursor-pointer"
                                                    name="menu"
                                                    color="grey"
                                                    size="20px"
                                                    @click="frequenciesDrawerVisible = true; drawerRecord = record"
                                                />
                                            </div>
                                        </template>
                                    </template>
                                </div>
                            </template>

                            <template v-if="column.dataIndex === 'HPO'">
                                <template v-if="record.expanded">
                                    <q-scroll-area style="height: 300px">
                                        <template v-for="hpo in record.HPO" :key="hpo">
                                            <a-tooltip :title="hpo">
                                                <div>{{ hpo }}</div>
                                            </a-tooltip>
                                        </template>
                                    </q-scroll-area>
                                </template>
                                <template v-else>
                                    <a-tooltip :title="record.HPO[0]">{{ record.HPO[0] }}</a-tooltip>
                                    <div v-if="record.HPO.length > 1">
                                        <a-tooltip :title="record.HPO[1]">
                                            <div class="col-9">{{ record.HPO[1] }}</div>
                                        </a-tooltip>
                                        <div
                                            class="col-2 text-primary cursor-pointer"
                                            v-if="record.HPO.length > 2"
                                            @click="record.expanded = !record.expanded"
                                        >
                                            +{{ record.HPO.length - 2 }}
                                        </div>
                                    </div>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'Software_Prediction_result'">
                                <q-linear-progress :value="Number(record.Software_Prediction_result)" size="10px" />
                                {{ record.Software_Prediction_result }}
                                <template v-if="record.expanded">
                                    <div>
                                        <wes-radar :record="record" />
                                    </div>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'operation'">
                                <q-btn
                                    :label="$t('View')"
                                    color="primary"
                                    size="md"
                                    flat
                                    padding="xs"
                                    @click="clickIgv(record)"
                                />
                            </template>
                            <!--                            <template v-else>-->
                            <!--                                <a-tooltip v-if="column.ellipsis" color="#3b4146" :title="record[column.dataIndex]">-->
                            <!--                                    <div>{{ record[column.dataIndex] }}</div>-->
                            <!--                                </a-tooltip>-->
                            <!--                            </template>-->
                        </template>
                    </a-table>
                </div>
            </template>
        </q-splitter>
    </div>

    <q-dialog class="q-py-sm" v-model="dialogVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <MutationInfo
                    :row="currentRow"
                    :task="props.task"
                    :samples="props.samples"
                    :headers="props.header"
                ></MutationInfo>
            </q-card-section>
            <q-card-actions align="center" vertical>
                <q-btn :label="$t('Close')" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="igvVisible">
        <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
            <Igv :taskId="props.task.id" :file="igvFile" />
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
    <a-drawer
        :get-container="false"
        title="Frequencies"
        placement="bottom"
        :closable="true"
        @close="frequenciesDrawerVisible = false"
        :visible="frequenciesDrawerVisible"
        v-if="frequenciesDrawerVisible"
    >
        <div class="row">
            <template v-for="p in Object.getOwnPropertyNames(populations)" :key="p">
                <div class="col-4">
                    <span class="text-primary">{{ p }} :</span> {{ drawerRecord[populations[p]] }}
                </div>
            </template>
        </div>
    </a-drawer>
</template>
<script setup>
import { ref, onMounted, toRef, toRefs, watch, computed, onUnmounted } from 'vue'
import MutationInfo from '../MutationInfo.vue'
import { useComparatorOptions } from 'src/utils/comparator'
import Igv from '../Igv.vue'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData } from 'src/utils/csv'
import { useRoute } from 'vue-router'
import { errorMessage, infoMessage } from 'src/utils/notify'
import { getDualIdentifiers } from 'src/utils/samples'
import { useI18n } from 'vue-i18n'
import { populations } from '../index'
import {verdictOptions, WES_PARAMS} from './wes.js'
import WesRadar from '../components/WesRadar.vue'
import { setVerdictResult } from 'src/api/verdict'
import { getCurrentUsername } from 'src/utils/user'
import GenesetDialog from 'pages/main/tasks/report/common-module/GenesetDialog.vue'
import SearchControl from 'pages/main/tasks/report/mutation/wes/SearchControl.vue'
import { useCustomCell } from '../index'

const { t } = useI18n()
const { options: comparatorOptions, compare } = useComparatorOptions()
const splitterModel = ref(300)
const emit = defineEmits(['filterChange'])
const customCell = useCustomCell('Report')


const props = defineProps({
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
            return { ...WES_PARAMS }
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
})
const route = useRoute()
const igvVisible = ref(false)
const verdictData = ref({
    visible: false,
    record: null,
    verdict: [],
    options: verdictOptions
})



const igvFile = ref(null)
const dialogVisible = ref(false)
const innerSearchParams = ref({ ...WES_PARAMS })
const frequenciesDrawerVisible = ref(false)
const drawerRecord = ref(null)
const loading = defineModel('loading')
const { rows } = toRefs(props)
const propSelectedDefaultRows = toRef(props, 'selectedDefaultRows')
const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')
const filteredRows = ref([])
const currentRow = ref({})

const isDefineReport = computed(() => useRoute().name === 'defineReport')
const rowSelection = computed(() => {
        if (!isDefineReport.value) {
            return null
        }
        return {
            selectedRowKeys: selectedRows,
            onChange: onSelectChange,
            columnWidth: 35,
            getCheckboxProps: getCheckboxProps,
        }
    },
)


const scrollX = computed(() => {
    return 2200
})

const columns = computed(() => {
    const result = [
        { title: '', dataIndex: 'expand', width: 30, align: 'left', fixed: 'left' },
        { title: 'Gene Info', dataIndex: `geneInfo`, width: 180, align: 'center', ellipsis: true },
        { title: 'Genotype & Quality', dataIndex: `genoTypeQuality`, width: 170, ellipsis: true,
          sorter: (a, b) => Number(a.Mutation_Rate_) - Number(b.Mutation_Rate_),
        },
        { title: 'Gene Related Diseases', dataIndex: `Gene_Related_Diseases`, width: 100, ellipsis: true },
        { title: 'User Verdict', dataIndex: `userVerdict`, width: 100, align: 'center', ellipsis: true },
        { title: 'ACMG', dataIndex: `ACMG_result`, width: 150, ellipsis: true },

        { title: 'Clinvar', dataIndex: `Clinvar`, width: 80, ellipsis: true },
        { title: 'Frequencies', dataIndex: `Frequencies`, width: 170, ellipsis: true },
        { title: 'Related HPOs', dataIndex: `HPO`, width: 130, ellipsis: true },
        { title: 'Software Prediction', dataIndex: `Software_Prediction_result`, width: 220, ellipsis: true },
        { title: 'IGV', dataIndex: `operation`, width: 80, ellipsis: true },
    ]
    result.forEach((item) => {
        item.customCell = customCell
    })
    return result
})

function showVerdictDlg(record) {
    verdictData.value.visible = true
    verdictData.value.record = record
    verdictData.value.verdict = record.userVerdict || []
}

function onVerdictConfirm() {
    const username = getCurrentUsername()
    setVerdictResult(username, verdictData.value.record.geneIdentifier, verdictData.value.verdict)

    verdictData.value.record.userVerdict = verdictData.value.verdict
    verdictData.value.visible = false
}

function clickIgv(record) {
    currentRow.value = record
    igvFile.value = `Mut_WES/igv/${record.Chr}_${record.Start}_${record.End}.igv`
    igvVisible.value = true
}

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

const reset = () => {
    innerSearchParams.value = { ...WES_PARAMS }
    search()
}


// 根据过滤条件筛选数据
const searchFilterRows = (searchParams) => {
    filteredRows.value = rows.value.filter((line, i) => {
        let param = searchParams.diseaseCategories
        if (param && param.length > 0) {
            let matched = false
            const cls = line.Class
            if (param.includes('A') && ['IA', 'IIA', 'IIIA'].includes(line.Class)) {
                matched = true
            }
            if (param.includes('B') && ['IB', 'IIB', 'IIIB'].includes(line.Class)) {
                matched = true
            }
            if (param.includes('C') && ['Others', 'IV', 'V'].includes(line.Class)) {
                matched = true
            }
            if (!matched) {
                return false
            }
        }

        let phenoTypes = searchParams.phenoType
        if (phenoTypes && phenoTypes.length > 0) {
            if (phenoTypes.every(pt => !line.HPO.includes(pt))) {
                return false
            }
        }

        let diseases = searchParams.diseases
        if (diseases && diseases.length > 0) {
            if (diseases.every(pt => line.Gene_Related_Diseases.every(grd => !grd.includes(pt)))) {
                return false
            }
        }

        let modes = searchParams.diseaseInheritanceModes
        if (modes && modes.length > 0) {
            if (modes.every(m => line.Gene_Related_Diseases.every(grd => !grd.includes(m)))) {
                return false
            }
        }

        let geneSet = searchParams.geneSet != null ? searchParams.geneSet.split(',').filter(g => g.trim() !== '') : []
        if (geneSet && geneSet.length > 0) {
            const exclude = searchParams.excludeGensets
            // 包含：所有都没有包含，返回false
            if (!exclude && geneSet.every(gene => gene !== line['Gene.refGene'])) {
                return false
            }
            // 排除：有包含，返回false
            if (exclude && geneSet.some(gene => gene === line['Gene.refGene'])) {
                return false
            }
        }

        let genes = searchParams.gene
        if (genes && genes.length > 0 && genes.every(gene => gene !== line['Gene.refGene'])) {
            return false
        }

        let tiers = searchParams.prioritizationTier
        if (tiers && tiers.length > 0 && tiers.every(tier => tier !== line.Class)) {
            return false
        }

        let acmgs = searchParams.acmgPathogenicity
        if (acmgs && acmgs.length > 0 && acmgs.every(acmg => acmg !== line.ACMG_result)) {
            return false
        }

        let clinvars = searchParams.clinvarPathogenicity
        if (clinvars && clinvars.length > 0 && clinvars.every(clinvar => clinvar !== line.Clinvar)) {
            return false
        }

        let up = searchParams.userPathogenicity
        if (up && up.length > 0 && up.every(upi => !line.userVerdict.includes(upi.toLowerCase()))) {
            return false
        }

        let frequencies = searchParams.populationAlleleFrequency
        const pafComp = searchParams.pafComp
        let pafValue = searchParams.pafValue
        if (frequencies && frequencies.length > 0 && pafValue !== null && pafValue !== '') {
            const matched = frequencies.every(fq => {
                let colValue = line[populations[fq]]
                if (colValue === '' || colValue === null) {
                    return false
                }
                return compare(pafComp, Number(colValue), Number(pafValue) / 100)
            })

            if (!matched) {
                return false
            }
        }

        let genoType = searchParams.genoType
        if (genoType && genoType !== line.Genotype) {
            return false
        }

        let seqQuality = searchParams.seqQuality
        if (seqQuality && seqQuality !== line.Depth_Quality) {
            return false
        }

        let genoTypeComp = searchParams.genoTypeComp
        let genoTypeValue = searchParams.genoTypeValue
        if (genoTypeComp && genoTypeValue !== null && genoTypeValue !== '' && line.Genotype_Quality !== null) {
            const v = line.Genotype_Quality
            if (v === '-') {
                return false
            }
            if (!compare(genoTypeComp, Number(v), Number(genoTypeValue))) {
                return false
            }
        }

        let variantQualityComp = searchParams.variantQualityComp
        let variantQualityValue = searchParams.variantQualityValue
        if (variantQualityComp && variantQualityValue !== null && variantQualityValue !== '' && line.Variant_Quality !== null) {
            const v = line.Variant_Quality
            if (v === '-') {
                return false
            }
            if (!compare(variantQualityComp, Number(v), Number(variantQualityValue))) {
                return false
            }
        }

        let seqDepthComp = searchParams.seqDepthComp
        let seqDepthValue = searchParams.seqDepthValue
        if (seqDepthComp && seqDepthValue !== null && seqDepthValue !== '' && line.Seq_Depths_ != null) {
            const v = line.Seq_Depths_
            if (v === '-') {
                return false
            }
            if (!compare(seqDepthComp, Number(v), Number(seqDepthValue))) {
                return false
            }
        }

        let minAlleleFraction = searchParams.minAlleleFraction
        if (minAlleleFraction && minAlleleFraction / 100 > Number(line.Mutation_Rate_)) {
            return false
        }

        let maxAlleleFraction = searchParams.maxAlleleFraction
        if (maxAlleleFraction && maxAlleleFraction / 100 < Number(line.Mutation_Rate_)) {
            return false
        }

        let chromosome = searchParams.chromosome
        if (chromosome !== null && chromosome !== '') {
            if (line.Chr !== searchParams.chromosome) {
                return false
            }

            if (searchParams.chromosomeStart != null && searchParams.chromosomeStart !== ''
                && Number(line.Start) < Number(searchParams.chromosomeStart)) {
                return false
            }

            if (searchParams.chromosomeEnd != null  && searchParams.chromosomeEnd !== ''
                && Number(line.End) > Number(searchParams.chromosomeEnd)) {
                return false
            }
        }

        return true
    })
}
const search = () => {
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    searchFilterRows(innerSearchParams.value)
    selectedRows.value = selectedDefaultRows.value
    // filterChange()
    console.log(selectedRows.value)
    if (showSticky.value) {
        if (propSelectedDefaultRows.value.length > 0) {
            if (selectedRows.value.length > 0) {
                infoMessage(`${selectedRows.value.length} ${t('DefineReportSelectAlertMessage')}`)
            } else if (filteredRows.value.length > 0 && filteredRows.value.length !== rows.value.length) {
                infoMessage(`${filteredRows.value.length} ${t('DefineReportSelectAlertMessage')}`)
            }
        } else if (filteredRows.value.length > 0 && filteredRows.value.length !== rows.value.length) {
            infoMessage(`${filteredRows.value.length} ${t('DefineReportSelectAlertMessage')}`)
        }
    }

}

watch(rows, (rows) => {
    loadTable()
})

const tableFile = computed(() => {
    const ret = getDualIdentifiers(props.samples)
    return `igv${props.task.result_dir}/Mut_WES/${ret.qt}.Mut_WES.txt`
})

const tableFileName = computed(() => {
    const ret = getDualIdentifiers(props.samples)
    return `${ret.qt}.Mut_WES.txt`
})

onMounted(() => {
    loadTable()
})

const propSearchParams = toRef(props, 'searchParams')
const actionTitle = computed(() => t('Operate'))

// 加载表格数据
const loadTable = () => {
    rows.value.forEach(row => {
        row.expanded = false
    })
    filteredRows.value = rows.value
    console.log('====> wes rows', filteredRows.value)
    // columns.value.forEach((col) => (col.title = header.value[col.i - 1]))
    // const actionColumn = columns.value[columns.value.length - 1]
    // actionColumn.title = actionTitle
    // actionColumn.width = 105
    //
    // innerSearchParams.value = Object.assign(innerSearchParams.value, propSearchParams.value)
    // searchFilterRows(propSearchParams.value)
    // selectedRows.value = []
    // selectedDefaultRows.value = []
    //
    // for (let item of filteredRows.value) {
    //     let finded = false
    //     for (let lineNumber of propSelectedRows.value) {
    //         if (lineNumber === item.lineNumber) {
    //             finded = true
    //             break
    //         }
    //     }
    //     if (finded) {
    //         selectedRows.value.push(item.lineNumber)
    //     }
    // }
    // for (let item of filteredRows.value) {
    //     let finded = false
    //     for (let lineNumber of propSelectedDefaultRows.value) {
    //         if (lineNumber === item.lineNumber) {
    //             finded = true
    //             break
    //         }
    //     }
    //     if (finded) {
    //         selectedRows.value.push(item.lineNumber)
    //         selectedDefaultRows.value.push(item.lineNumber)
    //     }
    // }

    // filterChange()
}
const selectedRows = ref([])
const selectedDefaultRows = ref([])

const getValidFrequencies = (record) => {
    const frequencies = [
        { name: 'GnomAD Genome Total', value: record.gnomAD_genome_ALL },
        { name: 'GnomAD Exome Total', value: record.gnomAD_exome_ALL },
        { name: 'ExAC Total', value: record.ExAC_ALL },
        { name: '1000g2015aug Total', value: record['1000g2015aug_all'] },
]
    return frequencies.filter(freq => freq.value !== '.')
}

const onSelectChange = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    selectedRows.value = selectedRowKeys
    selectedDefaultRows.value = []
    for (let item of selectedRowKeys) {
        let finded = false
        for (let lineNumber of propSelectedDefaultRows.value) {
            if (lineNumber === item) {
                finded = true
                break
            }
        }
        if (finded) {
            selectedDefaultRows.value.push(item)
        }
    }
    console.log(selectedDefaultRows)
    // filterChange()
}
const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}

onUnmounted(() => {
    filterChange()
})


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
defineExpose({ getChangedData })
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
    background: #ffefbb;
}

/*//鼠标移入样式*/
.ant-table-tbody > tr:hover > td {
    background: #ffefbb !important;
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
