<template>
    <div class="row q-gutter-sm justify-between">
        <div v-if="!isSingle" class="text-h6 text-purple">肿瘤单样品融合</div>
        <div class="row col-4">
            <q-input
                v-model="keyword1"
                class="col p-mr-sm q-gutter-xs"
                dense
                label="搜索:"
                clearable
                @clear="clearKeyword1"
            />
            <q-btn
                class="col-2 p-pa-xs"
                size="small"
                color="primary"
                label="搜索"
                @click="searchKeyword1"
            ></q-btn>
        </div>
    </div>
    <div class="bio-data-table q-py-sm">
        <a-table
            size="small"
            bordered
            :loading="loading1"
            :data-source="filteredRows1"
            :columns="columns1"
            :sticky="true"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.key === 'k9'"
                    label="查看"
                    color="primary"
                    outline
                    size="xs"
                    @click="clickView(record)"
                ></q-btn>
            </template>
        </a-table>
    </div>

    <div v-if="!isSingle" class="row q-gutter-sm justify-between">
        <div class="text-h6 text-primary">对照单样品融合</div>
        <div class="row col-4">
            <q-input
                v-model="keyword2"
                class="col p-mr-sm q-gutter-xs"
                dense
                label="搜索:"
                clearable
                @clear="clearKeyword2"
            />
            <q-btn
                class="col-2 p-pa-xs"
                size="small"
                color="primary"
                label="搜索"
                @click="searchKeyword2"
            ></q-btn>
        </div>
    </div>
    <div v-if="!isSingle" class="bio-data-table q-py-sm">
        <a-table
            size="small"
            bordered
            :loading="loading2"
            :data-source="filteredRows2"
            :columns="columns2"
            :sticky="true"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.key === 'k9'"
                    label="查看"
                    color="primary"
                    outline
                    size="xs"
                    @click="clickView(record)"
                ></q-btn>
            </template>
        </a-table>
    </div>
    <q-dialog v-model="igvVisible">
        <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
            <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import { exportFile } from 'quasar'
import IGV from './Igv.vue'
import { readTaskFile } from 'src/api/task'
import { getCsvData } from 'src/utils/csv'
import { getDualIdentifiers } from 'src/utils/samples'

const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    qt: {
        type: Object,
        required: false,
        default() {
            return {
                rows: [],
                header: {},
                searchParams: '',
            }
        },
    },
    qn: {
        type: Object,
        required: false,
        default() {
            return {
                rows: [],
                header: {},
                searchParams: '',
            }
        },
    },
})

const isSingle = computed(() => props.samples.length === 1)

const keyword1 = ref('')
const keyword2 = ref('')

const columns1 = ref([])
const columns2 = ref([])

const filteredRows1 = ref([])
const filteredRows2 = ref([])

const igvVisible = ref(false)
const selectedFile = ref('')

const searchKeyword1 = () => {
    filteredRows1.value = qt.value.rows.value.filter((t) => t.k1.includes(keyword1.value))
}

const searchKeyword2 = () => {
    filteredRows2.value = qn.value.rows.value.filter((t) => t.k1.includes(keyword2.value))
}

const clearKeyword1 = () => {
    filteredRows1.value = qt.value.rows
}

const clearKeyword2 = () => {
    filteredRows2.value = qn.value.rows
}

const clickView = (record) => {
    console.log('click', record)
    selectedFile.value = record.k9
    igvVisible.value = true
}

const { qt, qn } = toRefs(props)
/* onMounted(() => {
 *     loading1.value = true
 *     loading2.value = true
 *
 *     const fields = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9']
 *     const width = [30, 30, 60, 60, 60, 60, 60, 200, 50]
 *
 *     const { qt, qn } = getDualIdentifiers(props.samples)
 *     readTaskFile(route.params.id, `fusion_germline/${qt}.fusions`)
 *         .then((res) => {
 *             const lines = getCsvData(res, { fields: fields, hasHeaderLine: false })
 *             const head = lines[0]
 *             columns1.value = Object.keys(head).map((k) => {
 *                 return { title: head[k], key: k, dataIndex: k, align: 'center' }
 *             })
 *             columns1.value.forEach((col, i) => {
 *                 col.width = width[i]
 *                 if (col.key === 'k8') {
 *                     col.align = 'left'
 *                 }
 *             })
 *             rows1.value = lines.slice(1)
 *             filteredRows1.value = rows1.value
 *         })
 *         .finally(() => {
 *             loading1.value = false
 *         })
 *
 *     if (props.samples.length > 1) {
 *         readTaskFile(route.params.id, `fusion_germline/${qn}.fusions`)
 *             .then((res) => {
 *                 const lines = getCsvData(res, { fields: fields, hasHeaderLine: false })
 *                 const head = lines[0]
 *                 columns2.value = Object.keys(head).map((k) => {
 *                     return { title: head[k], key: k, dataIndex: k, align: 'center' }
 *                 })
 *                 rows2.value = lines.slice(1)
 *                 filteredRows2.value = rows2.value
 *             })
 *             .finally(() => {
 *                 loading2.value = false
 *             })
 *     }
 * }) */
watch(qt, () => {
    loadData()
})
onMounted(() => {
    loadData()
})
const loadData = () => {
    const width = [30, 30, 60, 60, 60, 60, 60, 200, 50]

    columns1.value = Object.keys(qt.value.header).map((k) => {
        return { title: qt.value.header[k], key: k, dataIndex: k, align: 'center' }
    })
    columns1.value.forEach((col, i) => {
        col.width = width[i]
        if (col.key === 'k8') {
            col.align = 'left'
        }
    })
    keyword1.value = qt.value.searchParam
    searchKeyword1()
    if (props.samples.length > 1) {
        columns2.value = Object.keys(qn.value.header).map((k) => {
            return { title: qn.value.header[k], key: k, dataIndex: k, align: 'center' }
        })
        keyword2.value = qn.value.searchParam
        searchKeyword2()
    }
}
</script>
