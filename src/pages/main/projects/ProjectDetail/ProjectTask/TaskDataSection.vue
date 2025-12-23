<template>
    <div class="q-mb-xs">
        <div
            class="row q-my-sm items-center relative-position"
            :class="rowClass"
            v-for="(file, fileIndex) in files"
            :key="fileIndex"
            :id="`${fileIndex}`"
        >
            <q-badge class="absolute-top-right" color="primary" text-color="white" rounded :label="fileIndex + 1" />
            <div class="col-auto">
                <q-btn icon="delete" color="red" dense :outline="true" flat @click="$emit('delete-file', fileIndex)" />
            </div>
            <div class="col-auto" v-if="sampleType === 'single' && !file.sampleFirst?.id">
                <q-btn
                    icon="ads_click"
                    color="primary"
                    dense
                    :outline="true"
                    flat
                    @click="$emit('select-single', fileIndex)"
                />
            </div>
            <div class="col-auto" v-if="sampleType === 'double'">
                <q-btn
                    icon="ads_click"
                    color="primary"
                    dense
                    :outline="true"
                    flat
                    @click="$emit('select-first', fileIndex)"
                />
            </div>
            <div class="col-auto" v-if="sampleType === 'multiple'">
                <q-btn icon="ads_click" color="primary" dense flat @click="$emit('select-multi', fileIndex)" />
            </div>
            <div
                class="col-auto"
                v-if="sampleType === 'double_multiple' && (!file.samplesFirst || file.samplesFirst.length === 0)"
            >
                <q-btn
                    icon="ads_click"
                    color="primary"
                    dense
                    :outline="true"
                    flat
                    @click="$emit('select-first-multi', fileIndex)"
                />
            </div>
            <div
                class="col-auto"
                v-if="sampleType === 'double_multiple' && (!file.samplesSecond || file.samplesSecond.length === 0)"
            >
                <q-btn
                    icon="ads_click"
                    color="secondary"
                    dense
                    :outline="true"
                    flat
                    @click="$emit('select-second-multi', fileIndex)"
                />
            </div>

            <div class="col">
                <template v-if="sampleType === 'single'">
                    <div class="row q-gutter-xs">
                        <div class="col row items-center">
                            <q-input
                                v-model="file.taskName"
                                class="col-2 q-mr-sm self-center"
                                stack-label
                                :label="$t('Task') + $t('Name')"
                                label-color="purple"
                                dense
                                filled
                            />
                            <q-input
                                v-if="file.sampleFirst?.identifier || file.sampleFirst?.notFound"
                                class="col-2 q-mr-sm self-center"
                                stack-label
                                :label="$t('DataNewFormDataIdentificationNumber')"
                                label-color="purple"
                                dense
                                filled
                                padding="1px"
                                readonly
                                :model-value="file.sampleFirst?.identifier || ''"
                                :error="file.sampleFirst?.notFound"
                                :error-message="$t('DataIdentifierNotFound')"
                            />
                            <div class="col q-ml-xs column items-start">
                                <span
                                    v-if="file.sampleFirst?.fastq1_path"
                                    class="fastq-text"
                                    :class="fastqTextClass(file.sampleFirst?.fastq1_warn, file.sampleFirst?.fastq1_ok)"
                                >
                                    <q-chip
                                        label="R1"
                                        dense
                                        color="primary"
                                        text-color="white"
                                        size="12px"
                                        class="q-mr-xs"
                                    />
                                    {{ file.sampleFirst.fastq1_path }}
                                    <q-icon
                                        v-if="file.sampleFirst?.fastq1_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <q-icon
                                        v-else-if="file.sampleFirst?.fastq1_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <FastqTooltip
                                        :info="file.sampleFirst?.fastq1_info"
                                        :warn="file.sampleFirst?.fastq1_warn"
                                    />
                                </span>
                                <span
                                    v-if="file.sampleFirst?.fastq2_path"
                                    class="fastq-text q-mt-xs"
                                    :class="fastqTextClass(file.sampleFirst?.fastq2_warn, file.sampleFirst?.fastq2_ok)"
                                >
                                    <q-chip
                                        label="R2"
                                        dense
                                        color="primary"
                                        size="12px"
                                        text-color="white"
                                        class="q-mr-xs"
                                    />
                                    {{ file.sampleFirst.fastq2_path }}
                                    <q-icon
                                        v-if="file.sampleFirst?.fastq2_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <q-icon
                                        v-else-if="file.sampleFirst?.fastq2_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <FastqTooltip
                                        :info="file.sampleFirst?.fastq2_info"
                                        :warn="file.sampleFirst?.fastq2_warn"
                                    />
                                </span>
                            </div>
                            <span
                                v-if="file.sampleFirstError"
                                class="text-red text-bold"
                                >{{ `${$t('Data')} ${$t('Required')}` }}</span
                            >
                        </div>
                    </div>
                </template>

                <template v-else-if="sampleType === 'double'">
                    <div class="row q-gutter-xs">
                        <div class="col row items-center">
                            <q-input
                                v-model="file.taskName"
                                class="col-2 q-mr-sm self-center"
                                stack-label
                                :label="$t('Task') + $t('Name')"
                                label-color="purple"
                                dense
                                filled
                            />
                            <q-input
                                v-if="file.sampleFirst?.identifier || file.sampleFirst?.notFound"
                                class="col-2 q-mr-sm"
                                stack-label
                                :label="$t('DataNewFormDataIdentificationNumber')"
                                label-color="purple"
                                dense
                                filled
                                padding="1px"
                                readonly
                                :model-value="file.sampleFirst?.identifier || ''"
                                :error="file.sampleFirst?.notFound"
                                :error-message="$t('DataIdentifierNotFound')"
                            />
                            <div class="col q-ml-xs column items-start">
                                <span
                                    v-if="file.sampleFirst?.fastq1_path"
                                    class="fastq-text"
                                    :class="fastqTextClass(file.sampleFirst?.fastq1_warn, file.sampleFirst?.fastq1_ok)"
                                >
                                    <q-chip
                                        label="R1"
                                        dense
                                        color="primary"
                                        size="12px"
                                        text-color="white"
                                        class="q-mr-xs"
                                    />
                                    {{ file.sampleFirst.fastq1_path }}
                                    <q-icon
                                        v-if="file.sampleFirst?.fastq1_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <q-icon
                                        v-else-if="file.sampleFirst?.fastq1_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <FastqTooltip
                                        :info="file.sampleFirst?.fastq1_info"
                                        :warn="file.sampleFirst?.fastq1_warn"
                                    />
                                </span>
                                <span
                                    v-if="file.sampleFirst?.fastq2_path"
                                    class="fastq-text q-mt-xs"
                                    :class="fastqTextClass(file.sampleFirst?.fastq2_warn, file.sampleFirst?.fastq2_ok)"
                                >
                                    <q-chip
                                        label="R2"
                                        dense
                                        color="primary"
                                        size="12px"
                                        text-color="white"
                                        class="q-mr-xs"
                                    />
                                    {{ file.sampleFirst.fastq2_path }}
                                    <q-icon
                                        v-if="file.sampleFirst?.fastq2_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <q-icon
                                        v-else-if="file.sampleFirst?.fastq2_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <FastqTooltip
                                        :info="file.sampleFirst?.fastq2_info"
                                        :warn="file.sampleFirst?.fastq2_warn"
                                    />
                                </span>
                            </div>
                        </div>
                        <q-separator vertical class="q-my-xs" />
                        <div class="col row items-center">
                            <div class="col-1">
                                <q-btn
                                    icon="ads_click"
                                    color="primary"
                                    dense
                                    flat
                                    @click="$emit('select-second', fileIndex)"
                                />
                            </div>
                            <q-input
                                v-if="file.sampleSecond?.identifier || file.sampleSecond?.notFound"
                                class="col-2 q-ml-sm"
                                stack-label
                                :label="$t('DataNewFormDataIdentificationNumber')"
                                label-color="purple"
                                dense
                                filled
                                padding="1px"
                                readonly
                                :model-value="file.sampleSecond?.identifier || ''"
                                :error="file.sampleSecond?.notFound"
                                :error-message="$t('DataIdentifierNotFound')"
                            />
                            <div class="col q-ml-xs column items-start">
                                <span
                                    v-if="file.sampleSecond?.fastq1_path"
                                    class="fastq-text"
                                    :class="fastqTextClass(file.sampleSecond?.fastq1_warn, file.sampleSecond?.fastq1_ok)"
                                >
                                    <q-chip
                                        label="R1"
                                        dense
                                        color="primary"
                                        size="12px"
                                        text-color="white"
                                        class="q-mr-xs"
                                    />
                                    {{ file.sampleSecond.fastq1_path }}
                                    <q-icon
                                        v-if="file.sampleSecond?.fastq1_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <q-icon
                                        v-else-if="file.sampleSecond?.fastq1_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <FastqTooltip
                                        :info="file.sampleSecond?.fastq1_info"
                                        :warn="file.sampleSecond?.fastq1_warn"
                                    />
                                </span>
                                <span
                                    v-if="file.sampleSecond?.fastq2_path"
                                    class="fastq-text q-mt-xs"
                                    :class="fastqTextClass(file.sampleSecond?.fastq2_warn, file.sampleSecond?.fastq2_ok)"
                                >
                                    <q-chip
                                        label="R2"
                                        dense
                                        color="primary"
                                        size="12px"
                                        text-color="white"
                                        class="q-mr-xs"
                                    />
                                    {{ file.sampleSecond.fastq2_path }}
                                    <q-icon
                                        v-if="file.sampleSecond?.fastq2_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <q-icon
                                        v-else-if="file.sampleSecond?.fastq2_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mr-xs"
                                    />
                                    <FastqTooltip
                                        :info="file.sampleSecond?.fastq2_info"
                                        :warn="file.sampleSecond?.fastq2_warn"
                                    />
                                </span>
                            </div>
                            <span
                                v-if="file.sampleFirstError || file.sampleSecondError"
                                class="text-red text-bold"
                                >{{ `${$t('Data')} ${$t('Required')}` }}</span
                            >
                        </div>
                    </div>
                </template>

                <template v-else-if="sampleType === 'multiple'">
                    <div class="row q-mb-sm">
                        <q-input
                            v-model="file.taskName"
                            class="col-3"
                            stack-label
                            :label="$t('Task') + $t('Name')"
                            label-color="purple"
                            dense
                            filled
                        />
                    </div>
                    <template v-for="(sample, i) in file.samples" :key="sample.id">
                        <div class="row q-gutter-xs items-center bg-blue-grey-1 q-mt-xs">
                            <div class="col row">
                                <q-input
                                    class="col-1 self-center"
                                    stack-label
                                    :label="$t('DataNewFormDataIdentificationNumber')"
                                    label-color="purple"
                                    dense
                                    filled
                                    padding="1px"
                                    readonly
                                    :model-value="sample.identifier || sample.sample_identifier || ''"
                                    :error="sample.notFound"
                                    :error-message="$t('DataIdentifierNotFound')"
                                />
                                <q-input
                                    class="col-1 self-center"
                                    stack-label
                                    :label="$t('SampleName')"
                                    label-color="purple"
                                    dense
                                    filled
                                    padding="1px"
                                    v-model="file.sampleDetails[i].customName"
                                />
                                <q-input
                                    class="col-1 self-center"
                                    stack-label
                                    :label="$t('SampleRatio')"
                                    label-color="purple"
                                    dense
                                    filled
                                    v-model.number="file.sampleDetails[i].sampleRatio"
                                    v-if="supportSampleRatio"
                                />
                                <div class="col q-ml-xs column items-start">
                                    <span
                                        v-if="sample.fastq1_path"
                                        class="fastq-text"
                                        :class="fastqTextClass(sample.fastq1_warn, sample.fastq1_ok)"
                                    >
                                        <q-chip
                                            label="R1"
                                            dense
                                            color="primary"
                                            size="12px"
                                            text-color="white"
                                            class="q-mr-xs"
                                        />
                                        {{ sample.fastq1_path }}
                                        <q-icon
                                            v-if="sample.fastq1_warn"
                                            name="warning"
                                            color="orange"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <q-icon
                                            v-else-if="sample.fastq1_ok"
                                            name="check_circle"
                                            color="green-8"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                                    </span>
                                    <span
                                        v-if="sample.fastq2_path"
                                        class="fastq-text q-mt-xs"
                                        :class="fastqTextClass(sample.fastq2_warn, sample.fastq2_ok)"
                                    >
                                        <q-chip
                                            label="R2"
                                            dense
                                            color="primary"
                                            size="12px"
                                            text-color="white"
                                            class="q-mr-xs"
                                        />
                                        {{ sample.fastq2_path }}
                                        <q-icon
                                            v-if="sample.fastq2_warn"
                                            name="warning"
                                            color="orange"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <q-icon
                                            v-else-if="sample.fastq2_ok"
                                            name="check_circle"
                                            color="green-8"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </template>
                    <span
                        v-if="file.samplesError"
                        class="text-red text-bold"
                        >{{ `${$t('Data')} ${$t('Required')}` }}</span
                    >
                </template>

                <template v-else>
                    <div class="row">
                        <div class="col-6">
                            <template v-for="sample in file.samplesFirst" :key="sample.id">
                                <div class="row items-center">
                                    <q-input
                                        class="q-mr-sm"
                                        stack-label
                                        :label="$t('DataNewFormDataIdentificationNumber')"
                                        label-color="purple"
                                        dense
                                        filled
                                        padding="1px"
                                        readonly
                                        :model-value="sample.identifier || sample.sample_identifier || ''"
                                        :error="sample.notFound"
                                        :error-message="$t('DataIdentifierNotFound')"
                                    />
                                    <div class="col q-ml-xs column items-start">
                                        <q-btn
                                            v-if="sample.fastq1_path"
                                            dense
                                            flat
                                            outline
                                            size="xs"
                                            :text-color="sample.fastq1_ok ? 'black' : undefined"
                                            :color="sample.fastq1_warn ? 'orange' : (sample.fastq1_ok ? 'green-8' : 'grey-7')"
                                        >
                                            <q-chip
                                                label="R1"
                                                dense
                                                color="primary"
                                                text-color="white"
                                                class="q-mr-xs"
                                            />
                                            <span>{{ sample.fastq1_path }}</span>
                                            <q-icon
                                                v-if="sample.fastq1_warn"
                                                name="warning"
                                                color="orange"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <q-icon
                                                v-else-if="sample.fastq1_ok"
                                                name="check_circle"
                                                color="green-8"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                                        </q-btn>
                                        <q-btn
                                            v-if="sample.fastq2_path"
                                            dense
                                            flat
                                            outline
                                            size="xs"
                                            :text-color="sample.fastq2_ok ? 'black' : undefined"
                                            :color="sample.fastq2_warn ? 'orange' : (sample.fastq2_ok ? 'green-8' : 'grey-7')"
                                        >
                                            <q-chip
                                                label="R2"
                                                dense
                                                color="primary"
                                                text-color="white"
                                                class="q-mr-xs"
                                            />
                                            <span>{{ sample.fastq2_path }}</span>
                                            <q-icon
                                                v-if="sample.fastq2_warn"
                                                name="warning"
                                                color="orange"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <q-icon
                                                v-else-if="sample.fastq2_ok"
                                                name="check_circle"
                                                color="green-8"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                                        </q-btn>
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div class="col-6">
                            <template v-for="sample in file.samplesSecond" :key="sample.id">
                                <div class="row items-center">
                                    <q-input
                                        class="q-mr-sm"
                                        stack-label
                                        :label="$t('DataNewFormDataIdentificationNumber')"
                                        label-color="purple"
                                        dense
                                        filled
                                        padding="1px"
                                        readonly
                                        :model-value="sample.identifier || sample.sample_identifier || ''"
                                        :error="sample.notFound"
                                        :error-message="$t('DataIdentifierNotFound')"
                                    />
                                    <div class="col q-ml-xs column items-start">
                                        <span
                                            v-if="sample.fastq1_path"
                                            class="fastq-text"
                                            :class="fastqTextClass(sample.fastq1_warn, sample.fastq1_ok)"
                                        >
                                            <q-chip
                                                label="R1"
                                                dense
                                                color="primary"
                                                text-color="white"
                                                class="q-mr-xs"
                                            />
                                            {{ sample.fastq1_path }}
                                            <q-icon
                                                v-if="sample.fastq1_warn"
                                                name="warning"
                                                color="orange"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <q-icon
                                                v-else-if="sample.fastq1_ok"
                                                name="check_circle"
                                                color="green-8"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                                        </span>
                                        <span
                                            v-if="sample.fastq2_path"
                                            class="fastq-text q-mt-xs"
                                            :class="fastqTextClass(sample.fastq2_warn, sample.fastq2_ok)"
                                        >
                                            <q-chip
                                                label="R2"
                                                dense
                                                color="primary"
                                                text-color="white"
                                                class="q-mr-xs"
                                            />
                                            {{ sample.fastq2_path }}
                                            <q-icon
                                                v-if="sample.fastq2_warn"
                                                name="warning"
                                                color="orange"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <q-icon
                                                v-else-if="sample.fastq2_ok"
                                                name="check_circle"
                                                color="green-8"
                                                size="14px"
                                                class="q-mr-xs"
                                            />
                                            <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                    <span
                        v-if="file.samplesFirstError || file.samplesSecondError"
                        class="text-red text-bold"
                        >{{ `${$t('Data')} ${$t('Required')}` }}</span
                    >
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FastqTooltip from './FastqTooltip.vue'

const props = defineProps({
  files: { type: Array, required: true },
  sampleType: { type: String, required: true },
  supportSampleRatio: { type: Boolean, default: false }
})

const emit = defineEmits([
  'select-single',
  'select-first',
  'select-second',
  'select-multi',
  'select-first-multi',
  'select-second-multi',
  'delete-file',
  'add-file',
  'bulk-import'
])

const { t } = useI18n()
const fastqTextClass = (warn, ok) => {
  if (warn) return 'text-orange'
  if (ok) return 'text-black'
  return 'text-grey-7'
}
const rowClass = computed(() => {
  if (props.sampleType === 'multiple') return 'bg-blue-grey-2'
  return 'bg-grey-3'
})
</script>

<style scoped>
.fastq-text {
  font-size: 12px;
}
</style>
