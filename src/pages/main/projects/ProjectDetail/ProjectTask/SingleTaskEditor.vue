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
            <div class="col-auto q-ml-lg">
                <q-btn icon="add" color="primary" flat :label="$t('Add') + $t('Data')" @click="$emit('add-file')" />
            </div>
            <div class="col flex flex-center">
                <div class="row q-gutter-sm items-center">
                    <div class="col-auto">
                        <div class="relative-position inline-block">
                            <q-btn
                                color="primary"
                                dense
                                outline
                                flat
                                icon="upload"
                                :label="$t('PageListTableUpload')"
                            />
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
        </div>

        <TaskDataSection
            :files="localItem.files"
            :sampleType="sampleType"
            :supportSampleRatio="supportSampleRatio"
            @select-single="selectSingle"
            @select-first="selectFirst"
            @select-second="selectSecond"
            @select-multi="selectMulti"
            @select-first-multi="selectFirstMulti"
            @select-second-multi="selectSecondMulti"
            @delete-file="onDeleteFile"
            @add-file="$emit('add-file')"
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
import { defineProps, defineEmits, ref } from 'vue'
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
  const files = localItem.value.files
  if (files.length > 1) {
    // 删除整行由父级处理
    emit('delete-file', fileIndex)
    return
  }
  // 仅一行时，清空当前行的数据
  const file = files[fileIndex]
  switch (props.sampleType) {
    case 'single': {
      file.sampleFirst = {}
      file.sampleFirstError = false
      break
    }
    case 'double': {
      file.sampleFirst = {}
      file.sampleSecond = {}
      file.sampleFirstError = false
      file.sampleSecondError = false
      break
    }
    case 'multiple': {
      file.samples = []
      file.samplesError = false
      break
    }
    case 'double_multiple': {
      file.samplesFirst = []
      file.samplesSecond = []
      file.samplesFirstError = false
      file.samplesSecondError = false
      break
    }
  }
  file.sampleDetails = [{ customName: '', sampleRatio: null }]
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
  if (props.sampleType === 'single') {
    headers = ['Data ID']
  } else if (props.sampleType === 'double') {
    headers = ['Data 1 ID', 'Data 2 ID']
  } else if (props.sampleType === 'multiple') {
    headers = Array.from({ length: 100 }, (_, i) => `Data ${i + 1} ID`)
  } else {
    headers = ['Data ID']
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
  apiPost('/sample/samples/check_fastq', (res) => {
    const results = res.data || res
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

const handleCsvUpload = async () => {
  if (!csvFile.value) return
  const file = Array.isArray(csvFile.value) ? csvFile.value[0] : csvFile.value
  if (!file) return
  const text = await file.text()
  const { rows } = parseCsvToList(text, ',', true)
  const identifiers = []
  for (const row of rows) {
    const values = Object.values(row).filter((v) => v && v.length > 0)
    for (const v of values) identifiers.push(v)
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
    for (const row of rows) {
      const values = Object.values(row).filter((v) => v && v.length > 0)
      if (props.sampleType === 'single') {
        const first = getSample(values[0])
        const fileItem = {
          sampleFirst: first,
          sampleFirstError: false,
          sampleDetails: [{ customName: first.sample_identifier || first.identifier || '', sampleRatio: null, id: first.id }],
        }
        imported.push(fileItem)
      } else if (props.sampleType === 'double') {
        const first = getSample(values[0])
        const second = getSample(values[1])
        const fileItem = {
          sampleFirst: first,
          sampleSecond: second,
          sampleFirstError: false,
          sampleSecondError: false,
          sampleDetails: [
            { customName: first.sample_identifier || first.identifier || '', sampleRatio: null, id: first.id },
            { customName: second.sample_identifier || second.identifier || '', sampleRatio: null, id: second.id },
          ],
        }
        imported.push(fileItem)
      } else if (props.sampleType === 'multiple') {
        const samples = values.map((v) => getSample(v))
        const fileItem = {
          samples,
          samplesError: false,
          sampleDetails: samples.map((s) => ({ customName: s.sample_identifier || s.identifier || '', sampleRatio: null, id: s.id })),
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
