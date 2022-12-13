<template>
    <q-toolbar class="text-primary">
        <q-toolbar-title v-if="!isSingle">肿瘤单样品融合</q-toolbar-title>

        <q-input
            v-model="keyword1"
            class="q-mr-sm"
            dense
            label="搜索:"
            clearable
            @clear="clearKeyword1"
            style="width:300px"
        />
        <q-btn size="small" color="primary" label="搜索" @click="searchKeyword1"></q-btn>
    </q-toolbar>
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
                    size="sm"
                    @click="clickView(record)"
                ></q-btn>
            </template>
        </a-table>
    </div>

    <div v-if="!isSingle">
        <q-toolbar class="text-primary">
            <q-toolbar-title v-if="!isSingle">对照单样品融合</q-toolbar-title>

            <q-input
                v-model="keyword2"
                class="q-mr-sm"
                dense
                label="搜索:"
                clearable
                @clear="clearKeyword2"
                style="width:300px"
            />
            <q-btn size="small" color="primary" label="搜索" @click="searchKeyword2"></q-btn>
        </q-toolbar>
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
                    size="sm"
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
import { ref, onMounted, computed, toRefs, watch, toRef } from 'vue'
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
const route = useRoute()
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
    if (keyword1.value) {
        filteredRows1.value = qt.value.rows.filter((t) => t.k1.includes(keyword1.value))
    } else {
        filteredRows1.value = qt.value.rows
    }
}

const searchKeyword2 = () => {
    if (keyword2.value) {
        filteredRows2.value = qn.value.rows.filter((t) => t.k1.includes(keyword2.value))
    } else {
        filteredRows2.value = qn.value.rows
    }
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

watch(props, () => {
    loadData()
})
onMounted(() => {
    loadData()
})
const samples = toRef(props, 'samples')
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

    if (samples.value.length > 1) {
        columns2.value = Object.keys(qn.value.header).map((k) => {
            return { title: qn.value.header[k], key: k, dataIndex: k, align: 'center' }
        })
        keyword2.value = qn.value.searchParam
        searchKeyword2()
    }
}
</script>
