<template>
<div>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md"
        @click="dlgVisible = !dlgVisible"
    >说明</q-btn>
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
    <a-table :columns="columns" :data-source="rows" @change="onChange" />
    <q-separator color="primary"/>
    <div>
        <template v-for="image in images" :key="image">
            <q-img class="q-mt-lg text-primary" :src="image.url" height="100%" width="100%" fit="contain"/>
            <span class="text-primary">{{image.description}}</span>
        </template>
    </div>
</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'

const dlgVisible = ref(false)
const props = defineProps({
    viewConfig: {
        required: true,
        default: () => {}
    },
    task: {
        required: true,
        default: () => {}
    }
})

const columns = ref([])
const rows = ref([])
const intro = ref('')
const images = ref([])

onMounted(() => {
    initIntro()
    initTable()
    initImages()
})

const initIntro = () => {
    const { descriptionFile } = props.viewConfig
    if (descriptionFile) {
        readTaskFile(props.task.id, descriptionFile).then(res => {
            intro.value = res
        })
    }
}

const initTable = () => {
    const { table } = props.viewConfig
    if (table) {
        readTaskFile(props.task.id, table.file).then(res => {
            const colNames = getCsvHeader(res)
            rows.value = getCsvData(res, { fields: colNames })
            columns.value = colNames.map(name => {
                // 当前列所有数据去重，作为筛选项
                const values = [...new Set(rows.value.map(t => t[name]))]
                return {
                    title: name,
                    dataIndex: name,
                    align: 'center',
                    filters: values.map(v => {
                        return {text:v, value:v}
                    }),
                    onFilter: (value, record) => record[name].indexOf(value) === 0
                }
            })
        })
    }
}


const initImages = () => {
    images.value = props.viewConfig.images || []
    images.value.forEach(img => {
        img.url ='/igv' + img.file
        readTaskFile(props.task.id, img.descriptionFile).then(res => {
            img.description = res
        })
    })
}

const onChange = () => {

}
</script>

<style scoped>


</style>
