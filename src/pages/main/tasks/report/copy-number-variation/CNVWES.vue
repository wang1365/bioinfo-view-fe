<template>
    <div>
        <q-splitter v-model="splitterModel" unit="px" before-class="">
            <template v-slot:before>
                <div
                    :class="['column', 'q-gutter-y-xs', 'q-pr-sm', { dimmed: showSticky && stickDone }]"
                    style="width:100%"
                >
                    <q-input
                        v-model="innerSearchParams.geneSet"
                        :label="$t('GeneSet')"
                        clearable
                        dense
                        outlined
                        stack-label
                        class="full-width"
                        label-color="primary"
                    >
                        <template v-slot:append>
                            <q-btn padding="xs" size="sm" icon="add" />
                            <q-btn padding="xs" size="sm" icon="menu" />
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
                    />
                    <q-select
                        v-model="innerSearchParams.user_pathogenicity"
                        clearable
                        multiple
                        dense
                        outlined
                        hide-dropdown-icon
                        :options="searchOptions.user_pathogenicity_set"
                        :label="$t('UsersPathogenicity')"
                        stack-label
                        label-color="primary"
                        class="full-width"
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
                            ></q-input>
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
                            ></q-input>
                        </div>
                        <div class="col-6">
                            <div class="col-6">
                                <q-input
                                    v-model="innerSearchParams.cnv_length_ge"
                                    dense
                                    outlined
                                    class="full-width"
                                    stack-label
                                    label-color="primary"
                                    :label="$t('CNV Length<=')"
                                ></q-input>
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
                                icon="south"
                                color="primary"
                                target="_blank"
                                size="md"
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
                            <template v-if="column.dataIndex === 'geneInfo'">
                                <div>
                                    <div
                                        class="text-weight-bolder text-green-5"
                                        v-for="item of record.gene_data.slice(0, 2)"
                                        :key="item"
                                    >
                                        {{ item }}
                                    </div>
                                    <div v-if="record.gene_data.length > 2">
                                        <q-btn
                                            size="sm"
                                            color="secondary"
                                            flat
                                            @click="record.show_gene_more = !record.show_gene_more"
                                            >+{{
                                            record.gene_data.length }}
                                            More</q-btn
                                        >
                                    </div>
                                    <div class="text-weight-bolder text-blue-5">
                                        {{ record.CNV_Cover_Type }}
                                    </div>
                                    <div v-if="record.show_gene_more" class="text-weight-bolder text-orange-5">
                                        {{ record.Chr }}:{{ record.Start }}-{{ record.End }}
                                    </div>
                                    <div v-if="record.show_gene_more" class="text-weight-bolder text-pink-5">
                                        {{ record.Chromosomal_Region }}
                                    </div>
                                    <div v-if="record.show_gene_more" class="text-weight-bolder text-purple-5">
                                        {{ record.cnv_length_data }}
                                    </div>
                                </div>
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
                                <div v-if="record.gene_related_diseases_data.length <= 2">
                                    <div v-for="item of record.gene_related_diseases_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                                <div v-if="record.gene_related_diseases_data.length > 2">
                                    <div v-if="!record.show_gene_related_diseases_more">
                                        <div v-for="item of record.gene_related_diseases_data.slice(0, 2)" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.show_gene_related_diseases_more">
                                        <div v-for="item of record.gene_related_diseases_data" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.gene_related_diseases_data.length > 2">
                                        <q-btn
                                            size="sm"
                                            color="secondary"
                                            flat
                                            @click="record.show_gene_related_diseases_more = !record.show_gene_related_diseases_more"
                                            >+{{
                                            record.gene_related_diseases_data.length }}
                                            More</q-btn
                                        >
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'userVerdict'">
                                <div class="row">NA</div>
                            </template>
                            <template v-if="column.dataIndex === 'acmg'">
                                <template v-for="acmg in record.acmg_data" :key="acmg">
                                    <q-chip color="orange" outline square v-if='acmg !== "."' dense>{{ acmg }}</q-chip>
                                </template>
                            </template>
                            <template v-if="column.dataIndex === 'relatedHPOs'">
                                <div v-if="record.hpo_data.length <= 2">
                                    <div v-for="item of record.hpo_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                                <div v-if="record.hpo_data.length > 2">
                                    <div v-if="!record.show_hpo_more">
                                        <div v-for="item of record.hpo_data.slice(0, 2)" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.show_hpo_more">
                                        <div v-for="item of record.hpo_data" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.hpo_data.length > 2">
                                        <q-btn
                                            size="sm"
                                            color="secondary"
                                            flat
                                            @click="record.show_hpo_more = !record.show_hpo_more"
                                            >+{{
                                            record.hpo_data.length }}
                                            More</q-btn
                                        >
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'dgv'">
                                <div v-if="record.dgv_data.length <= 2">
                                    <div v-for="item of record.dgv_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                                <div v-if="record.dgv_data.length > 2">
                                    <div v-if="!record.show_dgv_more">
                                        <div v-for="item of record.dgv_data.slice(0, 2)" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.show_dgv_more">
                                        <div v-for="item of record.dgv_data" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.dgv_data.length > 2">
                                        <q-btn
                                            size="sm"
                                            color="secondary"
                                            flat
                                            @click="record.show_dgv_more = !record.show_dgv_more"
                                            >+{{
                                            record.dgv_data.length }}
                                            More</q-btn
                                        >
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'clinvar'">
                                <div v-if="record.clinvar_data.length <= 2">
                                    <div v-for="item of record.clinvar_data.slice(0, 2)" :key="item">
                                        {{ item }}
                                    </div>
                                </div>
                                <div v-if="record.clinvar_data.length > 2">
                                    <div v-if="!record.show_clinvar_more">
                                        <div v-for="item of record.clinvar_data.slice(0, 2)" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.show_clinvar_more">
                                        <div v-for="item of record.clinvar_data" :key="item">
                                            {{ item }}
                                        </div>
                                    </div>
                                    <div v-if="record.clinvar_data.length > 2">
                                        <q-btn
                                            size="sm"
                                            color="secondary"
                                            flat
                                            @click="record.show_clinvar_more = !record.show_clinvar_more"
                                            >+{{
                                            record.clinvar_data.length }}
                                            More</q-btn
                                        >
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'plot'">
                                <div class="row">
                                    <img :src="record.Plot" alt="." />
                                </div>
                            </template>
                            <template v-if="column.key === 'operation'">
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
                            </template>
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

    <q-dialog class="q-py-sm" v-model="dialogVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <MutationInfo :row="currentRow" :task="props.task" :samples="props.samples" :headers="props.header">
                </MutationInfo>
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
</template>
<script setup>
import { ref, onMounted, toRef, toRefs, watch, computed, onUnmounted } from 'vue'
import { useComparator } from 'src/utils/comparator'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, parseCsvToList } from 'src/utils/csv'
import { useRoute } from 'vue-router'
import { errorMessage, infoMessage } from 'src/utils/notify'
import { getDualIdentifiers } from "src/utils/samples"
import { useI18n } from 'vue-i18n'
import { useCustomCell, WES_PARAMS } from './index'
import { sample } from 'lodash'

