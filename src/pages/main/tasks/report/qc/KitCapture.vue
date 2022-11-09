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
const groupCustomCell = (_, rowIndex, column) => {
    if (rowIndex === 1 || rowIndex === 5) {
        return { style: 'border-bottom-color:blue' }
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
    {key: 'gene', title: '质量参数', dataIndex: 'gene',  align: 'left', width: 100, customCell: groupCustomCell},
    {key: 'avg', title: '肿瘤数值', dataIndex: 'avg', align: 'center', width: 120, customCell: groupCustomCell},
    {key: 'mid', title: '对照数值', dataIndex: 'mid', align: 'center', width: 120, customCell: groupCustomCell},
    {key: 'ratio', title: '质控标准', dataIndex: 'ratio', align: 'center', width: 120, customCell: groupCustomCell},
]

const rows = ref([
    { gene:'恶性肿瘤细胞占比(%)', avg:'40.0', mid:'0.0', ratio: '>20'},

    { gene:'DNA总量（ng）', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'DNA片段降解程度', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'预计文库总量（ng)', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'R1碱基质量Q30占比(%)', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'R2碱基质量Q30占比(%)', avg: 'A', mid:114, ratio: 'A/B/C/D'},

    { gene:'平均测序深度', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'去重后平均测序深度', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'插入片段长度', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'大于0.2x测序深度占比(%)', avg: 'A', mid:114, ratio: 'A/B/C/D'},
    { gene:'比对率(%)', avg: 'A', mid:114, ratio: 'A/B/C/D'},
])
</script>
<style lang="scss">
table {
    tr {
        line-height: 22px;
    }
}
</style>
