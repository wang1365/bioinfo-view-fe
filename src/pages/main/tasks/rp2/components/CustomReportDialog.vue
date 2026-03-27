<template>
    <q-dialog :model-value="modelValue" persistent maximized @update:model-value="onDialogModelUpdate">
        <q-card class="custom-report-dialog">
            <q-card-section class="row items-center">
                <div class="text-h6">
                    {{ t('Rp2CustomReportTitle', { sample: sampleName }) }}
                </div>
                <q-space />
                <q-btn flat round dense icon="close" :disable="submitting" @click="closeDialog" />
            </q-card-section>

            <q-separator />

            <q-card-section class="dialog-content q-pa-none">
                <q-tabs
                    v-model="tab"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    class="bg-grey-2"
                    dense
                >
                    <q-tab name="bacteria" :label="tabLabel('bacteria', t('Bacteria'))" />
                    <q-tab name="fungus" :label="tabLabel('fungus', t('Fungus'))" />
                    <q-tab name="virus" :label="tabLabel('virus', t('Virus'))" />
                </q-tabs>

                <div class="dialog-panels">
                    <div v-show="tab === 'bacteria'" class="panel-content">
                        <SamplePathogenTable
                            ref="bacteriaRef"
                            :task-id="taskId"
                            :sample-name="sampleName"
                            category="bacteria"
                            selectable
                            :show-verification="false"
                            :show-read-path="false"
                            @selection-change="onSelectionChange"
                        />
                    </div>
                    <div v-show="tab === 'fungus'" class="panel-content">
                        <SamplePathogenTable
                            ref="fungusRef"
                            :task-id="taskId"
                            :sample-name="sampleName"
                            category="fungus"
                            selectable
                            :show-verification="false"
                            :show-read-path="false"
                            @selection-change="onSelectionChange"
                        />
                    </div>
                    <div v-show="tab === 'virus'" class="panel-content">
                        <SamplePathogenTable
                            ref="virusRef"
                            :task-id="taskId"
                            :sample-name="sampleName"
                            category="virus"
                            selectable
                            :show-verification="false"
                            :show-read-path="false"
                            @selection-change="onSelectionChange"
                        />
                    </div>

                    <q-inner-loading :showing="submitting" color="primary" class="custom-report-loading">
                        <div class="column items-center q-gutter-sm">
                            <q-spinner color="primary" size="36px" />
                            <div class="loading-text">{{ t('Rp2CustomReportGenerating') }}</div>
                        </div>
                    </q-inner-loading>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
                <q-btn flat :label="t('Cancel')" :disable="submitting" @click="closeDialog" />
                <q-btn
                    color="primary"
                    :loading="submitting"
                    :label="t('Rp2GenerateReport')"
                    @click="submitCustomReport"
                />
            </q-card-actions>

        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { createRp2CustomReport } from 'src/api/task'
import { successMessage } from 'src/utils/notify'
import SamplePathogenTable from './SamplePathogenTable.vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    taskId: {
        type: [String, Number],
        required: true
    },
    sampleName: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const { t } = useI18n()
const $q = useQuasar()
const tab = ref('bacteria')
const submitting = ref(false)
const bacteriaRef = ref(null)
const fungusRef = ref(null)
const virusRef = ref(null)
const selectedCountMap = ref({
    bacteria: 0,
    fungus: 0,
    virus: 0
})

const closeDialog = (force = false) => {
    if (submitting.value && !force) {
        return
    }
    emit('update:modelValue', false)
}

const onDialogModelUpdate = (value) => {
    emit('update:modelValue', value)
}

const tabLabel = (category, title) => {
    const count = selectedCountMap.value[category] || 0
    return `${title}(${t('Rp2SelectedRowsCount', { total: count })})`
}

const onSelectionChange = ({ category, selectedCount }) => {
    if (!category) {
        return
    }
    selectedCountMap.value = {
        ...selectedCountMap.value,
        [category]: selectedCount || 0
    }
}

watch(
    () => [props.modelValue, props.sampleName],
    () => {
        selectedCountMap.value = {
            bacteria: 0,
            fungus: 0,
            virus: 0
        }
    }
)

const submitCustomReport = async () => {
    const selections = [
        bacteriaRef.value?.getSelectionPayload?.(),
        fungusRef.value?.getSelectionPayload?.(),
        virusRef.value?.getSelectionPayload?.()
    ].filter(Boolean)

    const selectedCount = selections.reduce((sum, item) => sum + (item.row_numbers?.length || 0), 0)
    if (selectedCount === 0) {
        const confirmed = await new Promise((resolve) => {
            $q.dialog({
                title: t('Rp2CustomReportNoPathogenTitle'),
                message: t('Rp2CustomReportNoPathogenConfirm'),
                ok: {
                    label: t('Confirm'),
                    color: 'primary'
                },
                cancel: {
                    label: t('Cancel'),
                    flat: true
                },
                persistent: true
            })
                .onOk(() => resolve(true))
                .onCancel(() => resolve(false))
                .onDismiss(() => resolve(false))
        })
        if (!confirmed) {
            return
        }
    }

    submitting.value = true
    try {
        const result = await createRp2CustomReport(props.taskId, {
            sample_name: props.sampleName,
            selections
        })
        closeDialog(true)
        successMessage(t('Rp2CustomReportSubmitSuccess'))
        emit('submitted', result)
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.custom-report-dialog {
    width: 96vw;
    max-width: 96vw;
    height: 96vh;
    position: relative;
}

.dialog-content {
    height: calc(96vh - 130px);
    overflow: hidden;
}

.dialog-panels {
    height: calc(100% - 42px);
    overflow: hidden;
    position: relative;
}

.panel-content {
    height: 100%;
    padding: 12px 14px 0;
    box-sizing: border-box;
}

.loading-text {
    font-size: 16px;
    font-weight: 700;
    color: #245ea8;
}

.custom-report-loading {
    z-index: 4000 !important;
}

.custom-report-loading :deep(.q-inner-loading__backdrop) {
    background: rgba(255, 255, 255, 0.92) !important;
}
</style>
