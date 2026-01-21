<template>
    <div class="q-pa-sm">
        <div class="text-subtitle2">{{ $t('CustomParameters') }}:</div>
        <div class="row">
            <q-input
                class="col q-pr-sm"
                v-model="localItem.name"
                stack-label
                label-color="purple"
                filled
                :label="$t('Task')"
                :error="item.nameError"
                :error-message="$t('Required')"
            />
            <template v-for="param in paramsDefine" :key="param.key">
                <div class="col q-pr-sm" v-if="param.type === 'file'">
                    <q-file
                        :error="localItem.params[param.key].isError"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        stack-label
                        label-color="purple"
                        filled
                        :label="param.key"
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-file>
                </div>
                <div class="col q-pr-sm" v-if="param.type === 'string'">
                    <q-input
                        :error="localItem.params[param.key].isError"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        stack-label
                        label-color="purple"
                        filled
                        :label="param.key"
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-input>
                </div>
                <div class="col q-pr-sm" v-if="param.type === 'number'">
                    <q-input
                        :error="localItem.params[param.key].isError"
                        :error-message="param.error"
                        type="number"
                        stack-label
                        label-color="purple"
                        filled
                        v-model="localItem.params[param.key].value"
                        :label="param.key"
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-input>
                </div>
                <div class="col q-pr-sm" v-if="param.type === 'select'">
                    <q-select
                        :error="localItem.params[param.key].isError"
                        use-input
                        @focus="focusSelect(param.key, param)"
                        @filter="filterFn"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        :options="param.choices"
                        :label="param.key"
                        stack-label
                        label-color="purple"
                        filled
                        :option-label="langConfig.lang === 'cn' ? 'cnLabel' : 'enLabel'"
                        :placeholder="param.description"
                        option-value="'value'"
                    />
                </div>
                <div class="col q-pr-sm" v-if="param.type === 'multiSelect'">
                    <div class="row">
                        <div class="col-10">
                            <q-select
                                :error="localItem.params[param.key].isError"
                                use-input
                                @focus="focusSelect(param.key, param)"
                                @filter="filterFn"
                                :error-message="param.error"
                                v-model="localItem.params[param.key].value"
                                :options="param.choices"
                                :label="param.key"
                                stack-label
                                label-color="purple"
                                filled
                                option-value="value"
                                :option-label="(opt) => langConfig.lang === 'cn' ? opt.cnLabel : opt.enLabel"
                                multiple
                                use-chips
                            >
                                <q-tooltip>{{ param.description }}</q-tooltip>
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
                        <div class="col-2 q-pl-xs">
                            <q-btn
                                icon="list_alt"
                                color="primary"
                                size="md"
                                dense
                                @click="openBatchSelectDialog(param.key, param)"
                                :title="$t('BatchSelect')"
                            />
                        </div>
                    </div>
                </div>
                <div class="col q-pr-sm" v-if="param.type === 'select-from-csv'">
                    <q-select
                        :error="localItem.params[param.key].isError"
                        @focus="focusSelect(param.key, param)"
                        @filter="filterFn"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        :options="csvOptions[param.key]"
                        :label="param.key"
                        stack-label
                        label-color="purple"
                        filled
                        :option-label="langConfig.lang === 'cn' ? 'cnLabel' : 'enLabel'"
                        option-value="'value'"
                        use-chips
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-select>
                </div>
            </template>
        </div>

        <div class="row items-center q-my-sm">
            <div class="col-auto text-subtitle2">{{ $t('Data') + ':' }}</div>
            <div class="col row items-center q-gutter-sm">
                <div class="col-auto">
                    <q-btn
                        icon="add"
                        color="primary"
                        flat
                        :label="$t('Add') + $t('Data')"
                        @click="$emit('add-file', localItem.params)"
                    />
                </div>
                <div class="col-auto">
                    <div class="relative-position inline-block">
                        <q-btn color="primary" dense outline flat icon="upload" :label="$t('PageListTableUpload')" />
                        <q-file
                            v-model="csvFile"
                            class="absolute-full"
                            style="opacity:0;"
                            accept=".csv,text/csv"
                            @update:model-value="handleCsvUpload"
                        />
                    </div>
                </div>
                <div class="col-auto">
                    <q-btn
                        color="primary"
                        dense
                        outline
                        flat
                        icon="download"
                        :label="$t('PageListTableTemplate')"
                        @click="downloadCsvTemplate"
                    />
                </div>
                <div class="col"></div>
                <div class="col-auto">
                    <q-btn
                        color="orange"
                        dense
                        outline
                        flat
                        icon="rule"
                        :label="$t('DataCheck')"
                        @click="checkFastqFiles"
                    />
                </div>
            </div>
        </div>

        <TaskDataSection
            :files="localItem.files"
            :sampleType="sampleType"
            :supportSampleRatio="supportSampleRatio"
            :paramsDefine="paramsDefine"
            :csvOptions="csvOptions"
            :langConfig="langConfig"
            :focusSelect="focusSelect"
            :filterFn="filterFn"
            :openBatchSelectDialog="openBatchSelectDialog"
            @select-single="selectSingle"
            @select-first="selectFirst"
            @select-second="selectSecond"
            @select-multi="selectMulti"
            @select-first-multi="selectFirstMulti"
            @select-second-multi="selectSecondMulti"
            @delete-file="onDeleteFile"
            @add-file="$emit('add-file', localItem.params)"
            @bulk-import="onBulkImport"
        />

        <q-dialog persistent v-model="openDataSelectorSingle">
            <TaskDataSelectSingle :projectDetail="projectDetail" @refresh="singleSelected($event)" />
        </q-dialog>
        <q-dialog persistent v-model="openDataSelectorMulti">
            <TaskDataSelectMulti :projectDetail="projectDetail" @refresh="multiSelected($event)" />
        </q-dialog>
    </div>
