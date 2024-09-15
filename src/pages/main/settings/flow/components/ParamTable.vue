<template>
    <!--  <div class="param-item-main param-item">-->
    <div>
        <div style="padding-left: 40px; padding-right: 40px">
            <q-table ref="paramTable" :title="$t('CustomParameters')" :rows="params" :columns="columns" row-key="name"
                color="primary" separator="cell" :pagination="{ rowsPerPage: 0 }" dense hide-pagination hide-no-data
                wrap-cells>
                <template v-slot:top>
                    <div class="text-primary text-h7">{{ $t('CustomParameters') }}</div>
                    <q-space />
                    <q-btn v-if="!readonly" color="primary" size="sm" :label="$t('Add')" @click="addParameter" />

                </template>

                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td align="center">
                            <q-input v-model="props.row.key" :disable="readonly" dense />
                        </q-td>
                        <q-td align="center">
                            <q-select stack-label dense v-model="props.row.type"
                                :options="['string', 'number', 'file', 'select', 'multiSelect']" />
                        </q-td>
                        <q-td align="center">
                            <q-checkbox v-model="props.row.required" color="teal" :disable="readonly" dense />
                        </q-td>
                        <q-td align="center">
                            <template v-if="props.row.choices && props.row.choices.length < 8">
                                <template v-for="(item, index) in props.row.choices" :key="item">
                                    <q-chip v-if="!item.enLabel" :label="item" size="sm" outline square removable
                                        color="primary" @remove="deleteChoice(props.row, index)" />
                                    <q-chip v-if="item.enLabel && langConfig.lang === 'en'" :label="item.enLabel"
                                        size="sm" outline square removable color="primary"
                                        @remove="deleteChoice(props.row, index)" />
                                    <q-chip v-if="item.cnLabel && langConfig.lang === 'cn'" :label="item.cnLabel"
                                        size="sm" outline square removable color="primary"
                                        @remove="deleteChoice(props.row, index)" />
                                </template>
                            </template>

                            <template v-if="props.row.choices && props.row.choices.length >= 7">
                                <template v-for="(item, index) in props.row.choices.slice(0, 4)" :key="item">
                                    <q-chip v-if="!item.enLabel" :label="item" size="sm" outline square removable
                                        color="primary" @remove="deleteChoice(props.row, index)" />
                                    <q-chip v-if="item.enLabel && langConfig.lang === 'en'" :label="item.enLabel"
                                        size="sm" outline square removable color="primary"
                                        @remove="deleteChoice(props.row, index)" />
                                    <q-chip v-if="item.cnLabel && langConfig.lang === 'cn'" :label="item.cnLabel"
                                        size="sm" outline square removable color="primary"
                                        @remove="deleteChoice(props.row, index)" />
                                </template>
                                <q-btn :label="'全部' + props.row.choices.length + '个...'" size="sm" square dense
                                    class="q-ma-sm" color="secondary"
                                    @click="basic = true; currentDialogRow = props.row" />

                            </template>

                            <q-btn v-if="!readonly" size="xs" label="+" color="purple"
                                @click="clickAddChoice(props.row)">
                            </q-btn>
                            <q-file ref="fileInput" v-model="file" accept=".xlsx, .xls"
                                @update:model-value="uploadFile($event)" style="display: none;" :id="props.rowIndex" />

                            <q-btn class="q-ml-sm" @click="triggerFileSelect(props.row)" size="sm" outline="" dense
                                icon="attach_file" label="批量上传" />
                        </q-td>
                        <q-td>
                            <q-input v-model="props.row.description" :readonly="readonly" dense />
                        </q-td>
                        <q-td v-if="!readonly" align="center">
                            <q-btn v-if="!readonly" :label="$t('Delete')" size="xs" color="red" glossy
                                @click="clickDeleteRow(props.row, props.rowIndex)" />
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-dialog ref="choiceDlg" v-model="choiceDlgVisible" class="relative-position" @before-show="choice = ''">
                <q-card>
                    <q-card-section>
                        <q-input v-model="choice" :label="$t('ValueRange')" clearable :readonly="readonly" />
                        <q-input v-model="enLabel" :label="$t('EnLabel')" clearable :readonly="readonly" />
                        <q-input v-model="cnLabel" :label="$t('CnLabel')" clearable :readonly="readonly" />
                    </q-card-section>
                    <q-card-actions align="center">
                        <q-btn :label="$t('Confirm')" size="sm" color="primary" @click="confirmAddChoice" />
                        <q-btn :label="$t('Cancel')" size="sm" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <q-dialog v-model="basic" transition-show="rotate" transition-hide="rotate">
                <q-card>
                    <q-card-section class="row items-center q-pb-none">
                        <div class="text-h6">全部内容</div>
                        <q-space />
                        <q-btn label="清空" color="accent" dense @click="currentDialogRow.choices = []" v-close-popup
                            class="q-ma-md q-pa-sm" />
                        <q-btn icon="close" flat dense v-close-popup />
                    </q-card-section>
                    <q-card-section>
                        <template v-for="(item, index) in currentDialogRow.choices" :key="item">
                            <q-chip v-if="!item.enLabel" :label="item" size="sm" outline square removable
                                color="primary" @remove="deleteChoice(currentDialogRow, index)" />
                            <q-chip v-if="item.enLabel && langConfig.lang === 'en'" :label="item.enLabel" size="sm"
                                outline square removable color="primary"
                                @remove="deleteChoice(currentDialogRow, index)" />
                            <q-chip v-if="item.cnLabel && langConfig.lang === 'cn'" :label="item.cnLabel" size="sm"
                                outline square removable color="primary"
                                @remove="deleteChoice(currentDialogRow, index)" />
                        </template>

                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat label="Close" color="primary" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed, defineExpose, ref, toRefs, onMounted, onBeforeMount } from "vue"
