<template>
    <a-table
        :dataSource="files"
        :columns="columns"
        :pagination="false"
        :rowKey="(record, index) => index"
        bordered
        size="small"
    >
        <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
            </template>

            <template v-if="column.dataIndex === 'action'">
                <div class="row items-center justify-center q-gutter-x-sm">
                    <q-btn icon="delete" color="red" flat dense @click="$emit('delete-file', index)" />

                    <!-- Single -->
                    <div v-if="sampleType === 'single'" class="row items-center no-wrap justify-center">
                        <q-btn
                            v-if="!record.sampleFirst?.id"
                            icon="ads_click"
                            color="primary"
                            dense
                            outline
                            flat
                            @click="$emit('select-single', index)"
                        />
                    </div>

                    <!-- Double -->
                    <div v-else-if="sampleType === 'double'">
                        <div class="column justify-center q-gutter-y-xs">
                            <div class="row items-center justify-center" style="min-height: 40px">
                                <q-btn
                                    icon="ads_click"
                                    color="primary"
                                    dense
                                    outline
                                    flat
                                    @click="$emit('select-first', index)"
                                />
                            </div>
                            <div class="row items-center justify-center" style="min-height: 40px">
                                <q-btn
                                    icon="ads_click"
                                    color="primary"
                                    dense
                                    flat
                                    @click="$emit('select-second', index)"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Multiple -->
                    <div v-else-if="sampleType === 'multiple'">
                        <q-btn
                            icon="ads_click"
                            color="primary"
                            dense
                            flat
                            @click="$emit('select-multi', index)"
                            :label="$t('SelectData')"
                            size="sm"
                        />
                    </div>

                    <!-- Double Multiple -->
                    <div v-else-if="sampleType === 'double_multiple'">
                        <div class="column full-width">
                            <!-- First Group -->
                            <template v-if="record.samplesFirst.length === 0">
                                <q-btn
                                    icon="ads_click"
                                    color="primary"
                                    dense
                                    outline
                                    flat
                                    @click="$emit('select-first-multi', index)"
                                    :label="$t('SelectData') + ' 1'"
                                    size="sm"
                                    class="q-mb-xs"
                                />
                            </template>
                            <template v-else>
                                <div
                                    v-for="(sample, i) in record.samplesFirst"
                                    :key="'select-first-' + sample.id"
                                    class="q-mt-xs"
                                    :style="{ minHeight: i === 0 ? '32px' : '24px' }"
                                >
                                    <q-btn
                                        v-if="i === 0"
                                        icon="ads_click"
                                        color="primary"
                                        dense
                                        outline
                                        flat
                                        @click="$emit('select-first-multi', index)"
                                        :label="$t('SelectData') + ' 1'"
                                        size="sm"
                                        class="q-mb-xs"
                                    />
                                </div>
                            </template>

                            <q-separator class="q-my-sm" />

                            <!-- Second Group -->
                            <template v-if="record.samplesSecond.length === 0">
                                <q-btn
                                    icon="ads_click"
                                    color="secondary"
                                    dense
                                    outline
                                    flat
                                    @click="$emit('select-second-multi', index)"
                                    :label="$t('SelectData') + ' 2'"
                                    size="sm"
                                    class="q-mb-xs"
                                />
                            </template>
                            <template v-else>
                                <div
                                    v-for="(sample, i) in record.samplesSecond"
                                    :key="'select-second-' + sample.id"
                                    class="q-mt-xs"
                                    :style="{ minHeight: i === 0 ? '32px' : '24px' }"
                                >
                                    <q-btn
                                        v-if="i === 0"
                                        icon="ads_click"
                                        color="secondary"
                                        dense
                                        outline
                                        flat
                                        @click="$emit('select-second-multi', index)"
                                        :label="$t('SelectData') + ' 2'"
                                        size="sm"
                                        class="q-mb-xs"
                                    />
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </template>

            <template v-if="column.dataIndex === 'taskName'">
                <q-input
                    v-model="record.taskName"
                    dense
                    filled
                    stack-label
                    :label="$t('Task') + $t('Name')"
                    label-color="purple"
                    :error="record.taskNameError"
                    :error-message="$t('Required')"
                />
            </template>

            <template v-if="column.dataIndex === 'select'">
                <!-- Single -->
                <div v-if="sampleType === 'single'" class="column items-center justify-center">
                    <div class="row items-center no-wrap justify-center">
                        <q-btn
                            v-if="!record.sampleFirst?.id"
                            icon="ads_click"
                            color="primary"
                            dense
                            outline
                            flat
                            @click="$emit('select-single', index)"
                        />
                    </div>
                </div>

                <!-- Double -->
                <div v-else-if="sampleType === 'double'">
                    <div class="column justify-center q-gutter-y-xs">
                        <div class="column items-center justify-center" style="min-height: 40px">
                            <q-btn
                                icon="ads_click"
                                color="primary"
                                dense
                                outline
                                flat
                                @click="$emit('select-first', index)"
                            />
                        </div>
                        <div class="column items-center justify-center" style="min-height: 40px">
                            <q-btn icon="ads_click" color="primary" dense flat @click="$emit('select-second', index)" />
                        </div>
                    </div>
                </div>

                <!-- Multiple -->
                <div v-else-if="sampleType === 'multiple'" class="column items-center justify-center">
                    <q-btn
                        icon="ads_click"
                        color="primary"
                        dense
                        flat
                        @click="$emit('select-multi', index)"
                        :label="$t('SelectData')"
                        size="sm"
                        class="q-mb-xs full-width"
                    />
                </div>

                <!-- Double Multiple -->
                <div v-else-if="sampleType === 'double_multiple'">
                    <!-- First Group -->
                    <template v-if="record.samplesFirst.length === 0">
                        <div class="column items-center justify-center full-width">
                            <q-btn
                                icon="ads_click"
                                color="primary"
                                dense
                                outline
                                flat
                                @click="$emit('select-first-multi', index)"
                                :label="$t('SelectData') + ' 1'"
                                size="sm"
                                class="q-mb-xs full-width"
                            />
                        </div>
                    </template>
                    <template v-else>
                        <div
                            v-for="(sample, i) in record.samplesFirst"
                            :key="'select-first-' + sample.id"
                            class="q-mt-xs"
                            :style="{ minHeight: i === 0 ? '32px' : '24px' }"
                        >
                            <q-btn
                                v-if="i === 0"
                                icon="ads_click"
                                color="primary"
                                dense
                                outline
                                flat
                                @click="$emit('select-first-multi', index)"
                                :label="$t('SelectData') + ' 1'"
                                size="sm"
                                class="q-mb-xs full-width"
                            />
                        </div>
                    </template>

                    <q-separator class="q-my-sm" />

                    <!-- Second Group -->
                    <template v-if="record.samplesSecond.length === 0">
                        <div class="column items-center justify-center full-width">
                            <q-btn
                                icon="ads_click"
                                color="secondary"
                                dense
                                outline
                                flat
                                @click="$emit('select-second-multi', index)"
                                :label="$t('SelectData') + ' 2'"
                                size="sm"
                                class="q-mb-xs full-width"
                            />
                        </div>
                    </template>
                    <template v-else>
                        <div
                            v-for="(sample, i) in record.samplesSecond"
                            :key="'select-second-' + sample.id"
                            class="q-mt-xs"
                            :style="{ minHeight: i === 0 ? '32px' : '24px' }"
                        >
                            <q-btn
                                v-if="i === 0"
                                icon="ads_click"
                                color="secondary"
                                dense
                                outline
                                flat
                                @click="$emit('select-second-multi', index)"
                                :label="$t('SelectData') + ' 2'"
                                size="sm"
                                class="q-mb-xs full-width"
                            />
                        </div>
                    </template>
                </div>
            </template>

            <template v-else-if="column.paramDef">
                <div v-if="column.paramDef.type === 'file'">
                    <q-file
                        :error="record.params[column.key].isError"
                        :error-message="column.paramDef.error"
                        v-model="record.params[column.key].value"
                        label-color="purple"
                        dense
                        filled
                    >
                        <q-tooltip>{{ column.paramDef.description }}</q-tooltip>
                    </q-file>
                </div>
                <div v-if="column.paramDef.type === 'string'">
                    <q-input
                        :error="record.params[column.key].isError"
                        :error-message="column.paramDef.error"
                        v-model="record.params[column.key].value"
                        label-color="purple"
                        dense
                        filled
                    >
                        <q-tooltip>{{ column.paramDef.description }}</q-tooltip>
                    </q-input>
                </div>
                <div v-if="column.paramDef.type === 'number'">
                    <q-input
                        :error="record.params[column.key].isError"
                        :error-message="column.paramDef.error"
                        type="number"
                        label-color="purple"
                        dense
                        filled
                        v-model="record.params[column.key].value"
                    >
                        <q-tooltip>{{ column.paramDef.description }}</q-tooltip>
                    </q-input>
                </div>
                <div v-if="column.paramDef.type === 'select'">
                    <q-select
                        :error="record.params[column.key].isError"
                        use-input
                        @focus="focusSelect(column.key, column.paramDef)"
                        @filter="filterFn"
                        :error-message="column.paramDef.error"
                        v-model="record.params[column.key].value"
                        :options="column.paramDef.choices"
                        label-color="purple"
                        dense
                        filled
                        :option-label="langConfig.lang === 'cn' ? 'cnLabel' : 'enLabel'"
                        option-value="'value'"
                    />
                </div>
                <div v-if="column.paramDef.type === 'multiSelect'">
                    <div class="row no-wrap">
                        <div class="col">
                            <q-select
                                :error="record.params[column.key].isError"
                                use-input
                                @focus="focusSelect(column.key, column.paramDef)"
                                @filter="filterFn"
                                :error-message="column.paramDef.error"
                                v-model="record.params[column.key].value"
                                :options="column.paramDef.choices"
                                label-color="purple"
                                dense
                                filled
                                option-value="value"
                                :option-label="(opt) => langConfig.lang === 'cn' ? opt.cnLabel : opt.enLabel"
                                multiple
                                use-chips
                            >
                                <q-tooltip>{{ column.paramDef.description }}</q-tooltip>
                                <template v-slot:option="scope">
                                    <q-item v-bind="scope.itemProps">
                                        <span
                                            >{{ langConfig.lang === 'cn' ? scope.opt.cnLabel : scope.opt.enLabel }}</span
                                        >
                                        <span class="q-ml-sm text-grey-6">{{ scope.opt.value }}</span>
                                    </q-item>
                                </template>
                            </q-select>
                        </div>
                        <div class="col-auto q-pl-xs">
                            <q-btn
                                icon="list_alt"
                                color="primary"
                                size="sm"
                                dense
                                @click="openBatchSelectDialog(column.key, column.paramDef)"
                                :title="$t('BatchSelect')"
                            />
                        </div>
                    </div>
                </div>
                <div v-if="column.paramDef.type === 'select-from-csv'">
                    <q-select
                        :error="record.params[column.key].isError"
                        @focus="focusSelect(column.key, column.paramDef)"
                        @filter="filterFn"
                        :error-message="column.paramDef.error"
                        v-model="record.params[column.key].value"
                        :options="csvOptions[column.key]"
                        label-color="purple"
                        dense
                        filled
                        :option-label="langConfig.lang === 'cn' ? 'cnLabel' : 'enLabel'"
                        option-value="'value'"
                        use-chips
                    >
                        <q-tooltip>{{ column.paramDef.description }}</q-tooltip>
                    </q-select>
                </div>
            </template>

            <template v-if="column.dataIndex === 'sampleIdentifier'">
                <!-- Single -->
                <div v-if="sampleType === 'single'" class="row items-center no-wrap">
                    <div
                        v-if="record.sampleFirstError && !record.sampleFirst?.identifier"
                        class="full-width text-center text-negative q-pa-xs"
                        style="border: 1px solid var(--q-negative); border-radius: 4px"
                    >
                        {{ $t('Data') }} {{ $t('Required') }}
                    </div>
                    <q-input
                        v-else-if="record.sampleFirst?.identifier || record.sampleFirst?.notFound"
                        class="full-width"
                        stack-label
                        :label="$t('DataNewFormDataIdentificationNumber')"
                        label-color="purple"
                        dense
                        filled
                        readonly
                        :model-value="record.sampleFirst?.identifier || ''"
                        :error="record.sampleFirst?.notFound"
                        :error-message="$t('DataIdentifierNotFound')"
                    />
                </div>

                <!-- Double -->
                <div v-else-if="sampleType === 'double'">
                    <div class="row items-center no-wrap q-mb-xs" style="min-height: 40px">
                        <div
                            v-if="record.sampleFirstError && !record.sampleFirst?.identifier"
                            class="col text-center text-negative q-pa-xs"
                            style="border: 1px solid var(--q-negative); border-radius: 4px"
                        >
                            {{ $t('Data') }} {{ $t('Required') }}
                        </div>
                        <q-input
                            v-else
                            class="col"
                            stack-label
                            :label="$t('DataNewFormDataIdentificationNumber')"
                            label-color="purple"
                            dense
                            filled
                            readonly
                            :model-value="record.sampleFirst?.identifier || ''"
                            :error="record.sampleFirst?.notFound"
                            :error-message="$t('DataIdentifierNotFound')"
                        />
                    </div>
                    <div class="row items-center no-wrap" style="min-height: 40px">
                        <div
                            v-if="record.sampleSecondError && !record.sampleSecond?.identifier"
                            class="col text-center text-negative q-pa-xs"
                            style="border: 1px solid var(--q-negative); border-radius: 4px"
                        >
                            {{ $t('Data') }} {{ $t('Required') }}
                        </div>
                        <q-input
                            v-else
                            class="col"
                            stack-label
                            :label="$t('DataNewFormDataIdentificationNumber')"
                            label-color="purple"
                            dense
                            filled
                            readonly
                            :model-value="record.sampleSecond?.identifier || ''"
                            :error="record.sampleSecond?.notFound"
                            :error-message="$t('DataIdentifierNotFound')"
                        />
                    </div>
                </div>

                <!-- Multiple -->
                <div v-else-if="sampleType === 'multiple'">
                    <div
                        v-if="record.samplesError && (!record.samples || record.samples.length === 0)"
                        class="full-width text-center text-negative q-pa-xs"
                        style="border: 1px solid var(--q-negative); border-radius: 4px"
                    >
                        {{ $t('Data') }} {{ $t('Required') }}
                    </div>
                    <template v-else>
                        <div style="height: 32px"></div>
                        <div v-for="sample in record.samples" :key="sample.id" class="q-mt-xs" style="min-height: 40px">
                            <q-input
                                dense
                                filled
                                readonly
                                :model-value="sample.identifier || sample.sample_identifier || ''"
                                :error="sample.notFound"
                                :title="sample.identifier || sample.sample_identifier"
                            >
                                <q-tooltip>{{ $t('DataNewFormDataIdentificationNumber') }}</q-tooltip>
                            </q-input>
                        </div>
                    </template>
                </div>

                <!-- Double Multiple -->
                <div v-else-if="sampleType === 'double_multiple'">
                    <!-- First Group -->
                    <template v-if="record.samplesFirst.length === 0">
                        <div
                            v-if="record.samplesFirstError"
                            class="full-width text-center text-negative q-pa-xs"
                            style="border: 1px solid var(--q-negative); border-radius: 4px"
                        >
                            {{ $t('Data') }} {{ $t('Required') }}
                        </div>
                        <div v-else style="height: 32px"></div>
                    </template>
                    <template v-else>
                        <div
                            v-for="(sample, i) in record.samplesFirst"
                            :key="'first-' + sample.id"
                            class="q-mt-xs"
                            :style="{ minHeight: i === 0 ? '32px' : '24px' }"
                        >
                            <div class="text-caption ellipsis">{{ sample.identifier || sample.sample_identifier }}</div>
                        </div>
                    </template>

                    <q-separator class="q-my-sm" />

                    <!-- Second Group -->
                    <template v-if="record.samplesSecond.length === 0">
                        <div
                            v-if="record.samplesSecondError"
                            class="full-width text-center text-negative q-pa-xs"
                            style="border: 1px solid var(--q-negative); border-radius: 4px"
                        >
                            {{ $t('Data') }} {{ $t('Required') }}
                        </div>
                        <div v-else style="height: 32px"></div>
                    </template>
                    <template v-else>
                        <div
                            v-for="(sample, i) in record.samplesSecond"
                            :key="'second-' + sample.id"
                            class="q-mt-xs"
                            :style="{ minHeight: i === 0 ? '32px' : '24px' }"
                        >
                            <div class="text-caption ellipsis">{{ sample.identifier || sample.sample_identifier }}</div>
                        </div>
                    </template>
                </div>
            </template>

            <template v-if="column.dataIndex === 'fastqData'">
                <!-- Single -->
                <div v-if="sampleType === 'single'">
                    <div class="column items-start">
                        <span
                            v-if="record.sampleFirst?.fastq1_path"
                            class="fastq-text"
                            :class="fastqTextClass(record.sampleFirst?.fastq1_warn, record.sampleFirst?.fastq1_ok)"
                        >
                            <q-chip label="R1" dense color="primary" text-color="white" size="12px" class="q-mr-xs" />
                            {{ record.sampleFirst.fastq1_path }}
                            <q-icon
                                v-if="record.sampleFirst?.fastq1_warn"
                                name="warning"
                                color="orange"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <q-icon
                                v-else-if="record.sampleFirst?.fastq1_ok"
                                name="check_circle"
                                color="green-8"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <FastqTooltip
                                :info="record.sampleFirst?.fastq1_info"
                                :warn="record.sampleFirst?.fastq1_warn"
                            />
                        </span>
                        <span
                            v-if="record.sampleFirst?.fastq2_path"
                            class="fastq-text q-mt-xs"
                            :class="fastqTextClass(record.sampleFirst?.fastq2_warn, record.sampleFirst?.fastq2_ok)"
                        >
                            <q-chip label="R2" dense color="primary" size="12px" text-color="white" class="q-mr-xs" />
                            {{ record.sampleFirst.fastq2_path }}
                            <q-icon
                                v-if="record.sampleFirst?.fastq2_warn"
                                name="warning"
                                color="orange"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <q-icon
                                v-else-if="record.sampleFirst?.fastq2_ok"
                                name="check_circle"
                                color="green-8"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <FastqTooltip
                                :info="record.sampleFirst?.fastq2_info"
                                :warn="record.sampleFirst?.fastq2_warn"
                            />
                        </span>
                    </div>
                </div>

                <!-- Double -->
                <div v-else-if="sampleType === 'double'">
                    <div class="column items-start justify-center q-mb-xs" style="min-height: 40px">
                        <span
                            v-if="record.sampleFirst?.fastq1_path"
                            class="fastq-text"
                            :class="fastqTextClass(record.sampleFirst?.fastq1_warn, record.sampleFirst?.fastq1_ok)"
                        >
                            <q-chip label="R1" dense color="primary" text-color="white" size="12px" class="q-mr-xs" />
                            {{ record.sampleFirst.fastq1_path }}
                            <q-icon
                                v-if="record.sampleFirst?.fastq1_warn"
                                name="warning"
                                color="orange"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <q-icon
                                v-else-if="record.sampleFirst?.fastq1_ok"
                                name="check_circle"
                                color="green-8"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <FastqTooltip
                                :info="record.sampleFirst?.fastq1_info"
                                :warn="record.sampleFirst?.fastq1_warn"
                            />
                        </span>
                        <span
                            v-if="record.sampleFirst?.fastq2_path"
                            class="fastq-text q-mt-xs"
                            :class="fastqTextClass(record.sampleFirst?.fastq2_warn, record.sampleFirst?.fastq2_ok)"
                        >
                            <q-chip label="R2" dense color="primary" text-color="white" size="12px" class="q-mr-xs" />
                            {{ record.sampleFirst.fastq2_path }}
                            <q-icon
                                v-if="record.sampleFirst?.fastq2_warn"
                                name="warning"
                                color="orange"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <q-icon
                                v-else-if="record.sampleFirst?.fastq2_ok"
                                name="check_circle"
                                color="green-8"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <FastqTooltip
                                :info="record.sampleFirst?.fastq2_info"
                                :warn="record.sampleFirst?.fastq2_warn"
                            />
                        </span>
                    </div>
                    <div class="column items-start justify-center" style="min-height: 40px">
                        <span
                            v-if="record.sampleSecond?.fastq1_path"
                            class="fastq-text"
                            :class="fastqTextClass(record.sampleSecond?.fastq1_warn, record.sampleSecond?.fastq1_ok)"
                        >
                            <q-chip label="R1" dense color="primary" text-color="white" size="12px" class="q-mr-xs" />
                            {{ record.sampleSecond.fastq1_path }}
                            <q-icon
                                v-if="record.sampleSecond?.fastq1_warn"
                                name="warning"
                                color="orange"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <q-icon
                                v-else-if="record.sampleSecond?.fastq1_ok"
                                name="check_circle"
                                color="green-8"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <FastqTooltip
                                :info="record.sampleSecond?.fastq1_info"
                                :warn="record.sampleSecond?.fastq1_warn"
                            />
                        </span>
                        <span
                            v-if="record.sampleSecond?.fastq2_path"
                            class="fastq-text q-mt-xs"
                            :class="fastqTextClass(record.sampleSecond?.fastq2_warn, record.sampleSecond?.fastq2_ok)"
                        >
                            <q-chip label="R2" dense color="primary" text-color="white" size="12px" class="q-mr-xs" />
                            {{ record.sampleSecond.fastq2_path }}
                            <q-icon
                                v-if="record.sampleSecond?.fastq2_warn"
                                name="warning"
                                color="orange"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <q-icon
                                v-else-if="record.sampleSecond?.fastq2_ok"
                                name="check_circle"
                                color="green-8"
                                size="14px"
                                class="q-mr-xs"
                            />
                            <FastqTooltip
                                :info="record.sampleSecond?.fastq2_info"
                                :warn="record.sampleSecond?.fastq2_warn"
                            />
                        </span>
                    </div>
                </div>

                <!-- Multiple -->
                <div v-else-if="sampleType === 'multiple'">
                    <div style="height: 32px"></div>
                    <!-- Spacer for Select Button alignment -->
                    <div
                        v-for="sample in record.samples"
                        :key="sample.id"
                        class="q-mt-xs column justify-center"
                        style="min-height: 40px"
                    >
                        <div v-if="sample.fastq1_path" class="row items-center no-wrap">
                            <q-chip label="R1" dense color="primary" text-color="white" size="10px" />
                            <span
                                class="text-caption ellipsis"
                                style="max-width: 250px"
                                :title="sample.fastq1_path"
                                >{{ sample.fastq1_path }}</span
                            >
                            <q-icon v-if="sample.fastq1_warn" name="warning" color="orange" size="12px" />
                            <q-icon v-else-if="sample.fastq1_ok" name="check_circle" color="green-8" size="12px" />
                            <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                        </div>
                        <div v-if="sample.fastq2_path" class="row items-center no-wrap">
                            <q-chip label="R2" dense color="primary" text-color="white" size="10px" />
                            <span
                                class="text-caption ellipsis"
                                style="max-width: 250px"
                                :title="sample.fastq2_path"
                                >{{ sample.fastq2_path }}</span
                            >
                            <q-icon v-if="sample.fastq2_warn" name="warning" color="orange" size="12px" />
                            <q-icon v-else-if="sample.fastq2_ok" name="check_circle" color="green-8" size="12px" />
                            <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                        </div>
                    </div>
                </div>

                <!-- Double Multiple -->
                <div v-else-if="sampleType === 'double_multiple'">
                    <div style="height: 32px"></div>
                    <div
                        v-for="sample in record.samplesFirst"
                        :key="'first-fq-' + sample.id"
                        class="q-mt-xs"
                        style="min-height: 24px"
                    >
                        <div class="row items-center no-wrap">
                            <q-btn
                                v-if="sample.fastq1_path"
                                dense
                                flat
                                outline
                                size="xs"
                                :color="sample.fastq1_warn ? 'orange' : (sample.fastq1_ok ? 'green-8' : 'grey-7')"
                            >
                                R1
                                <q-tooltip>{{sample.fastq1_path}}</q-tooltip>
                                <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                            </q-btn>
                            <q-btn
                                v-if="sample.fastq2_path"
                                dense
                                flat
                                outline
                                size="xs"
                                :color="sample.fastq2_warn ? 'orange' : (sample.fastq2_ok ? 'green-8' : 'grey-7')"
                            >
                                R2
                                <q-tooltip>{{sample.fastq2_path}}</q-tooltip>
                                <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                            </q-btn>
                        </div>
                    </div>

                    <q-separator class="q-my-sm" />

                    <div style="height: 32px"></div>
                    <div
                        v-for="sample in record.samplesSecond"
                        :key="'second-fq-' + sample.id"
                        class="q-mt-xs"
                        style="min-height: 24px"
                    >
                        <div class="row items-center no-wrap">
                            <q-btn
                                v-if="sample.fastq1_path"
                                dense
                                flat
                                outline
                                size="xs"
                                :color="sample.fastq1_warn ? 'orange' : (sample.fastq1_ok ? 'green-8' : 'grey-7')"
                            >
                                R1
                                <q-tooltip>{{sample.fastq1_path}}</q-tooltip>
                                <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                            </q-btn>
                            <q-btn
                                v-if="sample.fastq2_path"
                                dense
                                flat
                                outline
                                size="xs"
                                :color="sample.fastq2_warn ? 'orange' : (sample.fastq2_ok ? 'green-8' : 'grey-7')"
                            >
                                R2
                                <q-tooltip>{{sample.fastq2_path}}</q-tooltip>
                                <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                            </q-btn>
                        </div>
                    </div>
                </div>
            </template>
        </template>
    </a-table>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FastqTooltip from './FastqTooltip.vue'
