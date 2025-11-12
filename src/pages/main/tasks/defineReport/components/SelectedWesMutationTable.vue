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
      :scroll="{ x: 800, y: 450 }"
      rowKey="lineNumber"
      :sticky="true"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'rowNo'">
          <div>{{ record.lineNumber }}</div>
        </template>
        <template v-if="column.dataIndex === 'geneInfo'">
          <div class="row">
            <template v-if="record.expanded">
              <div class="col-2 column justify-between">
                <div class="col-2 text-weight-bolder text-green-5 q-pl-sm justify-between" style="font-size: 14px">
                  {{ record.Class }}
                </div>
              </div>
              <div class="col-10 text-left">
                <div class="text-primary" style="font-size: 16px">{{ record['Gene.refGene'] }}</div>
                <div>{{ record['ExonicFunc.refGene'] }}</div>
                <div>{{ record['Chr'] + ':' + record.Start + ' ' + record.Ref + '>' + record.Alt }}</div>
                <div>{{ record.NUChange }}</div>
                <div>{{ record.AAChange }}</div>
                <div>{{ record['GeneDetail.refGene'] + ' ' + record.exon }}</div>
              </div>
            </template>
            <template v-else>
              <div class="col-2">
                <div class="text-weight-bolder text-green-5 q-pl-sm" style="font-size: 16px">{{ record.Class }}</div>
                <div class="text-primary content-center" style="font-size: 16px">{{ record['Gene.refGene'] }}</div>
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
                <div>{{ formatAF(record) }}%</div>
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
              <div>AF: {{ formatAF(record) }}%</div>
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
            <a-tooltip :title="record.Gene_Related_Diseases && record.Gene_Related_Diseases[0]">
              <div>{{ record.Gene_Related_Diseases && record.Gene_Related_Diseases[0] }}</div>
            </a-tooltip>
            <div v-if="record.Gene_Related_Diseases && record.Gene_Related_Diseases.length > 2" class="col-1 text-primary cursor-pointer" @click="record.expanded = !record.expanded">
              +{{ record.Gene_Related_Diseases.length - 2 }}
            </div>
          </template>
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
import { readTaskMuFile } from 'src/api/task'

const props = defineProps({
  selectedKeys: { type: Array, default: () => [] },
})
const emit = defineEmits(['openAdd','remove','bulkRemove'])

const route = useRoute()
const loading = ref(false)
const allRows = ref([])
const displayRows = ref([])
const selectedRowKeys = ref([])

const columns = [
  { title: 'Row', dataIndex: 'rowNo', width: 80, align: 'center' },
  { title: 'Gene Info', dataIndex: 'geneInfo', width: 240, align: 'left' },
  { title: 'Genotype & Quality', dataIndex: 'genoTypeQuality', width: 220, align: 'left' },
  { title: 'Gene Related Diseases', dataIndex: 'Gene_Related_Diseases', width: 200, align: 'left' },
  { title: 'Operation', dataIndex: 'operation', width: 120, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  const res = await readTaskMuFile(route.params.id, 'Mut_WES')
  const lines = res.split('\n').filter((t) => t.trim().length > 0)
  const header = lines.shift().split('\t')
  const rows = []
  for (let i = 0; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const record = { expanded: false }
    header.forEach((h, idx) => (record[h] = values[idx] || ''))
    record.lineNumber = i + 1
    if (record.Gene_Related_Diseases) {
      record.Gene_Related_Diseases = record.Gene_Related_Diseases.split(';').filter((t) => t && t !== '.')
    } else {
      record.Gene_Related_Diseases = []
    }
    rows.push(record)
  }
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

function formatAF(record) {
  let v = record?.Mutation_Rate_
  if (v === undefined) {
    for (const k of Object.keys(record)) {
      const kl = k.toLowerCase()
      if (kl.includes('mutation') && kl.includes('rate')) {
        v = record[k]
        break
      }
    }
  }
  if (v == null || v === '' || v === '.' ) {
    return '-'
  }
  const s = String(v)
  let n
  if (s.includes('%')) {
    n = parseFloat(s.replace('%',''))
    if (!isFinite(n)) return '-'
    return n.toFixed(2)
  }
  n = Number(s)
  if (!isFinite(n)) return '-'
  return (n * 100).toFixed(2)
}

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
