<template>
    <div>
        <div style="text-align:right" class="q-py-md">
            <q-btn
                icon="help_outline"
                size="small"
                outline
                color="orange"
                class="q-mr-md"
                @click="dlgVisible = !dlgVisible"
                >{{$t('Intro')}}</q-btn
            >
            <q-btn
                v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
                icon="bookmarks"
                size="small"
                color="primary"
                class="q-mr-md"
                :label="$t('ReportStickDone')"
                @click="unstick()"
            />
            <q-btn
                v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
                icon="bookmarks"
                size="small"
                outline
                color="primary"
                class="q-mr-md"
                @click="stickFilter()"
                :label="$t('ReportStickData')"
            />
        </div>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ viewConfig.title }}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{intro}}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">{{ $t('Close')}}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-tabs
            v-model="tab"
            dense
            align="left"
            active-color="primary"
            active-bg-color="grey-5"
            class="bg-grey-2 shadow-2"
            indicator-color="primary"
            inline-label
            :breakpoint="0"
        >
            <q-tab v-for="table in tables" :label="table.name" :name="table.name" :key="table.name" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel v-for="table in tables" :name="table.name" :key="table.name">
                <q-toolbar class="text-primary">
                    <q-input
                        v-model="table.keyword"
                        class="q-mr-sm"
                        dense
                        :label="$t('Search') + ':'"
                        clearable
                        @clear="clearKeyword(table)"
                        style="width:300px"
                        :disable="props.viewConfig.showStick && props.viewConfig.stickDone"
                    />
                    <q-btn
                        size="small"
                        color="primary"
                        :label="$t('Search')"
                        @click="searchKeyword(table)"
                        :disable="props.viewConfig.showStick && props.viewConfig.stickDone"
                    ></q-btn>
                    <q-space />
                    <q-btn
                        :href="table.url"
                        :download="table.fileName"
                        :label="$t('Download')"
                        icon="download"
                        size="12px"
                        flat
                    />
                </q-toolbar>
                <div style="position:relative">
                    <q-icon
                        color="accent"
                        name="question_mark"
                        size="xs"
                        style="position:absolute;z-index:100;left:0px;top:0px"
                    >
                        <q-tooltip>{{$t('OnlySelectAllThisPageFilterResult')}}</q-tooltip>
                    </q-icon>
                    <a-table
                        style="z-index:1"
                        class="col-5"
                        size="middle"
                        rowKey="lineNumber"
                        bordered
                        :scroll="{ x: table.columns.length * 100, y: 600 }"
                        :data-source="table.filteredRows"
                        :columns="table.columns"
                        :sticky="true"
                        :row-selection="{ selectedRowKeys: getTableSelectedRows(table), onChange: onSelectChange, columnWidth: 35, getCheckboxProps: getCheckboxProps }"
                    >
                        <template #bodyCell="{ column, record }">
                            <q-btn
                                v-if="column.config.type === 'image'"
                                size="12px"
                                flat
                                color="primary"
                                :label="$t('View')"
                                @click="clickView(record,column.title)"
                            />
                            <q-btn
                                v-if="column.config.type === 'file'"
                                :href="`igv${record[column.dataIndex]}`"
                                :download="`igv${record[column.dataIndex]}`"
                                :label="$t('Download')"
                                icon="download"
                                text-color="primary"
                                size="sm"
                                flat
                            />
                            <a
                                v-if="column.config.type === 'link'"
                                :href="record[column.dataIndex]"
                                target="_blank"
                                >{{$t('View')}}</a
                            >
                            <template
                                v-if="(column.title.includes('Plot') || column.title.includes('plot')) && record[column.dataIndex]!=='-' && record[column.dataIndex]"
                            >
                                <q-btn
                                    size="12px"
                                    flat
                                    color="primary"
                                    :label="$t('View')"
                                    @click="clickView(record,column.title)"
                                />
                            </template>
                            <template v-else>
                                <template
                                    v-if="record[column.dataIndex].endsWith('.png') || record[column.dataIndex].endsWith('.jpeg')"
                                >
                                    <q-img
                                        class="q-mt-sm cursor-pointer"
                                        :src="'/igv'+ record[column.dataIndex]"
                                        style="max-height: 30px; max-width: 60px; padding: 0; margin: 0;"
                                        fit="contain"
                                        position="left"
                                        @click="clickView(record,column.title)"
                                    />
                                </template>
                            </template>
                        </template>
                    </a-table>
                </div>
            </q-tab-panel>
        </q-tab-panels>

        <template v-for="file in files" :key="file.buttonName">
            <q-btn
                :label="file.buttonName"
                color="primary"
                icon="download"
                type="href"
                :href="`/igv${file.filePath}`"
                target="_blank"
                class="q-mb-sm"
            >
            </q-btn>
        </template>
        <q-dialog v-model="showImage">
            <q-card style="width:80%;max-width:1000px;height:550px;align-items: center">
                <q-card-section>
                    <img :src="imageUrl" alt="" style="height:500px;background-color:white" />
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- <a-table :columns="columns" :data-source="rows" @change="onChange" /> -->
        <div>
            <template v-for="(image, index) in images" :key="image">
                <q-separator color="primary" class="q-my-sm" />
                <div class="items-start">
                    <div class="q-ml-sm q-mt-lg">
                        <q-btn
                            icon="add"
                            size="sm"
                            color="primary"
                            outline
                            round
                            class="q-mx-sm"
                            @click="zoomIn(index)"
                            :title="$t('ZoomIn')"
                        />
                        <q-btn
                            icon="remove"
                            size="sm"
                            color="primary"
                            outline
                            round
                            @click="zoomOut(index)"
                            :title="$t('ZoomOut')"
                        />
                    </div>
                    <q-img
                        class="text-primary"
                        :src="image.url"
                        fit="contain"
                        :style="`max-width: ${imageScales[index] || 85}%; transition: all 0.3s ease;`"
                        position="0 20px"
                    />
                </div>
                <div class="text-primary q-mt-sm">{{ image.description }}</div>
            </template>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, ref, toRef, watch} from 'vue'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import { useQuasar } from "quasar"