import { Table as ATable } from 'ant-design-vue'

const props = defineProps({
  files: { type: Array, required: true },
  sampleType: { type: String, required: true },
  supportSampleRatio: { type: Boolean, default: false },
  projectDetail: { type: Object, required: true },
  paramsDefine: { type: Array, required: false, default: () => [] },
  csvOptions: { type: Object, required: false, default: () => ({}) },
  langConfig: { type: Object, required: false, default: () => ({}) },
  focusSelect: { type: Function, required: false, default: () => {} },
  filterFn: { type: Function, required: false, default: () => {} },
  openBatchSelectDialog: { type: Function, required: false, default: () => {} }
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

const columns = computed(() => {
    const cols = [
        { title: '#', dataIndex: 'index', width: 50, align: 'center' },
        { title: t('Action'), dataIndex: 'action', width: 120, align: 'center' },
        { title: t('Task') + t('Name'), dataIndex: 'taskName', width: 260 },
    ]

    if (props.paramsDefine) {
        props.paramsDefine.forEach(param => {
            cols.push({
                title: param.key,
                key: param.key,
                width: 100,
                paramDef: param
            })
        })
    }

    cols.push(
        { title: t('DataNewFormDataIdentificationNumber'), dataIndex: 'sampleIdentifier', width: 250 },
        { title: t('File'), dataIndex: 'fastqData', width: 400 }
    )
    return cols
})

const fastqTextClass = (warn, ok) => {
  if (warn) return 'text-orange'
  if (ok) return 'text-black'
  return 'text-grey-7'
}
</script>

<style scoped>
.fastq-text {
  font-size: 12px;
}
</style>
