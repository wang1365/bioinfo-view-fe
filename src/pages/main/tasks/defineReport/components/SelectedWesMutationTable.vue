<template>
    <div>
        <div class="row items-center q-pb-sm q-gutter-sm">
            <q-btn color="primary" :label="$t('Add')" icon="add" @click="$emit('openAdd')" />
            <q-btn
                color="negative"
                :label="$t('Delete')"
                icon="delete"
                @click="bulkDelete"
                :disable="selectedRowKeys.length === 0"
            />
        </div>
        <AppDataTable
            :loading="loading"
            :data-source="displayRows"
            :columns="columns"
            :scroll="{ x: 2000, y: 450 }"
            rowKey="lineNumber"
            :sticky="true"
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
                            <div class="col-4 column justify-between">
                                <div
                                    class="col-2 text-weight-bolder text-green-5 q-pl-sm justify-between"
                                    style="font-size: 14px"
                                >
                                    {{ record.Class }}
                                </div>
                            </div>
                            <div class="col-8 text-left">
                                <div class="text-primary" style="font-size: 16px">{{ record['Gene.refGene'] }}</div>
                                <div>{{ record['ExonicFunc.refGene'] }}</div>
                                <div>
                                    {{ record['Chr'] + ':' + record.Start + ' ' + record.Ref + '>' + record.Alt }}
                                </div>
                                <div>{{ record.NUChange }}</div>
                                <div>{{ record.AAChange }}</div>
                                <div>{{ record['GeneDetail.refGene'] + ' ' + record.exon }}</div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="col-4">
                                <div class="text-weight-bolder text-green-5 q-pl-sm" style="font-size: 16px">
                                    {{ record.Class }}
                                </div>
                                <div class="text-primary content-center" style="font-size: 16px">
                                    {{ record['Gene.refGene'] }}
                                </div>
                            </div>
                            <div class="col-8 text-blue-grey-6 justify-between">
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
                        <div
                            v-if="record.Gene_Related_Diseases && record.Gene_Related_Diseases.length > 2"
                            class="col-1 text-primary cursor-pointer"
                            @click="record.expanded = !record.expanded"
                        >
                            +{{ record.Gene_Related_Diseases.length - 2 }}
                        </div>
                    </template>
                </template>
                <template v-if="column.dataIndex === 'userVerdict'">
                    <div>{{ (record.userVerdict || []).join(', ') || '-' }}</div>
                </template>
                <template v-if="column.dataIndex === 'ACMG_result'">
                    <div>{{ record.ACMG_result || '-' }}</div>
                </template>
                <template v-if="column.dataIndex === 'Clinvar'">
                    <div>{{ record.Clinvar || '-' }}</div>
                </template>
                <template v-if="column.dataIndex === 'Frequencies'">
                    <div>My Cohort: {{ record.cohort }}</div>
                    <div>
                        <template v-if="record.expanded">
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
                        </template>
                        <template v-else>
                            <template v-if="getValidFrequencies(record).length <= 2">
                                <div v-if="getValidFrequencies(record).length === 1">
                                    {{getValidFrequencies(record)[0].name}}: {{ getValidFrequencies(record)[0].value }}
                                </div>
                                <div v-if="getValidFrequencies(record).length === 2">
                                    {{getValidFrequencies(record)[1].name}}: {{ getValidFrequencies(record)[1].value }}
                                </div>
                            </template>
                            <template v-else>
                                <div>
                                    {{getValidFrequencies(record)[0].name}}: {{ getValidFrequencies(record)[0].value }}
                                </div>
                                <div>
                                    {{getValidFrequencies(record)[1].name}}: {{ getValidFrequencies(record)[1].value }}
                                </div>
                                <div
                                    class="text-primary cursor-pointer"
                                    v-if="getValidFrequencies(record).length > 2"
                                    @click="record.expanded = !record.expanded"
                                >
                                    +{{ getValidFrequencies(record).length - 2 }}
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
                        <a-tooltip :title="Array.isArray(record.HPO) ? record.HPO[0] : record.HPO">
                            <div>{{ Array.isArray(record.HPO) ? record.HPO[0] : record.HPO }}</div>
                        </a-tooltip>
                        <div
                            class="text-primary cursor-pointer"
                            v-if="Array.isArray(record.HPO) && record.HPO.length > 2"
                            @click="record.expanded = !record.expanded"
                        >
                            +{{ record.HPO.length - 2 }}
                        </div>
                    </template>
                </template>
                <template v-if="column.dataIndex === 'Software_Prediction_result'">
                    <div>{{ record.Software_Prediction_result || '-' }}</div>
                </template>
                <template v-if="column.dataIndex === 'operation'">
                    <q-btn
                        color="negative"
                        size="sm"
                        :label="$t('Delete')"
                        @click="$emit('remove', record.lineNumber)"
                    />
                </template>
            </template>
        </AppDataTable>
        <div v-if="!loading && displayRows.length === 0" class="text-grey q-mt-sm">{{$t('NoData')}}</div>
    </div>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskMuFile } from 'src/api/task'
