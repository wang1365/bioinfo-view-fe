<template>
    <!--  <div class="param-item-main param-item">-->
    <div>
        <div style="padding-left: 40px; padding-right: 40px">
            <q-table
                ref="paramTable"
                title="自定义参数"
                :rows="params"
                :columns="columns"
                row-key="name"
                color="primary"
                separator="cell"
                dense
                hide-no-data
                wrap-cells
            >
                <template v-slot:top>
                    <div class="text-primary text-h7">自定义参数</div>
                    <q-space />
                    <q-btn v-if="!readonly" color="primary" label="新增参数" @click="addParameter" />
                </template>

                <!--                <template v-slot:body-cell-id="props" v-if="!isInfoMode">-->
                <!--                    <q-td align="center">-->
                <!--                        {{props.row.id}}-->
                <!--                    </q-td>-->
                <!--                </template>-->
                <!--                <template v-slot:body-cell-key="props" v-if="!isInfoMode">-->
                <!--                    <q-td align="center">-->
                <!--                        <q-input v-model="props.row.key"/>-->
                <!--                    </q-td>-->
                <!--                </template>-->
                <!--                <template v-slot:body-cell-type="props" v-if="!isInfoMode">-->
                <!--                    <q-td align="center">-->
                <!--                        <q-input v-model="props.row.type"/>-->
                <!--                    </q-td>-->
                <!--                </template>-->
                <!--                <template v-slot:body-cell-required="props" v-if="!isInfoMode">-->
                <!--                    <q-td align="center">-->
                <!--                        <q-checkbox v-model="props.row.required" color="teal" />-->
                <!--                    </q-td>-->
                <!--                </template>-->
                <!--                <template v-slot:body-cell-choices="props">-->
                <!--                    <q-td align="center">-->
                <!--                        <template v-for="item in props.row.choices" :key="item">-->
                <!--                            <q-badge label="item" outline />-->
                <!--                        </template>-->

                <!--                        <q-btn size="xs" label="+"/>-->
                <!--                        <q-btn size="xs" label="-"/>-->
                <!--                    </q-td>-->
                <!--                </template>-->
                <!--                <template v-slot:body-cell-description="props" v-if="!isInfoMode">-->
                <!--                    <q-td>-->
                <!--                        <q-input v-model="props.row.description"/>-->
                <!--                    </q-td>-->
                <!--                </template>-->
                <!--                <template v-slot:body-cell-operation="props" v-if="!isInfoMode">-->
                <!--                    <q-td align="center">-->
                <!--                        <q-btn label="删除" size="xs" color="red" glossy-->
                <!--                               @click="clickDeleteRow(props.row, props.index)"></q-btn>-->
                <!--                    </q-td>-->
                <!--                </template>-->

                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td align="center">
                            {{ props.row.id }}
                        </q-td>
                        <q-td align="center">
                            <q-input v-model="props.row.key" :disable="readonly" />
                        </q-td>
                        <q-td align="center">
                            <q-select stack-label v-model="props.row.type" :options="[     'string','number','file','select','multiSelect']"> </q-select>
                        </q-td>
                        <q-td align="center">
                            <q-checkbox v-model="props.row.required" color="teal" :disable="readonly" />
                        </q-td>
                        <q-td align="center">
                            <template v-for="(item, index) in props.row.choices" :key="item">
                                <q-chip
                                    :label="item"
                                    size="sm"
                                    outline
                                    square
                                    removable
                                    color="orange"
                                    @remove="deleteChoice(props.row, index)"
                                />
                            </template>

                            <q-btn
                                v-if="!readonly"
                                size="xs"
                                label="+"
                                color="primary"
                                @click="clickAddChoice(props.row)"
                            >
                                <!--                                <q-popup-edit title="添加值域" buttons-->
                                <!--                                              label-set="确定" label-cancel="取消"-->
                                <!--                                              @save="confirmAddChoice"-->
                                <!--                                              @cancel="confirmAddChoice"-->
                                <!--                                              v-model="choice"-->
                                <!--                                              @before-show="currentRow = props.row"-->
                                <!--                                              :validate="validateChoice"-->
                                <!--                                >-->
                                <!--                                    <q-input color="accent" v-model="choice" dense autofocus>-->
                                <!--                                        <template v-slot:prepend>-->
                                <!--                                            <q-icon name="record_voice_over" color="accent"/>-->
                                <!--                                        </template>-->
                                <!--                                    </q-input>-->
                                <!--                                </q-popup-edit>-->
                            </q-btn>
                        </q-td>
                        <q-td>
                            <q-input v-model="props.row.description" :readonly="readonly" />
                        </q-td>
                        <q-td v-if="!readonly">
                            <q-btn
                                v-if="!readonly"
                                label="删除"
                                size="xs"
                                color="red"
                                glossy
                                @click="clickDeleteRow(props.row, props.index)"
                            />
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-dialog ref="choiceDlg" v-model="choiceDlgVisible" class="relative-position" @before-show="choice = ''">
                <q-card>
                    <q-card-section>
                        <q-input v-model="choice" label="值域" clearable :readonly="readonly" />
                    </q-card-section>
                    <q-card-actions align="center">
                        <q-btn label="确定" size="sm" color="primary" @click="confirmAddChoice" />
                        <q-btn label="取消" size="sm" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>
    </div>
