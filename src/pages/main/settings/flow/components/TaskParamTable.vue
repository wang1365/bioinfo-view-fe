<template>
    <!--  <div class="param-item-main param-item">-->
    <q-dialog v-model="dlgVisible" persistent transition-show="fade">
        <q-card class="q-pa-sm">
            <q-table
                ref="paramTable"
                title="自定义参数"
                :rows="params"
                :columns="columns"
                row-key="name"
                color="primary"
                dense
                hide-no-data
                wrap-cells
            >
                <template v-slot:body-cell-required="props">
                    <q-td :props="props">
                        <span class="text-red text-bold"> {{ props.row.required ? '*' : '' }}</span>
                    </q-td>
                </template>
                <template v-slot:body-cell-key="props">
                    <q-td :props="props">
                        <span class="text-blue text-bold"> {{ props.row.key }}</span>
                    </q-td>
                </template>
                <template v-slot:body-cell-value="props">
                    <q-td :props="props" style="width: 200px">
                        <div v-if="props.row.type === 'file'">
                            <q-file filled bottom-slots v-model="props.row.file" label="上传文件" counter max-files="1">
                                <template v-slot:before>
                                    <q-icon name="folder_open" />
                                </template>

                                <template v-slot:hint />
                                <template v-slot:append>
                                    <q-btn round dense flat icon="add" @click.stop />
                                </template>
                            </q-file>
                        </div>
                        <div v-else>
                            <q-input v-if="props.row.choices.length === 0" v-model="props.row.value" />
                            <q-select
                                v-if="props.row.choices.length > 0"
                                filled
                                v-model="props.row.value"
                                :options="props.row.choices"
                                dense
                            />
                        </div>
                    </q-td>
                </template>
                <template v-slot:body-cell-description="props">
                    <q-td :props="props">
                        {{ props.row.desc }}
                    </q-td>
                </template>
            </q-table>
            <q-card-actions align="right">
                <q-btn color="primary" label="确定" @click="clickConfirm" />
                <q-btn label="取消" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import {defineProps, computed, defineExpose, ref, toRefs, watch} from "vue"
import {getFlowDetail} from "src/api/flow"

const props = defineProps({
    flowId: {type: Number, default: null,},
    action: {type: String, default: "info",},
    title: {type: String, default: "",},
});

const {flowId} = toRefs(props)
const flow = ref(null)
const params = ref([])

const currentRow = ref(null)
const choice = ref('')
const dlgVisible = ref(false)


const columns = [
    {name: "required", label: "必填", field: "required", required: true},
    {name: "key", label: "参数名", field: "key", align: "center", headerStyle: 'width: 200px', required: true},
    {name: "value", label: "值类型", field: "type", align: "center", headerStyle: 'width: 400px', required: true},
    {name: "description", label: "说明", field: "description", align: "center", headerStyle: 'width: 400px', required: true},
];

const form = ref([])

watch(flowId, (id) => {
    getFlowDetail(id).then(res => {
        flow.value = res
        params.value = res.parameters
        for (let param of params.value) {
            param.file = null
        }
    })
})

const show = () => {
    dlgVisible.value = true
}


const setData = (data) => {
    // params.value = data
}

// 查询最终用户填写的数据
const getData = () => {
    return params.value
}

defineExpose({setData, getData, show})

const clickConfirm = () => {
    console.log('===> 当前数据', getData())
}
</script>
