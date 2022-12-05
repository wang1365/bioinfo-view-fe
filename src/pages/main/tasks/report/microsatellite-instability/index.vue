<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明</q-btn
    >
    <div class="q-py-md" v-if="props.viewConfig.showMSI">
        <div class="text-h6 text-primary text-bold">总体微卫星状态表</div>
        <a-table
            class="col-5"
            size="small"
            bordered
            :loading="loading1"
            :data-source="rows1"
            :columns="columns1"
            :sticky="true"
        >
        </a-table>
    </div>
    <div class="q-py-md" v-if="props.viewConfig.showMSIsite">
        <div class="text-h6 text-primary text-bold">金标微卫星图</div>
        <!-- TODO: 这里点击最后一列时,如果没有图片需要提 bed文件不包含金标微卫星位点 -->
        <a-table
            class="col-5"
            size="small"
            bordered
            :loading="loading1"
            :data-source="rows2"
            :columns="columns2"
            :sticky="true"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.key === 'k3'"
                    :label="record.k3"
                    color="primary"
                    flat
                    size="xs"
                    @click="clickView(record)"
                >
                </q-btn>
            </template>
        </a-table>
    </div>
    <q-dialog v-model="showImage">
        <q-card style="width:850px;max-width:1000px;height:550px;align-items: center">
            <q-card-section>
                <img :src="imageUrl" alt="" style="width:750px;height:450px;background-color:white" />
            </q-card-section>
        </q-card>
    </q-dialog>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">微卫星不稳定</q-bar>
            <q-card-section>
                <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">关闭</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import {readTaskFile} from "src/api/task";
import { useRoute } from 'vue-router'
import { getCsvData } from "src/utils/csv";
import {getDualIdentifiers, getSingleIdentifiers} from "src/utils/samples";

const route = useRoute()
const showImage = ref('false')
const imageUrl = ref('')
const dlgVisible = ref(false)

const loading1 = ref(false)
const loading2 = ref(false)

const rows1 = ref([])
const rows2 = ref([])

const columns1 = ref([
    {key: 'k1', title: 'Total_Number_of_Sites', dataIndex: 'k1', align: 'center', width: 50},
    {key: 'k2', title: 'Number_of_Somatic_Sites', dataIndex: 'k2', align: 'center', width: 50},
    {key: 'k3', title: '%', dataIndex: 'k3', align: 'center', width: 50}
])
const columns2 = ref([
    {key: 'k1', title: 'CHROM', dataIndex: 'k1', align: 'center', width: 50},
    {key: 'k2', title: 'POSITION', dataIndex: 'k2', align: 'center', width: 50},
    {key: 'k3', title: 'NAME', dataIndex: 'k3', align: 'center', width: 50}
])



const props = defineProps({
    intro: {
        type: String,
        required: false
    },
    task: {
        type: Object,
        required: true
    },
    samples: {
        type: Array,
        required: false,
        default: () => []
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showMSI: true,
                showMSIsite: true
            }
        }
    }
})

const clickView = (record) => {
    showImage.value = true
    imageUrl.value = `/igv${props.task.result_dir}/MSI/${record.k3}.jpeg`
}

onMounted(() => {
    if (props.viewConfig.showMSI) {
        let file;
        if (props.samples.length > 1) {
            const {qn, qt} = getDualIdentifiers(props.samples)
            file = `MSI/${qn}_${qt}.msi`
            //'MSI/QN11_QT11.msi')
        } else {
            const qt = getSingleIdentifiers(props.samples)
            file = `MSI/${qt}.msi`
        }

        readTaskFile(route.params.id, file).then(res => {
            rows1.value = getCsvData(res, {fields: ['k1', 'k2', 'k3']})
        })
    }

    if (props.viewConfig.showMSIsite) {
        readTaskFile(route.params.id, 'MSI/jingbiao.msi').then(res => {
            rows2.value = getCsvData(res, { fields: ['k1', 'k2', 'k3']} )
        })
    }
})
</script>