</template>

<script setup>
import {defineProps, computed, defineExpose, ref, toRefs, onMounted, onBeforeMount} from "vue"

const props = defineProps({
    data: {
        type: Array,
        default: () => {
            return [];
        },
    },
    action: {
        type: String,
        default: "info",
    },
    title: {
        type: String,
        default: "",
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const {readonly} = toRefs(props)

let columns = [
    {name: "id", label: "ID", align: "center", style: "width:80px", field: (row) => row.id, format: (val) => `${val}`,},
    {name: "key", label: "参数名", field: "key", align: "center"},
    {name: "type", label: "值类型", align: "center", field: "type"},
    {name: "required", label: "必填", field: "required", align: "center"},
    {name: "choices", label: "值域", align: "center", field: "choices"},
    {name: "description", label: "说明", field: "description", align: "center",},
    {name: "operation", label: "操作", align: "center",},
]

const isEditMode = computed(() => {
    return props.action === "edit";
})
const isInfoMode = computed(() => {
    return props.action === "info";
})
const isCreateMode = computed(() => {
    return props.action === "create";
})

const valueTypes = ["string", "file"]
const params = ref(props.data)
const currentRow = ref(null)
const choice = ref('')
const choiceDlgVisible = ref(false)
const choiceDlg = ref(null)

const validateChoice = (v) => {
    return v !== null && v !== ''
}
const setData = (data) => {
    params.value = data
}

const getData = () => {
    return params.value
}

defineExpose({setData, getData})
const addParameter = () => {
    console.log("addParameter");
    // this.$set(params, params.value.length, { choices: [] });
    params.value.push({
        key: '', type: '', required: false, choices: [], description: ''
    })
}
const clickDeleteRow = (row, index) => {
    params.value.splice(index, 1)
}
const deleteChoice = (row, idx) => {
    row.choices.splice(idx, 1)
}
const clickAddChoice = (row) => {
    // row.newValue = "";
    // this.$set(row, "add", true);
    currentRow.value = row
    choiceDlgVisible.value = true
}
const confirmAddChoice = (value, initValue) => {
    console.log('.............', value, initValue, currentRow.value)
    // const value = this._.get(row, "newChoice", "");
    if (choice.value !== "") {
        if (currentRow.value.choices === undefined) {
            currentRow.value.choices = [];
        }
        currentRow.value.choices.push(choice.value);
    }
    choiceDlgVisible.value = false
    // this.$set(row, "add", false);
}
const resetFields = () => {
    params.value = []
}
const joinChoices = (choices) => {
    return choices.join("; ")
}
</script>

<style lang="scss" scoped>
.param-item {
    margin-bottom: 5px;
}

//span {
//  margin-left: 20px;
//  margin-right: 5px;
//}
</style>