import { listVerdictByPatient } from 'src/api/verdict'
import { getCohortStatus } from 'src/api/report'
import { globalStore } from 'src/stores/global'

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
  { title: '', dataIndex: 'expand', width: 30, align: 'left' },
  { title: 'Gene Info', dataIndex: 'geneInfo', width: 240, align: 'left' },
  { title: 'Genotype & Quality', dataIndex: 'genoTypeQuality', width: 170, align: 'left' },
  { title: 'Gene Related Diseases', dataIndex: 'Gene_Related_Diseases', width: 200, align: 'left' },
  { title: 'User Verdict', dataIndex: 'userVerdict', width: 100, align: 'center' },
  { title: 'ACMG', dataIndex: 'ACMG_result', width: 120, align: 'left' },
  { title: 'Clinvar', dataIndex: 'Clinvar', width: 80, align: 'left' },
  { title: 'Frequencies', dataIndex: 'Frequencies', width: 170, align: 'left' },
  { title: 'Related HPOs', dataIndex: 'HPO', width: 130, align: 'left' },
  { title: 'Software Prediction', dataIndex: 'Software_Prediction_result', width: 80, align: 'left' },
  { title: 'Operation', dataIndex: 'operation', width: 80, align: 'center', fixed: 'right' },
]

const loadData = async () => {
  loading.value = true
  const store = globalStore()
  const verdicts = await listVerdictByPatient(store.currentUser.username)
  const verdictMap = new Map()
  verdicts.forEach(v => verdictMap.set(v.gene_identifier, v.result))
  const cohortData = await getCohortStatus(route.params.id)
  const cohortMap = new Map()
  cohortData.forEach(v => {
    cohortMap.set(v.gene_info, (v.cnt / v.total).toFixed(2))
  })
  const res = await readTaskMuFile(route.params.id, 'Mut_WES')
  const lines = res.split('\n').filter((t) => t.trim().length > 0)
  const header = lines.shift().split('\t')
  const rows = []
  for (let i = 0; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const record = { expanded: false }
    header.forEach((h, idx) => (record[h] = values[idx] || ''))
    record.lineNumber = i + 1
    const gid = `${record['Gene.refGene']}|${record['GeneDetail.refGene']}|${record['AAChange']}|${record.Chr}|${record.Start}|${record.End}|${record.Ref}|${record.Alt}`
    record.geneIdentifier = gid
    record.userVerdict = verdictMap.get(gid) || []
    record.cohort = cohortMap.get(gid) || '-'
    if (record.Gene_Related_Diseases) {
      record.Gene_Related_Diseases = record.Gene_Related_Diseases.split(';').filter((t) => t && t !== '.')
    } else {
      record.Gene_Related_Diseases = []
    }
    if (record.HPO) {
      record.HPO = record.HPO.split(';').filter((t) => t && t !== '.')
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

const getValidFrequencies = (record) => {
  const frequencies = [
    { name: 'GnomAD Genome Total', value: record.gnomAD_genome_ALL },
    { name: 'GnomAD Exome Total', value: record.gnomAD_exome_ALL },
    { name: 'ExAC Total', value: record.ExAC_ALL },
    { name: '1000g2015aug Total', value: record['1000g2015aug_all'] },
  ]
  return frequencies.filter(freq => freq.value !== '.')
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
