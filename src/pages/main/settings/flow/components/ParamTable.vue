<template>
    <!--  <div class="param-item-main param-item">-->
    <div>
        <div style="padding-left: 40px; padding-right: 40px">
            <q-table
                ref="paramTable"
                :title="$t('CustomParameters')"
                :rows="params"
                :columns="columns"
                row-key="name"
                color="primary"
                separator="cell"
                :pagination="{rowsPerPage: 0}"
                dense
                hide-pagination
                hide-no-data
                wrap-cells
            >
                <template v-slot:top>
                    <div class="text-primary text-h7">{{$t('CustomParameters')}}</div>
                    <q-space />
                    <q-btn v-if="!readonly" color="primary" size="sm" :label="$t('Add')" @click="addParameter" />
                </template>

                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td align="center">
                            <q-input v-model="props.row.key" :disable="readonly" dense />
                        </q-td>
                        <q-td align="center">
                            <q-select
                                stack-label
                                dense
                                v-model="props.row.type"
                                :options="['string','number','file','select','multiSelect']"
                            />
                        </q-td>
                        <q-td align="center">
                            <q-checkbox v-model="props.row.required" color="teal" :disable="readonly" dense />
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
                                color="purple"
                                @click="clickAddChoice(props.row)"
                            >
                            </q-btn>
                        </q-td>
                        <q-td>
                            <q-input v-model="props.row.description" :readonly="readonly" dense />
                        </q-td>
                        <q-td v-if="!readonly" align="center">
                            <q-btn
                                v-if="!readonly"
                                :label="$t('Delete')"
                                size="xs"
                                color="red"
                                glossy
                                @click="clickDeleteRow(props.row, props.rowIndex)"
                            />
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-dialog ref="choiceDlg" v-model="choiceDlgVisible" class="relative-position" @before-show="choice = ''">
                <q-card>
                    <q-card-section>
                        <q-input v-model="choice" :label="$t('ValueRange')" clearable :readonly="readonly" />
                    </q-card-section>
                    <q-card-actions align="center">
                        <q-btn :label="$t('Confirm')" size="sm" color="primary" @click="confirmAddChoice" />
                        <q-btn :label="$t('Cancel')" size="sm" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>
    </div>
</template>

<script setup>
import {defineProps, computed, defineExpose, ref, toRefs, onMounted, onBeforeMount} from "vue"
import { useI18n } from 'vue-i18n'

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

const { t } = useI18n()
const { readonly } = toRefs(props)

let columns = computed(() => [
    { name: "key", label: t('ParameterName'), field: "key", align: "center" },
    { name: "type", label: t('ValueType'), align: "center", field: "type" },
    { name: "required", label: t('Required'), field: "required", align: "center" },
    { name: "choices", label: t('ValueRange'), align: "center", field: "choices" },
    { name: "description", label: t('Comment'), field: "description", align: "center", },
    { name: "operation", label: t('Operate'), align: "center", },
])

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
    console.log('set params data', data)
    params.value = [...data]
}

const getData = () => {
    return params.value
}

defineExpose({setData, getData})
const addParameter = () => {
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
