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
                >说明</q-btn
            >
            <q-btn
                v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
                icon="bookmarks"
                size="small"
                color="primary"
                class="q-mr-md"
                label="已固定过滤"
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
                >固定过滤</q-btn
            >
        </div>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 800px; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{viewConfig.title}}</q-bar>
                <q-card-section>
                    <q-input :model-value="intro" readonly autogrow type="textarea"></q-input>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">关闭</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-toolbar class="text-primary">
            <q-input
                v-model="keyword"
                class="q-mr-sm"
                dense
                label="搜索:"
                clearable
                @clear="clearKeyword"
                style="width:300px"
            />
            <q-btn size="small" color="primary" label="搜索" @click="searchKeyword"></q-btn>
        </q-toolbar>
        <div style="position:relative">
            <q-icon
                color="accent"
                name="question_mark"
                size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px"
            >
                <q-tooltip>仅全选本页筛选结果</q-tooltip>
            </q-icon>
            <a-table
                style="z-index:1"
                class="col-5"
                size="middle"
                rowKey="lineNumber"
                bordered
                :loading="loading"
                :data-source="filteredRows"
                :columns="columns"
                :sticky="true"
                :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange, columnWidth:25 }"
            ></a-table>
        </div>
        <!-- <a-table :columns="columns" :data-source="rows" @change="onChange" /> -->
        <q-separator color="primary" />
        <div>
            <template v-for="image in images" :key="image">
                <q-img
                    class="q-mt-lg text-primary"
                    :src="image.url"
                    style="max-height: 500px"
                    fit="contain"
                    position="0 20px"
                />
                <div class="text-primary">{{image.description}}</div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref ,toRef} from 'vue'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'

const dlgVisible = ref(false)
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
        default: () => {},
    },
    stepData: {
        type: Object,
        default: () => { }
    }
})
const stepData = toRef(props, 'stepData')
const columns = ref([])
const rows = ref([])
const filteredRows = ref([])
const intro = ref('')
const images = ref([])
const keyword = ref('')
const clearKeyword = () => {
    filteredRows.value = rows.value
    keyword.value = ''
    searchKeyword()
}
const searchKeyword = () => {
    if (keyword.value) {
        filteredRows.value = rows.value.filter((t) => {
            for (let key in t) {
                if (t[key].toString().includes(keyword.value)) {
                    return true
                }
            }
            return false
        })
    } else {
        filteredRows.value = rows.value
    }
}
onMounted(() => {
    initIntro()
    initTable()
    initImages()
})

const initIntro = () => {
    const { descriptionFile } = props.viewConfig
    if (descriptionFile) {
        readTaskFile(props.task.id, descriptionFile).then((res) => {
            intro.value = res
        })
    }
}

const initTable = () => {
    const { table } = props.viewConfig
    if (table) {
        readTaskFile(props.task.id, table.file).then((res) => {
            const colNames = getCsvHeader(res)
            rows.value = getCsvDataAndSetLineNumber(res, { fields: colNames })
            columns.value = colNames.map((name) => {
                // 当前列所有数据去重，作为筛选项
                const values = [...new Set(rows.value.map((t) => t[name]))]
                return {
                    title: name,
                    dataIndex: name,
                    align: 'center',
                    filters: values.map((v) => {
                        return { text: v, value: v }
                    }),
                    onFilter: (value, record) => record[name].indexOf(value) === 0,
                }
            })
            filteredRows.value = rows.value
            if(stepData.value && stepData.value.searchParam){
                keyword.value=stepData.value.searchParam

                searchKeyword()

            }
            if(stepData.value && stepData.value.selectedRows){
                    selectedRows.value=stepData.value.selectedRows
                }
        })
    }
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

const onChange = () => {}
const selectedRows = ref([])

const onSelectChange = (selectedRowKeys) => {
    selectedRows.value = selectedRowKeys
}
const emit = defineEmits(['stickDone','reset'])
const stickFilter = () => {
    let data = {
        searchParam: keyword.value,
        selectedRows: selectedRows.value,
        filtered: rows.value.length != filteredRows.value.length,
        selected: selectedRows.value.length > 0,
    }
     emit('stickDone', data)
}
const unstick=()=>{
    emit('reset',null)
    selectedRows.value=[]
    keyword.value=""
    searchKeyword()
}
</script>

<style scoped></style>