</template>

<script setup>
import TaskDataSection from './TaskDataSection.vue'
import TaskDataSelectSingle from './TaskDataSelectSingle.vue'
import TaskDataSelectMulti from './TaskDataSelectMulti.vue'
import { useI18n } from 'vue-i18n'
import { defineProps, defineEmits, nextTick, ref, watch } from 'vue'
import { useApi } from 'src/api/apiBase'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import { parseCsvToList } from 'src/utils/csv'

const { t } = useI18n()

const props = defineProps({
  item: { type: Object, required: true },
  paramsDefine: { type: Array, required: true },
  csvOptions: { type: Object, required: true },
  langConfig: { type: Object, required: true },
  sampleType: { type: String, required: true },
  supportSampleRatio: { type: Boolean, default: false },
  focusSelect: { type: Function, required: true },
  filterFn: { type: Function, required: true },
  openBatchSelectDialog: { type: Function, required: true },
  projectDetail: { type: Object, required: true }
})

const localItem = ref(props.item)
const csvFile = ref(null)
const { apiPost } = useApi()

const openDataSelectorSingle = ref(false)
const openDataSelectorMulti = ref(false)
const activeParamFileIndex = ref(0)
const currentSample = ref('first')
const samples = ref([])

const onDeleteFile = (fileIndex) => {
  emit('delete-file', fileIndex)
  nextTick(() => {
    const nextLen = localItem.value.files?.length || 0
    activeParamFileIndex.value = Math.max(0, Math.min(activeParamFileIndex.value, nextLen - 1))
  })
}

const selectSingle = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'first'
  openDataSelectorSingle.value = true
}
const selectFirst = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'first'
  openDataSelectorSingle.value = true
}
const selectSecond = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'second'
  openDataSelectorSingle.value = true
}
const selectMulti = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'multi'
  openDataSelectorMulti.value = true
}
const selectFirstMulti = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'first-multi'
  openDataSelectorMulti.value = true
}
const selectSecondMulti = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'second-multi'
  openDataSelectorMulti.value = true
}

const singleSelected = (event) => {
  openDataSelectorSingle.value = false
  const file = localItem.value.files[activeParamFileIndex.value]
  if (currentSample.value === 'first') {
    file.sampleFirst = event
    file.sampleDetails[0] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  } else {
    file.sampleSecond = event
    file.sampleDetails[1] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  }
  checkFastqFiles()
}

const multiSelected = (event) => {
  openDataSelectorMulti.value = false
  const file = localItem.value.files[activeParamFileIndex.value]
  if (currentSample.value === 'multi') {
    file.samples = event
    file.sampleDetails = event.map(sample => ({ customName: sample.sample_identifier, sampleRatio: null, id: sample.id }))
  } else if (currentSample.value === 'first-multi') {
    file.samplesFirst = event
    file.sampleDetails[0] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  } else {
    file.samplesSecond = event
    file.sampleDetails[1] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  }
  samples.value = event
  checkFastqFiles()
}