import { storeToRefs } from 'pinia'
import { globalStore } from 'src/stores/global'

const store = globalStore()
const { langCode } = storeToRefs(store)
const $q = useQuasar()
const dlgVisible = ref(false)
const imageScales = ref({}) // 存储每个图片的缩放比例
const props = defineProps({
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showSticky: false,
            }
        },
    },
    task: {
        required: true,
        default: () => { },
    },
    stepData: {
        type: Object,
        default: () => { }
    }
})

const tab = ref('')
const stepData = toRef(props, 'stepData')
const unsortedTables = ref([])
const intro = ref('')
const images = ref([])

const tables = computed( () => {
    const sortedTables = [...unsortedTables.value];
    sortedTables.sort((a, b) => {
        return a.i - b.i
    })
    return sortedTables.map(t => t.data)
})

const files = computed(() => props.viewConfig.files || [])

const clearKeyword = (table) => {
    table.filteredRows = table.rows
    table.keyword = ''
    searchKeyword(table)
}
const searchKeyword = (table) => {
    if (table.keyword) {
        table.filteredRows = table.rows.filter((t) => {
            for (let key in t) {
                if (t[key].toString().includes(table.keyword)) {
                    return true
                }
            }
            return false
        })
    } else {
        table.filteredRows = table.rows
    }
    if (tableData.value[table.name]) { tableData.value[table.name].selectedRows = [] }
}

onMounted(() => {
    initIntro()
    initTable()
    initImages()
})

// 这个组件内不能通过监听语言变化来重新加载数据，因为数据文件的路径是从父组件传递来的
// 语言切换后父组件会重新读取配置文件更新配置后传递给当前组件
// 所以本组件内可能先侦听到语言切换，此时配置还没有更新，导致加载的还是原来语言的数据
// 所以此处直接监听配置文件来刷新数据
watch(() => props.viewConfig,
    () => {
    initIntro()
    initTable()
    initImages()
})

// ctr
const showImage = ref(false)
const imageUrl = ref('')
const clickView = (record, title) => {
    showImage.value = true
    imageUrl.value = `/igv${record[title]}`
}
// ctr


