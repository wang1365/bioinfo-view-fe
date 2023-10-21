<template>
  <div class="q-py-sm">
    <div class="text-bold">
      <span>{{ (onTarget.isTumorSample ? $t('OnTargetRateOfTumorSamples') : $t('OnTargetRateOfSamples')) + `：${onTarget.tumorTargetRate}` }}</span>
      <span
          v-if="props.samples.length > 1"
      >{{ '，' + $t('OnTargetRateOfControlSamples') + `：${onTarget.controlTargetRate}` }}</span
      >
    </div>
  </div>
  <q-separator></q-separator>
  <div class="q-py-sm">
    <a-table
        class="col-5 q-px-lg"
        size="small"
        :loading="loading"
        :data-source="rows"
        :columns="columns"
        :sticky="true"
        :pagination="false"
    >
    </a-table>
  </div>
</template>
<script setup>
import {ref, onMounted, computed, watch, inject} from "vue";
import {useRoute} from 'vue-router'
import {getReportTable, getReportText} from "src/api/report"
import {readTaskFile} from "src/api/task"
import {getCsvData} from "src/utils/csv"
import {useI18n} from 'vue-i18n'
import {globalStore} from 'src/stores/global'
import {storeToRefs} from 'pinia'

const store = globalStore()
const {langCode} = storeToRefs(store)
const {t} = useI18n()
const route = useRoute()
const loading = ref(false)
const props = defineProps({
  intro: {
    type: String,
    required: false
  },
  samples: {
    type: Array,
    required: false,
    default: () => []
  }
})

const groupCustomCell = (_, rowIndex, column) => {
  if (rowIndex === 0 || rowIndex === 3) {
    return {style: 'border-bottom-color:blue'}
  }
  if (rowIndex === rows.value.length - 1) {
    return {style: 'border-top-color:blue; border-top-style: solid; font-weight:bold; font-size: 15px'}
  }
  return {}
}

const columns = computed(() => {
  let result = [
    {
      key: 'a',
      width: 50,
      dataIndex: 'group',
      customCell: (_, rowIndex, column) => {
        let ret = {style: 'font-weight: bold;'}
        if (rowIndex === 0 || rowIndex === 3) {
          ret.style = 'font-weight: bold;border-bottom-color:blue'
        }
        if (rowIndex === rows.value.length - 1) {
          return {style: 'border-top-color:blue; border-top-style: solid; font-weight:bold;'}
        }
        return ret
      },
      customRender: ({text, record, index, column}) => {
        if (index === 0) {
          return t('PathologicalEvaluation')
        }
        if (index === 1) {
          return t('DNAQualityAssessment')
        }
        if (index === 4) {
          return t('SequencingQualityAssessment')
        }
      }
    },
    {title: t('QualityParameters'), dataIndex: 'k1', align: 'left', width: 100, customCell: groupCustomCell},
    {title: onTarget.value.isTumorSample ? t('TumorValue') : t('Value'), dataIndex: 'k2', align: 'center', width: 120, customCell: groupCustomCell},
    // {title: '对照数值', dataIndex: 'k3', align: 'center', width: 120, customCell: groupCustomCell},
    // {title: '质控标准', dataIndex: 'k4', align: 'center', width: 120, customCell: groupCustomCell},
  ]

  if (props.samples.length !== 1) {
    result.push({title: t('ControlValue'), dataIndex: 'k3', align: 'center', width: 120, customCell: groupCustomCell})
  }

  // 2023.04.25 去掉该列
  // result.push({title: t('QC Standards'), dataIndex: 'k4', align: 'center', width: 120, customCell: groupCustomCell})
  return result
})

const rows = ref([])
const onTarget = ref({
  isTumorSample: true,
  tumorTargetRate: '',
  controlTargetRate: ''
})

onMounted(() => {
  readQcInfo()
  readReportText()
})

watch(langCode, v => {
  // 国际化切换，刷新qc info
  readQcInfo()
})

const readQcInfo = () => {
  loading.value = true
  const suffix = langCode.value === 'en' ? 'EN' : 'CN'
  readTaskFile(route.params.id, `QC/QC_info_${suffix}`).then(res => {
    const ks = columns.value.map(t => t.dataIndex).splice(1)
    rows.value = getCsvData(res, {fields: ks, splitter: '\t', hasHeaderLine: false})
  }).finally(() => {
    loading.value = false
  })
}

// 依赖祖父组件注入的样本信息
const sampleInfo = inject('sampleInfo')
const readReportText = () => {
  console.log('====> inject sampleInfo', sampleInfo)
  getReportText(route.params.id, 'ONTARGET').then(res => {
    const vs = res.split('\n')
    vs.forEach(line => {
      const items = line.split('\t')
      // 比对任务中的样本识别号，解析对应的中靶率
      if (items[0] === sampleInfo.value.tumorSampleId) {
        onTarget.value.tumorTargetRate = items[1]
      } else if (items[0] === sampleInfo.value.controlSampleId) {
        onTarget.value.controlTargetRate = items[1]
      }

      // 单样本情况下，样本也有可能不是肿瘤样本
      if (sampleInfo.value.isSingle) {
        onTarget.value.isTumorSample = props.samples[0]?.sample_meta?.is_panel
      }
    })
  })
}
</script>
<style lang="scss">
table {
  tr {
    line-height: 22px;
  }
}
</style>