import { useI18n } from 'vue-i18n'
import { globalStore } from 'src/stores/global'
import { api } from "src/boot/axios";

const currentUploadRow = ref(null)
const currentDialogRow = ref(null)
const basic = ref(false)
const file = ref(null)
const fileInput = ref(null)
const triggerFileSelect = (row) => {
    currentUploadRow.value = row
    fileInput.value.pickFiles();
};
const uploadFile = (event) => {
    console.log(event)
    console.log(currentUploadRow.value)
    if (!file.value) {
        return;
    }

    const formData = new FormData();
    formData.append('file', file.value);
    api({ url: '/flow/upload-excel', method: 'POST', data: formData }).then((res) => {
        let choices = []
        for (let item of res) {
            choices.push({
                value: item.hpo_id,
                cnLabel: item['中文译名'],
                enLabel: item['名称(英文)']
            })
        }
        currentUploadRow.value.choices = choices
    })
    file.value = null

    // try {
    //     const response = await axios.post('http://localhost:8000/upload-excel/', formData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //         },
    //     });
    //     result.value = response.data;
    // } catch (error) {
    //     console.error('Error uploading file:', error);
    //     this.$q.notify({
    //         type: 'negative',
    //         message: 'Error uploading file.',
    //     });
    // }
};
const { langConfig } = globalStore()
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
const enLabel = ref('')
const cnLabel = ref('')

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

defineExpose({ setData, getData })
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
    let item = { value: choice.value, cnLabel: cnLabel.value, enLabel: enLabel.value }
    if (choice.value !== "") {
        if (currentRow.value.choices === undefined) {
            currentRow.value.choices = [];
        }
        if (!enLabel.value) {
            item.enLabel = choice.value
        }
        if (!cnLabel.value) {
            item.cnLabel = choice.value
        }
        if (!cnLabel.value && !enLabel.value) {
            item = choice.value
        }
        currentRow.value.choices.push(item);
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
//}</style>