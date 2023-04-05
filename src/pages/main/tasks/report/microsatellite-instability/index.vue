<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >{{$t('Intro')}}</q-btn
    >
    <div class="q-py-md" v-if="props.viewConfig.showMSI">
        <span class="text-h6 text-primary text-bold q-mr-sm">{{$t('OverallMicrosatelliteStatusTable')}}</span>
        <q-btn
            :href="tableFileUrl1"
            :label="$t('Download')"
            icon="south" padding="sm"
            color="primary"
            target="_blank"
            class="q-ml-sm q-mb-xs"
            :download="tableFileName1"
            size="sm"
        />
        <a-table
            class="col-5"
            size="sm"
            bordered
            :loading="loading1"
            :data-source="rows1"
            :columns="columns1"
            :sticky="true"
        >
        </a-table>
    </div>
    <div class="q-py-md" v-if="props.viewConfig.showMSIsite">
        <span class="text-h6 text-primary text-bold">{{$t('GoldStandardMicrosatelliteImage')}}</span>
        <!-- TODO: 这里点击最后一列时,如果没有图片需要提 bed文件不包含金标微卫星位点 -->
        <q-btn
            :href="tableFileUrl2"
            :label="$t('Download')"
            icon="south" padding="sm"
            color="primary"
            target="_blank"
            class="q-ml-sm q-mb-xs"
            :download="tableFileName2"
            size="sm"
        />
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
        <q-card style="width: 75%; max-width: 2000px">
            <q-bar class="bg-primary text-white">{{$t('MicroSatelliteInstability')}}</q-bar>
            <q-card-section>
                <div style="white-space:pre-wrap; line-height: 35px">{{props.intro}}</div>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">{{$t('Close')}}</q-btn>
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

const tableFileUrl1 = ref('')
const tableFileName1 = ref('')
const tableFileUrl2 = ref('')
const tableFileName2 = ref('')

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
    const {qn, qt} = getDualIdentifiers(props.samples)
    if (props.viewConfig.showMSI) {
        let file;
        if (props.samples.length > 1) {
            file = `MSI/${qn}_${qt}.msi`
            tableFileUrl1.value = `igv${props.task.result_dir}/${file}`
            tableFileName1.value = `${qn}_${qt}.msi.csv`
            //'MSI/QN11_QT11.msi')
        } else {
            const qt = getSingleIdentifiers(props.samples)
            file = `MSI/${qt}.msi`
            tableFileUrl1.value = `igv${props.task.result_dir}/${file}`
            tableFileName1.value = `${qt}.msi.csv`
        }

        readTaskFile(route.params.id, file).then(res => {
            rows1.value = getCsvData(res, {fields: ['k1', 'k2', 'k3']})
        })
    }

    if (props.viewConfig.showMSIsite) {
        tableFileUrl2.value = `igv${props.task.result_dir}/MSI/jingbiao.msi`
        tableFileName2.value = `jingbiao.msi.csv`
        readTaskFile(route.params.id, 'MSI/jingbiao.msi').then(res => {
            rows2.value = getCsvData(res, { fields: ['k1', 'k2', 'k3']} )
        })
    }
})
</script>
