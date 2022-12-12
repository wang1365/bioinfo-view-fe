<template>
    <div>
        <q-btn
            v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            color="primary"
            class="relative-position float-right q-mr-md"
            label="已固定过滤"
        />
        <q-btn
            v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            outline
            color="primary"
            class="relative-position float-right q-mr-md"
            @click="stickFilter()"
        >固定过滤</q-btn>
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="relative-position float-right q-mr-md"
            @click="dlgVisible = !dlgVisible"
        >说明</q-btn>
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left"
            class="bg-grey-1"
            :breakpoint="0"
            dense
        >
            <q-tab name="胚系突变分析" label="胚系突变分析" v-if="props.viewConfig.showMutGermline" />
            <q-tab name="体细胞突变分析" label="体细胞突变分析" v-if="props.viewConfig.showMutSomatic" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="胚系突变分析">
                <GermlineMutationVue
                    :samples="props.samples"
                    :task="props.task"
                    ref="germlineMutationVue"
                    @stickDone="stickDone('germlineMutation',$event)"
                    :searchParams="germlineSearchParams"
                    :originRows="germlineRows"
                    :originHeaders="germlineHeaders"
                    @rowsLoaded="rowsLoaded('germline',$event)"
                    @searchParamsChange="searchParamsChange('germline',$event)"
                />
            </q-tab-panel>
            <q-tab-panel name="体细胞突变分析">
                <SomaticMutationVue
                    :samples="props.samples"
                    :task="props.task"
                    ref="somaticMutationVue"
                    @stickDone="stickDone('somaticMutation',$event)"
                    :originRows="somaticRows"
                    :searchParams="somaticSearchParams"
                    :originHeaders="somaticHeaders"
                    @rowsLoaded="rowsLoaded('somatic',$event)"
                    @searchParamsChange="searchParamsChange('somatic',$event)"
                />
            </q-tab-panel>
        </q-tab-panels>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 800px; max-width: 2000px">
                <q-bar class="bg-primary text-white">突变分析</q-bar>
                <q-card-section>
                    <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">关闭</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { errorMessage } from 'src/utils/notify'
import { ref, onMounted, computed, toRef } from 'vue'
import GermlineMutationVue from './GermlineMutation.vue'
import SomaticMutationVue from './SomaticMutation.vue'

const tab = ref('胚系突变分析')
const dlgVisible = ref(false)

const germlineSearchParams = ref({
    gene: null,
    depth: null,
    ratio: null,
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    mutationRisk: null,
    humanRatio: null,
    sift: null,
    drug: false,
})
const germlineRows = ref([])
const germlineHeaders = ref([])
const somaticSearchParams = ref({
    gene: null,
    tumorDepth: null,
    compareDepth: null,
    tumorRatio: null,
    compareRatio: null,
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    mutationRisk: null,
    humanRatio: null,
    sift: null,
    drug: false,
})
const somaticRows = ref([])
const somaticHeaders = ref([])
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
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showMutGermline: true,
                showMutSomatic: true,
                showSticky: false,
            }
        },
    },
    task: {
        type: Object,
        required: false,
    },
})
const searchParamsChange = (name, data) => {
    if (name == 'germline') {
        germlineSearchParams.value = data
        console.log(germlineSearchParams.value)
    } else {
        somaticSearchParams.value = data
        console.log(somaticSearchParams.value)
    }
}
const rowsLoaded = (name, data) => {
    console.log(name,data)
    if (name == 'germline') {
        germlineRows.value = data.csvRows
        germlineHeaders.value = data.headers
    } else {
        somaticRows.value = data.csvRows
        somaticHeaders.value = data.headers
    }
 }

const stickData = ref({ somaticMutation: {}, germlineMutation: {} })
// germlinemutation 和 somaticmutation 的数据同步
const stickDone = (name, data) => {
    stickData.value[name] = data
}
const emit = defineEmits('stickDone')
const config = toRef(props, 'viewConfig')
const stickFilter = () => {
    if (!stickData.value.germlineMutation.filter && config.value.showMutGermline) {
        errorMessage('胚系突变分析未进行过滤')
        return false
    }
    if (!stickData.value.somaticMutation.filter && config.value.showMutSomatic) {
        errorMessage('体细胞突变分析未进行过滤')
        return false
    }
    emit('stickDone', stickData.value)
}
</script>
