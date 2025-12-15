<template>
    <div>
        <div class="q-gutter-sm q-mb-sm">
            <q-tabs
                v-model="tab"
                active-color="primary"
                active-bg-color="grey-4"
                align="left"
                class="bg-grey-1"
                :breakpoint="0"
                dense
            >
                <q-tab name="胚系突变分析" :label="$t('GermlineMutationAnalysis')" v-if="showMutGermline" />
                <q-tab name="体细胞突变分析" :label="$t('SomaticMutationAnalysis')" v-if="showMutSomatic" />
            </q-tabs>
            <q-tab-panels v-model="tab" animated>
                <q-tab-panel name="胚系突变分析" v-if="showMutGermline">
                    <div class="row items-center q-pb-sm q-gutter-sm">
                        <q-btn color="primary" :label="$t('Add')" icon="add" @click="openDialog('germline')" />
                        <q-btn
                            color="negative"
                            :label="$t('Delete')"
                            icon="delete"
                            @click="bulkDeleteGermline"
                            :disable="germlineSelectedRowKeys.length === 0"
                        />
                    </div>
                    <a-table
                        :loading="germlineLoading"
                        :data-source="germlineDisplayRows"
                        :columns="germlineColumns"
                        :scroll="{ x: 1400, y: 450 }"
                        rowKey="lineNumber"
                        :sticky="true"
                        :row-selection="germlineRowSelection"
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
                                <div>
                                    <div class="text-weight-bolder text-primary" style="font-size: 16px">
                                        {{ record.col11 }}
                                    </div>
                                    <div class="text-blue-grey-6" v-if="!record.expanded">
                                        {{ record.col13 || '-' }}
                                    </div>
                                    <div v-if="record.expanded" class="q-mt-xs">
                                        <div class="text-blue-7">{{ record.col13 || '-' }}</div>
                                        <div class="text-orange-7">{{ record.col21 || '-' }}</div>
                                        <div class="text-pink-6">
                                            {{ record.col1 }}:{{ record.col2 }}-{{ record.col3 }}
                                            {{ record.col4 }}>{{ record.col5 }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'genoTypeQuality'">
                                <div class="row q-gutter-x-sm">
                                    <div>{{ $t('Depth') }}: {{ record.col8 }}</div>
                                    <div>{{ $t('TumorFrequency') }}: {{ formatAF(record.col9) }}%</div>
                                </div>
                            </template>
                        </template>
                    </a-table>
                    <div v-if="!germlineLoading && germlineDisplayRows.length === 0" class="text-grey q-mt-sm">
                        {{$t('NoData')}}
                    </div>
                </q-tab-panel>
                <q-tab-panel name="体细胞突变分析" v-if="showMutSomatic">
                    <div class="row items-center q-pb-sm q-gutter-sm">
                        <q-btn color="primary" :label="$t('Add')" icon="add" @click="openDialog('somatic')" />
                        <q-btn
                            color="negative"
                            :label="$t('Delete')"
                            icon="delete"
                            @click="bulkDeleteSomatic"
                            :disable="somaticSelectedRowKeys.length === 0"
                        />
                    </div>
                    <a-table
                        :loading="somaticLoading"
                        :data-source="somaticDisplayRows"
                        :columns="somaticColumns"
                        :scroll="{ x: 1600, y: 450 }"
                        rowKey="lineNumber"
                        :sticky="true"
                        :row-selection="somaticRowSelection"
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
                                <div>
                                    <div class="text-weight-bolder text-primary" style="font-size: 16px">
                                        {{ record.col15 }}
                                    </div>
                                    <div v-if="record.expanded" class="q-mt-xs text-pink-6">
                                        {{ record.col1 }}:{{ record.col2 }}-{{ record.col3 }}
                                        {{ record.col4 }}>{{ record.col5 }}
                                    </div>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'genoTypeQuality'">
                                <div class="row q-gutter-x-sm">
                                    <div>{{ $t('TumorDepth') }}: {{ record.tumorDepth }}</div>
                                    <div>{{ $t('ControlDepth') }}: {{ record.compareDepth }}</div>
                                    <div>{{ $t('TumorFrequency') }}: {{ formatAF(record.tumorRatio) }}%</div>
                                    <div>{{ $t('ControlFrequency') }}: {{ formatAF(record.compareRatio) }}%</div>
                                </div>
                            </template>
                        </template>
                    </a-table>
                    <div v-if="!somaticLoading && somaticDisplayRows.length === 0" class="text-grey q-mt-sm">
                        {{$t('NoData')}}
                    </div>
                </q-tab-panel>
            </q-tab-panels>
        </div>
        <MutationSelectDialog
            v-model:visible="dlgVisible"
            :samples="samples"
            :task="task"
            :stepData="mutationStepData"
            :intro="intro"
            :showMutGermline="dlgShowGermline"
            :showMutSomatic="dlgShowSomatic"
            @confirm="onConfirm"
        />
    </div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import MutationSelectDialog from './MutationSelectDialog.vue'
import _ from 'lodash'

const emit = defineEmits(['confirm','removeGermline','bulkRemoveGermline','removeSomatic','bulkRemoveSomatic'])
const props = defineProps({
  samples: { type: Array, default: () => [] },
  task: { type: Object, default: () => ({}) },
  mutationStepData: { type: Object, default: () => ({}) },
  intro: { type: String, default: '' },
  showMutGermline: { type: Boolean, default: true },
  showMutSomatic: { type: Boolean, default: true },
})

const route = useRoute()
const tab = ref(props.showMutGermline ? '胚系突变分析' : '体细胞突变分析')
watch(() => [props.showMutGermline, props.showMutSomatic], () => {
  if (props.showMutGermline) tab.value = '胚系突变分析'
  else if (props.showMutSomatic) tab.value = '体细胞突变分析'
}, { immediate: true })

const dlgVisible = ref(false)
const dlgMode = ref(props.showMutGermline ? 'germline' : 'somatic')
const openDialog = (mode) => {
  dlgMode.value = mode
  dlgVisible.value = true
}
const dlgShowGermline = computed(() => props.showMutGermline && dlgMode.value === 'germline')
const dlgShowSomatic = computed(() => props.showMutSomatic && dlgMode.value === 'somatic')

const germlineLoading = ref(false)
const somaticLoading = ref(false)
const germlineAllRows = ref([])
const germlineDisplayRows = ref([])
const germlineSelectedRowKeys = ref([])
const somaticAllRows = ref([])
const somaticDisplayRows = ref([])
const somaticSelectedRowKeys = ref([])

const germlineHeader = ref([])
const somaticHeader = ref([])

const germlineBaseFixedColumns = [
  { i: 1, title: '', dataIndex: 'col1', align: 'center', width: 60, fixed: 'left' },
  { i: 2, title: '', dataIndex: 'col2', align: 'center', width: 100, fixed: 'left' },
  { i: 11, title: '', dataIndex: 'col11', align: 'center', width: 110, fixed: 'left' },
  { i: 14, title: '', dataIndex: 'col14', align: 'center', width: 80, fixed: 'left' },
  { i: 15, title: '', dataIndex: 'col15', align: 'center', width: 100, fixed: 'left' },
  { i: 16, title: '', dataIndex: 'col16', align: 'center', width: 100, fixed: 'left' },
  { i: 3, title: '', dataIndex: 'col3', align: 'center', width: 100 },
  { i: 4, title: '', dataIndex: 'col4', align: 'center', width: 70 },
  { i: 5, title: '', dataIndex: 'col5', align: 'center', width: 70 },
  { i: 6, title: '', dataIndex: 'col6', align: 'center', width: 120 },
  { i: 7, title: '', dataIndex: 'col7', align: 'center', width: 125 },
  { i: 8, title: '', dataIndex: 'col8', align: 'center', width: 120 },
  { i: 9, title: '', dataIndex: 'col9', align: 'center', width: 130 },
  { i: 10, title: '', dataIndex: 'col10', align: 'center', width: 105 },
  { i: 13, title: '', dataIndex: 'col13', align: 'center', width: 160, ellipsis: true },
  { i: 18, title: '', dataIndex: 'col18', align: 'left', width: 200, ellipsis: true },
  { i: 19, title: '', dataIndex: 'col19', align: 'left', width: 200, ellipsis: true },
  { i: 20, title: '', dataIndex: 'col20', align: 'left', width: 280, ellipsis: true },
  { i: 21, title: '', dataIndex: 'col21', align: 'center', width: 120, ellipsis: true },
  { i: 22, title: '', dataIndex: 'col22', align: 'center', width: 200, ellipsis: true },
  { i: 23, title: '', dataIndex: 'col23', align: 'center', width: 100 },
  { i: 31, title: '', dataIndex: 'col31', align: 'center', width: 100 },
  { i: 38, title: '', dataIndex: 'col38', align: 'center', width: 120 },
  { i: 60, title: '', dataIndex: 'col60', align: 'center', width: 100 },
]
const germlineColumns = computed(() => {
  const targetColumnNames = [
    'Strand_Bias(ref_f,ref_r,alt_f,alt_r)',
    'Hot',
    'In_house_freq',
    'Tumor_strand_Bias(ref_f,ref_r,alt_f,alt_r)',
    'Normal_strand_Bias(ref_f,ref_r,alt_f,alt_r)',
  ]
  const additional = []
  targetColumnNames.forEach((targetName) => {
    const columnIndex = germlineHeader.value.findIndex((headerName) => {
      return (
        (headerName?.includes('Strand_Bias') && targetName.includes('Strand_Bias')) ||
        (headerName === 'Hot' && targetName === 'Hot') ||
        (headerName === 'In_house_freq' && targetName === 'In_house_freq') ||
        (headerName?.includes('Tumor_strand_Bias') && targetName.includes('Tumor_strand_Bias')) ||
        (headerName?.includes('Normal_strand_Bias') && targetName.includes('Normal_strand_Bias'))
      )
    })
    if (columnIndex !== -1) {
      additional.push({
        i: columnIndex + 1,
        title: germlineHeader.value[columnIndex],
        dataIndex: `col${columnIndex + 1}`,
        align: 'center',
        width: 150,
        ellipsis: true,
      })
    }
  })
  const result = [...germlineBaseFixedColumns]
  result.push(...additional)
  result.forEach(col => {
    if ((col.title === '' || col.title == null) && col.i) {
      col.title = germlineHeader.value[col.i - 1] || ''
    }
  })
  return result
})

const somaticBaseFixedColumns = [
  { i: 1, title: '', dataIndex: 'col1', align: 'center', width: 60, fixed: 'left' },
  { i: 2, title: '', dataIndex: 'col2', align: 'center', width: 85, fixed: 'left' },
  { i: 15, title: '', dataIndex: 'col15', align: 'center', width: 110, fixed: 'left' },
  { i: 18, title: '', dataIndex: 'col18', align: 'center', width: 90, fixed: 'left' },
  { i: 19, title: '', dataIndex: 'col19', align: 'center', width: 100, fixed: 'left' },
  { i: 20, title: '', dataIndex: 'col20', align: 'center', width: 100, fixed: 'left' },
  { i: 3, title: '', dataIndex: 'col3', align: 'center', width: 85 },
  { i: 4, title: '', dataIndex: 'col4', align: 'center', width: 70 },
  { i: 5, title: '', dataIndex: 'col5', align: 'center', width: 70 },
  { i: 6, title: '', dataIndex: 'col6', align: 'center', width: 90 },
  { i: 7, title: '', dataIndex: 'col7', align: 'center', width: 110 },
  { i: 8, title: '', dataIndex: 'col8', align: 'center', width: 95 },
  { i: 9, title: '', dataIndex: 'col9', align: 'center', width: 115 },
  { i: 10, title: '', dataIndex: 'col10', align: 'center', width: 90 },
  { i: 11, title: '', dataIndex: 'col11', align: 'center', width: 110 },
  { i: 12, title: '', dataIndex: 'col12', align: 'center', width: 95 },
  { i: 13, title: '', dataIndex: 'col13', align: 'center', width: 160 },
  { i: 14, title: '', dataIndex: 'col14', align: 'center', width: 110 },
  { i: 17, title: '', dataIndex: 'col17', align: 'center', width: 160 },
  { i: 22, title: '', dataIndex: 'col22', align: 'left', width: 200, ellipsis: true },
  { i: 23, title: '', dataIndex: 'col23', align: 'left', width: 200, ellipsis: true },
  { i: 24, title: '', dataIndex: 'col24', align: 'left', width: 160, ellipsis: true },
  { i: 25, title: '', dataIndex: 'col25', align: 'center', width: 120 },
  { i: 26, title: '', dataIndex: 'col26', align: 'center', width: 200, ellipsis: true },
  { i: 27, title: '', dataIndex: 'col27', align: 'center', width: 100 },
  { i: 35, title: '', dataIndex: 'col35', align: 'center', width: 100 },
  { i: 42, title: '', dataIndex: 'col42', align: 'center', width: 100 },
  { i: 43, title: '', dataIndex: 'col43', align: 'center', width: 100 },
  { i: 64, title: '', dataIndex: 'col64', align: 'center', width: 100 },
]
const somaticColumns = computed(() => {
  const result = [...somaticBaseFixedColumns]
  const targetColumnNames = [
    'Strand_Bias(ref_f,ref_r,alt_f,alt_r)',
    'Hot',
    'In_house_freq',
    'Tumor_strand_Bias(ref_f,ref_r,alt_f,alt_r)',
    'Normal_strand_Bias(ref_f,ref_r,alt_f,alt_r)',
  ]
  targetColumnNames.forEach((targetName) => {
    const columnIndex = somaticHeader.value.findIndex((headerName) => headerName === targetName)
    if (columnIndex !== -1) {
      const colIdx = columnIndex + 1
      const alreadyExists = somaticBaseFixedColumns.some((col) => col.i === colIdx)
      if (!alreadyExists) {
        result.push({
          i: colIdx,
          title: '',
          dataIndex: `col${colIdx}`,
          align: 'center',
          width: targetName === 'Strand_Bias(ref_f,ref_r,alt_f,alt_r)' ? 120 : 95,
          ellipsis: true,
        })
      }
    }
  })
  result.forEach(col => {
    if ((col.title === '' || col.title == null) && col.i) {
      col.title = somaticHeader.value[col.i - 1] || ''
    }
  })
  return result
})

const loadGermlineSelectedRows = async () => {
  if (!props.showMutGermline) return

  germlineLoading.value = true
  const res = await readTaskMuFile(route.params.id, 'Mut_germline')
  const headNames = getCsvHeader(res, '\t')
  germlineHeader.value = headNames
  const colKeys = _.range(1, headNames.length + 1, 1).map((i) => 'col' + i)
  const csvRows = getCsvDataAndSetLineNumber(res, { splitter: '\t', hasHeaderLine: true, fields: colKeys })
  const rows = csvRows.map((r, idx) => {
    const rec = { ...r }
    rec.lineNumber = r.lineNumber || idx + 1
    rec.expanded = false
    return rec
  })
  germlineAllRows.value = rows
  updateGermlineDisplay()
  germlineLoading.value = false

  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', headNames)
}
const loadSomaticSelectedRows = async () => {
  if (!props.showMutSomatic) return
  somaticLoading.value = true
  const res = await readTaskMuFile(route.params.id, 'Mut_somatic')
  const headNames = getCsvHeader(res, '\t')
  somaticHeader.value = headNames
  const colKeys = _.range(1, headNames.length + 1, 1).map((i) => 'col' + i)
  const csvRows = getCsvDataAndSetLineNumber(res, { splitter: '\t', hasHeaderLine: true, fields: colKeys })
  const tumorIdx = []
  headNames.forEach((head, i) => {
    props.samples.forEach((sample) => {
      if (head.includes(`(${sample.identifier})`) && sample.sample_meta.is_panel) {
        tumorIdx.push(i)
      }
    })
  })
  const rows = csvRows.map((r, idx) => {
    const rec = { ...r }
    rec.lineNumber = r.lineNumber || idx + 1
    rec.expanded = false
    rec.tumorDepth = tumorIdx.includes(8) ? rec.col8 : rec.col12
    rec.compareDepth = tumorIdx.includes(8) ? rec.col12 : rec.col8
    rec.tumorRatio = tumorIdx.includes(9) ? rec.col13 : rec.col9
    rec.compareRatio = tumorIdx.includes(9) ? rec.col9 : rec.col13
    return rec
  })
  somaticAllRows.value = rows
  updateSomaticDisplay()
  somaticLoading.value = false
}

const updateGermlineDisplay = () => {
  const keys = props.mutationStepData?.germline?.selectedRows || []
  const keySet = new Set(keys)
  germlineDisplayRows.value = germlineAllRows.value.filter(r => keySet.has(r.lineNumber))
  germlineSelectedRowKeys.value = []
}
const updateSomaticDisplay = () => {
  const keys = props.mutationStepData?.somatic?.selectedRows || []
  const keySet = new Set(keys)
  somaticDisplayRows.value = somaticAllRows.value.filter(r => keySet.has(r.lineNumber))
  somaticSelectedRowKeys.value = []
}

watch(() => props.mutationStepData?.germline?.selectedRows, () => updateGermlineDisplay())
watch(() => props.mutationStepData?.somatic?.selectedRows, () => updateSomaticDisplay())
watch(() => props.samples, () => {
  loadSomaticSelectedRows()
})
onMounted(() => {
  loadGermlineSelectedRows()
  loadSomaticSelectedRows()
})

const germlineRowSelection = {
  selectedRowKeys: germlineSelectedRowKeys,
  onChange: (keys) => {
    germlineSelectedRowKeys.value = keys
  },
  columnWidth: 35,
}
const somaticRowSelection = {
  selectedRowKeys: somaticSelectedRowKeys,
  onChange: (keys) => {
    somaticSelectedRowKeys.value = keys
  },
  columnWidth: 35,
}

const formatAF = (v) => {
  if (v == null || v === '' || v === '.') return '-'
  const n = Number(v)
  if (!isFinite(n)) return '-'
  return (n * 100).toFixed(2)
}

const bulkDeleteGermline = () => {
  if (germlineSelectedRowKeys.value.length > 0) {
    const uniq = Array.from(new Set(germlineSelectedRowKeys.value))
    germlineSelectedRowKeys.value = []
    if (uniq.length > 0) {
      emit('bulkRemoveGermline', uniq)
    }
  }
}
const bulkDeleteSomatic = () => {
  if (somaticSelectedRowKeys.value.length > 0) {
    const uniq = Array.from(new Set(somaticSelectedRowKeys.value))
    somaticSelectedRowKeys.value = []
    if (uniq.length > 0) {
      emit('bulkRemoveSomatic', uniq)
    }
  }
}

const onConfirm = (data) => {
  emit('confirm', data)
}
</script>