const { t } = useI18n()
const splitterModel = ref(300)

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
        default() { return { ...WES_PARAMS } }
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
})
const route = useRoute()
const igvVisible = ref(false)
const igvFile = ref(null)
const dialogVisible = ref(false)
const innerSearchParams = ref({ ...WES_PARAMS })


const showDrawer = ref(false)

const filteredRows = ref([])
const currentRow = ref({})


function clickDetail(record) {
    currentRow.value = record
    dialogVisible.value = true
}

function clickIgv(record) {
    currentRow.value = record
    igvFile.value = `Mut_germline/${record.col1}-${record.col2}.igv`
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
const columns = ref([
    { title: 'Gene Info', dataIndex: 'geneInfo', key: 'geneInfo', width: 200, align: 'left' },
    { title: 'Copy Number', dataIndex: 'copyNumber', key: 'copyNumber', width: 200, align: 'left' },
    { title: 'Gene Related Diseases', dataIndex: 'geneRelatedDiseases', key: 'geneRelatedDiseases', width: 200, align: 'left' },
    { title: 'User Verdict', dataIndex: 'userVerdict', key: 'userVerdict', width: 200, align: 'left' },
    { title: 'ACMG', dataIndex: 'acmg', key: 'acmg', width: 200, align: 'left' },
    { title: 'Related HPOs', dataIndex: 'relatedHPOs', key: 'relatedHPOs', width: 200, align: 'left' },
    { title: 'DGV', dataIndex: 'dgv', key: 'dgv', width: 200, align: 'left' },
    { title: 'Clinvar', dataIndex: 'clinvar', key: 'clinvar', width: 200, align: 'left' },
    { title: 'Plot', dataIndex: 'plot', key: 'plot', width: 200, align: 'left' },
    { title: 'Operation', dataIndex: 'operation', key: 'operation', width: 200, align: 'left' },
])

const reset = () => {
    innerSearchParams.value = { ...WES_PARAMS }
    search()
}

onMounted(() => {
    console.log('onmouted')
    console.log(props)
    loadTable()
})

const searchOptions = ref({})

// 加载表格数据
const loadTable = () => {
    console.log('load table')
    readTaskFile(route.params.id, `CNV_WES/D00000307.CNV_WES.txt`).then((res) => {
        let data = parseCsvToList(res)
        let rows = buildShowRowData(data.rows)
        searchOptions.value = buildSearchOptions(data.rows)
        filteredRows.value = Array.from({ length: 200 }, () => rows[0])

        console.log("cnv-wes", data)
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
    return {
        gene_set: Array.from(gene_set).sort().map(value => ({ label: value, value: value })),
        acmg_set: Array.from(acmg_set).sort().map(value => ({ label: value, value: value })),
        cnv_cover_type_set: Array.from(cnv_cover_type_set).sort().map(value => ({ label: value, value: value })),
        cnv_type_set: Array.from(cnv_type_set).sort().map(value => ({ label: value, value: value })),
        chr_set: Array.from(chr_set).sort().map(value => ({ label: value, value: value }))
    }
}
const buildShowRowData = (originRows) => {
    let rows = []
    for (let originRow of originRows) {
        let row = JSON.parse(JSON.stringify(originRow))
        row.acmg_data = row.ACMG.split(';')
        row.acmg_data.push(originRow.ACMG_result)

        row.hpo_data = row.HPO.split(';')
        row.show_hpo_more = false

        row.gene_data = row.Gene.split(';')
        row.show_gene_more = false

        row.cnv_length_data = ''
        if (row.CNV_Length < 1000) {
            row.cnv_length_data = `${row.CNV_Length} bp`
        } else if (row.CNV_Length >= 1000 && row.CNV_Length < 1000000) {
            row.cnv_length_data = `${row.CNV_Length / 1000} Kbp`
        } else if (row.CNV_Length >= 1000000) {
            row.cnv_length_data = `${row.CNV_Length / 10000000} Mbp`
        }

        row.gene_related_diseases_data = row.Gene_Related_Diseases.split(';')
        row.show_gene_related_diseases_more = false

        row.dgv_data = row.DGV.split(';')
        row.show_dgv_more = false

        row.clinvar_data = row.Clinvar.split(';')
        row.show_clinvar_more = false
        rows.push(row)
    }
    return rows
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

.ant-table-tbody>tr:hover:not(.ant-table-expanded-row)>td {
    background: #bbbbff;
}

/*//鼠标移入样式*/
.ant-table-tbody>tr:hover>td {
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