const initIntro = () => {
    const { descriptionFile } = props.viewConfig
    if (descriptionFile) {
        readTaskFile(props.task.id, descriptionFile).then((res) => {
            intro.value = res
        })
    }
}
const tableData = ref({})
const initTable = () => {
    const tableList = props.viewConfig.tables || []
    if (tableList.length > 0) {
      $q.loading.show({ delay: 100 })
    }
    unsortedTables.value = []
    // const tmpTables = []
    tableList.forEach((table, i) => {
        tableData.value[table.title] = {}
        const configs = table.columns || []
        const configMap = {}
        configs.forEach((config) => {
            configMap[config.name] = config
        })


        readTaskFile(props.task.id, table.file).then((res) => {
            const colNames = getCsvHeader(res)
            const rows = getCsvDataAndSetLineNumber(res, { fields: colNames })
            const columns = colNames.map((name) => {
                // 当前列所有数据去重，作为筛选项
                const values = [...new Set(rows.map((t) => t[name]))]
                return {
                    title: name,
                    dataIndex: name,
                    width: 200,
                    ellipsis: true,
                    align: 'center',
                    filters: values.map((v) => {
                        return { text: v, value: v }
                    }),
                    onFilter: (value, record) => record[name].indexOf(value) === 0,
                    config: configMap[name] || {} // 列配置
                }
            })
            // 添加表格定义
            let data = {
                name: table.name,           // 表格tab名称
                rows,                       // 表格全量数据
                columns,                    // 表格表头
                filteredRows: rows,         // 表格过滤后数据
                url: '/igv' + table.file,   // 下载链接
                fileName: table.file.substring(table.file.lastIndexOf('/') + 1),
                keyword: ''                 // 检索关键字
            }
            // tables.value[i] = data
            unsortedTables.value.push({data, i})

            if (i === 0) {
                tab.value = table.name
            }
            console.log(stepData.value)
            if (stepData.value && stepData.value.tables) {
                for (const item of stepData.value.tables) {
                    if (item.name === table.name) {
                        data.keyword = item.searchParam
                        searchKeyword(data)
                        tableData.value[table.name] = { selectedRows: item.selectedRows }
                    }
                }
            }

            $q.loading.hide()
        })
    })
}

const initImages = () => {
    images.value = props.viewConfig.images || []
    images.value.forEach((img) => {
        img.url = '/igv' + img.file
        readTaskFile(props.task.id, img.descriptionFile).then((res) => {
            img.description = res
        })
    })
}

const getTableSelectedRows = (table) => {
    if (tableData.value[table.name]) {
        return tableData.value[table.name].selectedRows
    }
    return []
}
const onSelectChange = (selectedRowKeys) => {
    if (tableData.value[tab.value]) { tableData.value[tab.value].selectedRows = selectedRowKeys }
    else {
        tableData.value[tab.value] = { selectedRows: selectedRowKeys }
    }
}
const viewConfig = toRef(props, 'viewConfig')
const getCheckboxProps = (record) => {
    return {
        disabled: viewConfig.value.showStick && viewConfig.value.stickDone, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}
const emit = defineEmits(['stickDone', 'reset'])
const stickFilter = () => {
    var results = []
    for (const table of tables.value) {
        let selectedRows = []
        if (tableData.value[table.name] && tableData.value[table.name].selectedRows) {
            selectedRows = tableData.value[table.name].selectedRows
        }
        let data = {
            filtered: table.rows.length !== table.filteredRows.length,
            searchParam: table.keyword,
            selected: tableData.value[table.name],
            selectedRows: selectedRows,
            selected: selectedRows.length > 0,
            name: table.name
        }
        results.push(data)
    }
    emit('stickDone', { tables: results })
}
const unstick = () => {
    emit('reset', null)
    tableData.value = {}
    for (let table of tables.value) {
        table.keyword = ''
        table.filteredRows = table.rows
    }
}

// 图片缩放方法
const zoomIn = (index) => {
    const currentScale = imageScales.value[index] || 85
    const newScale = Math.min(currentScale + 15, 200) // 最大200%
    imageScales.value[index] = newScale
}

const zoomOut = (index) => {
    const currentScale = imageScales.value[index] || 85
    const newScale = Math.max(currentScale - 15, 30) // 最小30%
    imageScales.value[index] = newScale
}
</script>

<style scoped></style>
