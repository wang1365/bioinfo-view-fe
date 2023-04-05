<template>
    <div class="q-py-sm">
        <div class="text-bold">
            <span>{{$t('OnTargetRateOfTumorSamples') + `：${onTarget.v1}`}}</span>
            <span v-if="props.samples.length > 1">{{'，' + $t('OnTargetRateOfControlSamples') + `：${onTarget.v2}`}}</span>
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
import {ref, onMounted, computed} from "vue";
import { useRoute } from 'vue-router'
import { getReportTable, getReportText } from "src/api/report"
import { readTaskFile } from "src/api/task"
import { getCsvData } from "src/utils/csv"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
        return { style: 'border-bottom-color:blue' }
    }
    if (rowIndex === rows.value.length - 1) {
        return { style: 'border-top-color:blue; border-top-style: solid; font-weight:bold; font-size: 15px' }
    }
    return {}
}

const columns = computed(() => {
   let result = [
        {
            key: 'a',
            width: 40,
            dataIndex: 'group',
            customCell: (_, rowIndex, column) => {
                let ret = { style: 'font-weight: bold;'}
                if (rowIndex === 0 || rowIndex === 3) {
                    ret.style = 'font-weight: bold;border-bottom-color:blue'
                }
                if (rowIndex === rows.value.length - 1) {
                    return { style: 'border-top-color:blue; border-top-style: solid; font-weight:bold;' }
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
        {title: t('QualityParameters'), dataIndex: 'k1',  align: 'left', width: 100, customCell: groupCustomCell},
        {title: t('TumorValue'), dataIndex: 'k2', align: 'center', width: 120, customCell: groupCustomCell},
        // {title: '对照数值', dataIndex: 'k3', align: 'center', width: 120, customCell: groupCustomCell},
        // {title: '质控标准', dataIndex: 'k4', align: 'center', width: 120, customCell: groupCustomCell},
    ]

    if (props.samples.length !== 1) {
        result.push({title: t('ControlValue'), dataIndex: 'k3', align: 'center', width: 120, customCell: groupCustomCell})
    }
    result.push({title: t('QC Standards'), dataIndex: 'k4', align: 'center', width: 120, customCell: groupCustomCell})
    return result
})

const rows = ref([])
const onTarget = ref({
    v1: '', v2: ''
})

onMounted(() => {
    loading.value = true

    readTaskFile(route.params.id, 'QC/QC_info').then(res => {
        const ks = columns.value.map(t => t.dataIndex).splice(1)
        rows.value = getCsvData(res, {fields: ks, splitter:'\t',    hasHeaderLine:false})
    }).finally(() => {
        loading.value = false
    })

    getReportText(route.params.id, 'ONTARGET').then(res => {
        const vs = res.split('\n')
        onTarget.value = {
            v1: vs[0], v2: vs[1]
        }
    })
})
</script>
<style lang="scss">
table {
    tr {
        line-height: 22px;
    }
}
</style>
