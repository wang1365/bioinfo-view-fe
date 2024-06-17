<template>
    <q-dialog v-model="dlgVisible" @show="onShow">
        <q-card style="width: 75%; max-width: 1000px">
            <!--            <a-table :data-source="rows" :columns="columns" />-->
            <a-table :data-source="props.record.compareResult" :columns="columns" />
            <q-card-actions align="center">
                <q-btn color="primary" :label="$t('Confirm')" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed, toRef, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getRelatedTasks } from 'src/api/report'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import { useQuasar } from 'quasar'
import { useI18n } from "vue-i18n"
import { globalStore } from 'stores/global'
import { storeToRefs } from 'pinia'


const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const dlgVisible = ref(false)

let selectedDefaultRows = ref([])

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
    category: {
        type: String,
        required: false,
    },
    subCategory: {
        type: String,
        default: ''
    },
    record: {
        type: Object,
        required: false,
    },
    isVirus: {
        type: Boolean,
        required: false,
    }
})

// 国际化切换重新加载数据
// watch(langCode, () => loadData())

const rows = ref([])
const columns = computed(() =>
    [
        { name: 'sample', title: t('Sample'), dataIndex: 'sample'},
        { name: 'speciesName', title: props.isVirus ? t('Virus') : t('Zhong'), dataIndex: 'speciesName'},
        { name: 'totalProportion', title: t('TotalProportion'), dataIndex: 'totalProportion'},
        { name: 'readsCount', title: t('ReadsCount'), dataIndex: 'readsCount'},
    ]
)

// 不同病原体的数据文件配置
// const dataFile = computed(() => {
//     const suffix = langCode.value === 'cn' ? 'CN' : 'EN'
//     const config = {
//         bacteria: `Bacteria/Bacteria_${suffix}.txt`,
//         fungus: `Fungus/Fungus_${suffix}.txt`,
//         virus: `Virus/Virus_${suffix}.txt`,
//         parasite: `Parasite/Parasite_${suffix}.txt`,
//         specificPathogen: {
//             mycobacterium: `SpecificPathogen/SpecificPathogen-mycobacterium_${suffix}.txt`,
//             nomycobacterium:`SpecificPathogen/SpecificPathogen-nomycobacterium_${suffix}.txt`,
//             mycoplasma:`SpecificPathogen/SpecificPathogen-mycoplasma_${suffix}.txt`,
//         }
//     }
//
//     if (props.category === 'specificPathogen') {
//         return config[props.category][props.subCategory]
//     }
//
//     return config[props.category]
// })

// const onShow = () => loadData()
// const loadData = () => {
//     $q.loading.show({ delay: 100 })
//     rows.value = []
//     // 查询同批次样本（同一个项目下的任务）
//     getRelatedTasks(props.task.id).then(res => {
//         // res.filter(task => task.samples.some(sample => ))
//         res.forEach(task => {
//             // 数据key（基于表头的dataIndex，额外增加行的数据文件列file）
//             let fields = ['genusName', 'relativeAbundance', 'readsCount1',
//                 'speciesName', 'proportion', 'readsCount2', 'totalProportion', 'file', 'report']
//             if (props.category === 'virus') {
//                 fields = ['speciesName', 'readsCount2', 'totalProportion', 'file', 'report']
//             }
//             // 解析数据（开始2行为表头，需要排除）
//             console.log("................>", task.id, dataFile.value, props)
//             readTaskFile(task.id, dataFile.value, true).then(fileData => {
//                 const lines = getCsvDataAndSetLineNumber(fileData, { start: 2, fields })
//                 // 找到种名相同的病原体数据
//                 const target = lines.filter(line => line.speciesName === props.record.speciesName)[0]
//                 rows.value.push({
//                     sample: task.samples[0].identifier,
//                     speciesName: target?.speciesName,
//                     totalProportion: target.totalProportion,
//                     readsCount: target.readsCount2,
//                 })
//             })
//         })
//     }).finally(() => $q.loading.hide())
//
// }
</script>

<style lang="scss" scoped></style>
