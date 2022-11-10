<template>
    <div class="q-py-sm">
        <div class="text-bold">肿瘤样本的中靶率：XX%，对照样本中靶率：XX%</div>
    </div>
    <q-separator></q-separator>
    <div class="q-py-sm">
        <a-table
            class="col-5 q-px-lg"
            size="small"
            :data-source="rows"
            :columns="columns"
            :sticky="true"
            :pagination="false"
            @change="tableChange"
        >
        </a-table>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router'
import { getReport } from "src/api/report"

const route = useRoute()

const groupCustomCell = (_, rowIndex, column) => {
    if (rowIndex === 1 || rowIndex === 5) {
        return { style: 'border-bottom-color:blue' }
    }
    if (rowIndex === 11) {
        return { style: 'border-top-color:blue; border-top-style: solid; font-weight:bold;' }
    }
    return {}
}
const columns = [
    {
        key: 'a',
        width: 40,
        dataIndex: 'group',
        customCell: (_, rowIndex, column) => {
            let ret = { style: 'font-weight: bold;'}
            if (rowIndex === 1 || rowIndex === 5) {
                ret.style = 'border-bottom-color:blue'
            }
            if (rowIndex === 11) {
                return { style: 'border-top-color:blue; border-top-style: solid; font-weight:bold;' }
            }
            return ret
        },
        customRender: ({text, record, index, column}) => {
            if (index === 0) {
                return '病理评估'
            }
            if (index === 2) {
                return 'DNA质量评估'
            }
            if (index === 6) {
                return '测序质量评估'
            }
        }
    },
    {title: '质量参数', dataIndex: 'k1',  align: 'left', width: 100, customCell: groupCustomCell},
    {title: '肿瘤数值', dataIndex: 'k2', align: 'center', width: 120, customCell: groupCustomCell},
    {title: '对照数值', dataIndex: 'k3', align: 'center', width: 120, customCell: groupCustomCell},
    {title: '质控标准', dataIndex: 'k4', align: 'center', width: 120, customCell: groupCustomCell},
]

const rows = ref([])

onMounted(() => {
    getReport(route.params.id, 'QC', {}, ['k1', 'k2', 'k3', 'k4']).then(res => {
        console.log('----------RRRRRRRRRRRRR', res)
        rows.value = res
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