const onBulkImport = (imported) => {
  if (!Array.isArray(imported)) return
  localItem.value.files = imported
  checkFastqFiles()
}

const downloadCsvTemplate = () => {
  let headers = []
  const taskNameHeader = 'Task Name'
  const paramHeaders = props.paramsDefine.map((p) => p.key)

  if (props.sampleType === 'single') {
    headers = [taskNameHeader, ...paramHeaders, 'Data ID']
  } else if (props.sampleType === 'double') {
    headers = [taskNameHeader, ...paramHeaders, 'Data 1 ID', 'Data 2 ID']
  } else if (props.sampleType === 'multiple') {
    headers = [taskNameHeader, ...paramHeaders, ...Array.from({ length: 100 }, (_, i) => `Data ${i + 1} ID`)]
  } else {
    headers = [taskNameHeader, ...paramHeaders, 'Data ID']
  }
  const content = headers.join(',') + '\n'
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `template_${props.sampleType}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const collectDataIds = () => {
  const ids = []
  for (const file of localItem.value.files || []) {
    if (props.sampleType === 'single') {
      if (file.sampleFirst?.identifier) ids.push(file.sampleFirst.identifier)
    } else if (props.sampleType === 'double') {
      if (file.sampleFirst?.identifier) ids.push(file.sampleFirst.identifier)
      if (file.sampleSecond?.identifier) ids.push(file.sampleSecond.identifier)
    } else if (props.sampleType === 'multiple') {
      for (const s of file.samples || []) {
        if (s?.identifier || s?.sample_identifier) ids.push(s.identifier || s.sample_identifier)
      }
    } else if (props.sampleType === 'double_multiple') {
      for (const s of file.samplesFirst || []) {
        if (s?.identifier || s?.sample_identifier) ids.push(s.identifier || s.sample_identifier)
      }
      for (const s of file.samplesSecond || []) {
        if (s?.identifier || s?.sample_identifier) ids.push(s.identifier || s.sample_identifier)
      }
    }
  }
  return Array.from(new Set(ids))
}

const checkFastqFiles = () => {
  const ids = collectDataIds()
  if (ids.length === 0) return
  console.log('checkFastqFiles start, ids:', ids)
  apiPost('/sample/samples/check_fastq', (res) => {
    const results = res.data || res
    console.log('checkFastqFiles res:', results)
    const badPaths = new Map()
    const infoByKey = new Map()

    const processInfo = (key, info) => {
      if (!info) return
      const exists = info.exists === true
      const ready = info.ready !== false
      if (info.path) infoByKey.set(info.path, info)
      if (key && typeof key === 'string') infoByKey.set(key, info)

      let errorMsg = ''
      if (!exists) {
        errorMsg = t('FileNotExist')
      } else if (!ready) {
        errorMsg = t('FileNotReady')
      }

      if (errorMsg) {
        if (info.path) badPaths.set(info.path, errorMsg)
        if (key && typeof key === 'string') badPaths.set(key, errorMsg)
      }
    }

    if (Array.isArray(results)) {
      results.forEach((info) => processInfo(null, info))
    } else {
      Object.entries(results || {}).forEach(([key, info]) => processInfo(key, info))
    }

    for (const file of localItem.value.files || []) {
      const markWarn = (sample) => {
        if (!sample) return

        const checkPath = (p) => {
          if (!p) return ''
          if (badPaths.has(p)) return badPaths.get(p)
          const filename = p.split(/[/\\]/).pop()
          if (badPaths.has(filename)) return badPaths.get(filename)
          return ''
        }
        const findInfo = (p) => {
          if (!p) return null
          if (infoByKey.has(p)) return infoByKey.get(p)
          const filename = p.split(/[/\\]/).pop()
          if (infoByKey.has(filename)) return infoByKey.get(filename)
          return null
        }

        const warn1 = checkPath(sample.fastq1_path)
        sample.fastq1_warn = warn1
        sample.fastq1_ok = !!sample.fastq1_path && !warn1
        sample.fastq1_info = findInfo(sample.fastq1_path)

        const warn2 = checkPath(sample.fastq2_path)
        sample.fastq2_warn = warn2
        sample.fastq2_ok = !!sample.fastq2_path && !warn2
        sample.fastq2_info = findInfo(sample.fastq2_path)

        console.log('Sample marked:', {
            id: sample.identifier || sample.sample_identifier,
            path1: sample.fastq1_path,
            ok1: sample.fastq1_ok,
            warn1,
            path2: sample.fastq2_path,
            ok2: sample.fastq2_ok,
            warn2
        })
      }
      if (props.sampleType === 'single') {
        markWarn(file.sampleFirst)
      } else if (props.sampleType === 'double') {
        markWarn(file.sampleFirst)
        markWarn(file.sampleSecond)
      } else if (props.sampleType === 'multiple') {
        for (const s of file.samples || []) markWarn(s)
      } else if (props.sampleType === 'double_multiple') {
        for (const s of file.samplesFirst || []) markWarn(s)
        for (const s of file.samplesSecond || []) markWarn(s)
      }
    }
  }, ids)
}

const createParams = (initialValues = {}) => {
  const params = {}
  for (const param of props.paramsDefine) {
    const val = initialValues[param.key] !== undefined ? initialValues[param.key] : null
    params[param.key] = { value: val, isError: false }
  }
  return params
}

const handleCsvUpload = async () => {
  if (!csvFile.value) return
  const file = Array.isArray(csvFile.value) ? csvFile.value[0] : csvFile.value
  if (!file) return
  const text = await file.text()
  const { rows } = parseCsvToList(text, ',', true)
  const identifiers = []
  const parsedRows = []
  const paramCount = props.paramsDefine ? props.paramsDefine.length : 0

  for (const row of rows) {
    const values = Object.values(row)
    const taskName = values[0] || ''

    const importedParams = {}
    if (paramCount > 0) {
      props.paramsDefine.forEach((param, idx) => {
        const val = values[1 + idx]
        importedParams[param.key] = val
      })
    }

    const sampleStartIndex = 1 + paramCount
    const sampleValues = values.slice(sampleStartIndex).filter((v) => v && v.length > 0)
    parsedRows.push({ taskName, sampleValues, importedParams })
    for (const v of sampleValues) identifiers.push(v)
  }
  const uniqIds = Array.from(new Set(identifiers))
  if (uniqIds.length === 0) {
    csvFile.value = null
    return
  }

  const query = buildModelQuery([], { identifier__in: uniqIds })
  const params = `?page=1&size=${uniqIds.length}`
  apiPost(`/model_query/sample${params}`, (res) => {
    const pool = res.data.results || []
    const byId = new Map(pool.map((item) => [item.identifier, item]))
    const imported = []
    const getSample = (v) => {
      if (v && v.length > 0) {
        return byId.get(v) || { identifier: v, notFound: true }
      }
      return { identifier: '', notFound: false }
    }
    for (const { taskName, sampleValues, importedParams } of parsedRows) {
      if (props.sampleType === 'single') {
        const first = getSample(sampleValues[0])
        const fileItem = {
          taskName,
          sampleFirst: first,
          sampleFirstError: false,
          sampleDetails: [{ customName: first.sample_identifier || first.identifier || '', sampleRatio: null, id: first.id }],
          params: createParams(importedParams),
          isCsvImported: true,
        }
        imported.push(fileItem)
      } else if (props.sampleType === 'double') {
        const first = getSample(sampleValues[0])
        const second = getSample(sampleValues[1])
        const fileItem = {
          taskName,
          sampleFirst: first,
          sampleSecond: second,
          sampleFirstError: false,
          sampleSecondError: false,
          sampleDetails: [
            { customName: first.sample_identifier || first.identifier || '', sampleRatio: null, id: first.id },
            { customName: second.sample_identifier || second.identifier || '', sampleRatio: null, id: second.id },
          ],
          params: createParams(importedParams),
          isCsvImported: true,
        }
        imported.push(fileItem)
      } else if (props.sampleType === 'multiple') {
        const samples = sampleValues.map((v) => getSample(v))
        const fileItem = {
          taskName,
          samples,
          samplesError: false,
          sampleDetails: samples.map((s) => ({ customName: s.sample_identifier || s.identifier || '', sampleRatio: null, id: s.id })),
          params: createParams(importedParams),
          isCsvImported: true,
        }
        imported.push(fileItem)
      }
    }
    localItem.value.files = imported
    csvFile.value = null
    checkFastqFiles()
  }, query)
}

const emit = defineEmits([
  'delete-file',
  'add-file'
])
</script>
