<template>
  <div>
    <div class="row items-center q-pb-sm q-gutter-sm">
      <q-btn color="primary" :label="$t('Add')" icon="add" @click="$emit('openAdd')" />
      <q-btn color="negative" :label="$t('Delete')" icon="delete" @click="bulkDelete" :disable="selectedRowKeys.length === 0" />
    </div>
    <a-table
      :loading="loading"
      :data-source="displayRows"
      :columns="columns"
      :scroll="{ x: 600, y: 450 }"
      rowKey="lineNumber"
      :sticky="true"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'rowNo'">
          <div>{{ record.lineNumber }}</div>
        </template>
        <template v-if="column.dataIndex === 'geneInfo'">
          <div>
            <div class="text-weight-bolder text-green-5" v-for="item of record.gene_data.slice(0, record.expanded ? record.gene_data.length : 2)" :key="item">
              {{ item }}
            </div>
            <div class="text-weight-bolder text-blue-5">{{ record.CNV_Cover_Type }}</div>
            <div v-if="record.expanded" class="text-weight-bolder text-orange-5">{{ record.Chr }}:{{ record.Start }}-{{ record.End }}</div>
            <div v-if="record.expanded" class="text-weight-bolder text-pink-5">{{ record.Chromosomal_Region }}</div>
          </div>
        </template>
        <template v-if="column.dataIndex === 'copyNumber'">
          <div class="text-blue text-weight-bolder" v-if="record.CNV_Type === 'DUP'">{{ record.Copy_Number }} | {{ record.CNV_Type }}</div>
          <div class="text-red text-weight-bolder" v-if="record.CNV_Type === 'DEL'">{{ record.Copy_Number }} | {{ record.CNV_Type }}</div>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <q-btn color="negative" size="sm" :label="$t('Delete')" @click="$emit('remove', record.lineNumber)" />
        </template>
      </template>
    </a-table>
    <div v-if="!loading && displayRows.length === 0" class="text-grey q-mt-sm">{{$t('NoData')}}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskFile } from 'src/api/task'
import { parseCsvToList } from 'src/utils/csv'

const props = defineProps({
  selectedKeys: { type: Array, default: () => [] },
  samples: { type: Array, default: () => [] },
})
const emit = defineEmits(['openAdd','remove','bulkRemove'])

const route = useRoute()
const loading = ref(false)
const allRows = ref([])
const displayRows = ref([])
const selectedRowKeys = ref([])

const columns = [
  { title: 'Row', dataIndex: 'rowNo', width: 80, align: 'center' },
  { title: 'Gene Info', dataIndex: 'geneInfo', width: 260, align: 'left' },
  { title: 'Copy Number', dataIndex: 'copyNumber', width: 200, align: 'left' },
  { title: 'Operation', dataIndex: 'operation', width: 120, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  const patient = props.samples && props.samples.length > 0 ? props.samples[0].identifier : ''
  const res = await readTaskFile(route.params.id, `CNV_WES/${patient}.CNV_WES.txt`)
  const data = parseCsvToList(res)
  const rows = data.rows.map((r, idx) => {
    const rec = { ...r }
    rec.lineNumber = idx + 1
    rec.expanded = false
    rec.gene_data = (rec.Gene || '').split(';').filter((t) => t)
    return rec
  })
  allRows.value = rows
  updateDisplay()
  loading.value = false
}

const updateDisplay = () => {
  const keySet = new Set(props.selectedKeys || [])
  displayRows.value = allRows.value.filter((r) => keySet.has(r.lineNumber))
  selectedRowKeys.value = []
}

watch(() => props.selectedKeys, () => updateDisplay())
onMounted(() => loadData())

const rowSelection = {
  selectedRowKeys,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  },
  columnWidth: 35,
}

const bulkDelete = () => {
  if (selectedRowKeys.value.length > 0) {
    const keys = [...selectedRowKeys.value]
    selectedRowKeys.value = []
    const uniq = Array.from(new Set(keys))
    if (uniq.length > 0) {
      emit('bulkRemove', uniq)
    }
  }
}
</script>
