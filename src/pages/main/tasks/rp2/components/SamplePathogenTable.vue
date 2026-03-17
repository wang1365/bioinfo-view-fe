<template>
    <div>
        <q-banner v-if="errorText" dense class="bg-orange-1 text-orange-9 q-mb-sm">
            {{ errorText }}
        </q-banner>
        <a-table
            :columns="columns"
            :data-source="rows"
            :loading="loading"
            :pagination="pagination"
            row-key="__rowKey"
            bordered
            size="middle"
        />
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { readTaskFile } from 'src/api/task'
import { getRp2LangSuffix, parseTabText } from './rp2File'

const props = defineProps({
    taskId: {
        type: [String, Number],
        required: true
    },
    sampleName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const rows = ref([])
const columns = ref([])
const loading = ref(false)
const errorText = ref('')

const categoryDirMap = {
    bacteria: 'Bacteria',
    fungus: 'Fungus',
    virus: 'Virus'
}

const pagination = computed(() => ({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
    showTotal: (total) => t('PaginationTotal', { total })
}))

const filePath = computed(() => {
    const suffix = getRp2LangSuffix(langCode.value)
    const dir = categoryDirMap[props.category]
    if (props.category === 'virus') {
        return `${props.sampleName}/final_result/${dir}/${dir}_${suffix}_report.RPM.txt`
    }
    return `${props.sampleName}/final_result/${dir}/${dir}_${suffix}_pintai.RPM.txt`
})

const shouldRemoveColumn = (header) => {
    if (!header) {
        return false
    }

    const normalized = header.toLowerCase()
    return header.includes('去重后序列数') || normalized.includes('uniq')
}

const displayHeader = (header) => {
    const normalized = normalizeHeader(header)
    const map = {
        '中文属名': '属名',
        '中文病毒名': '属名',
        '占比': '相对丰度',
        '属count': '序列数',
        'count': '序列数',
        '中文种名': '种名',
        '属中占比': '占比',
        '种count': '序列数'
    }

    for (const [from, to] of Object.entries(map)) {
        if (normalized === normalizeHeader(from)) {
            return to
        }
    }

    return header
}

const normalizeHeader = (header) => String(header || '').replace(/\s+/g, '').toLowerCase()

const findHeaderByAliases = (headers, aliases, used) => {
    for (const header of headers) {
        if (used.has(header)) {
            continue
        }
        const normalized = normalizeHeader(header)
        for (const alias of aliases) {
            if (normalized === normalizeHeader(alias)) {
                used.add(header)
                return header
            }
        }
    }
    return ''
}

const getGroupedHeaders = (headers) => {
    const used = new Set()

    const genusHeaders = [
        findHeaderByAliases(headers, ['中文属名', '中文病毒名', '属名', 'genusname', 'virusname', 'genus'], used),
        findHeaderByAliases(headers, ['占比', '相对丰度', 'proportion', 'relativeabundance'], used),
        findHeaderByAliases(headers, ['属count', '属_count', 'genuscount', 'count', 'readscount'], used)
    ].filter(Boolean)

    const speciesHeaders = [
        findHeaderByAliases(headers, ['中文种名', '种名', 'speciesname', 'species', 'virusspeciesname'], used),
        findHeaderByAliases(headers, ['属中占比', 'speciesproportion', 'proportioningenus'], used),
        findHeaderByAliases(headers, ['种count', '种_count', 'speciescount', 'count', 'readscount'], used),
        findHeaderByAliases(headers, ['rpm'], used),
        findHeaderByAliases(headers, ['致病等级', 'pathogeniclevel', 'pathogenicity'], used)
    ].filter(Boolean)

    // Fallback by column order when header aliases are not stable.
    const fallbackLength = props.category === 'virus' ? 6 : 8
    if ((genusHeaders.length < 3 || speciesHeaders.length < 3) && headers.length >= fallbackLength) {
        return {
            genusHeaders: headers.slice(0, 3),
            speciesHeaders: props.category === 'virus' ? headers.slice(3, 6) : headers.slice(3, 8)
        }
    }

    return {
        genusHeaders,
        speciesHeaders
    }
}

const buildColumns = (headers) => {
    const leafColumns = headers.map((header, index) => ({
        title: displayHeader(header),
        dataIndex: header,
        key: `${header}-${index}`,
        ellipsis: true
    }))

    if (!['bacteria', 'fungus', 'virus'].includes(props.category)) {
        return leafColumns
    }

    const { genusHeaders, speciesHeaders } = getGroupedHeaders(headers)
    const leafMap = new Map(leafColumns.map((column) => [column.dataIndex, column]))
    const groupedColumns = []
    const groupedSet = new Set()

    const genusChildren = genusHeaders.map((header) => leafMap.get(header)).filter(Boolean)
    if (genusChildren.length > 0) {
        genusChildren.forEach((column) => groupedSet.add(column.dataIndex))
        groupedColumns.push({
            title: t('Rp2GenusGroupTitle'),
            key: 'rp2-genus-group',
            children: genusChildren
        })
    }

    const speciesChildren = speciesHeaders.map((header) => leafMap.get(header)).filter(Boolean)
    if (speciesChildren.length > 0) {
        speciesChildren.forEach((column) => groupedSet.add(column.dataIndex))
        groupedColumns.push({
            title: t('Rp2SpeciesGroupTitle'),
            key: 'rp2-species-group',
            children: speciesChildren
        })
    }

    headers.forEach((header) => {
        if (!groupedSet.has(header)) {
            const leaf = leafMap.get(header)
            if (leaf) {
                groupedColumns.push(leaf)
            }
        }
    })

    return groupedColumns
}

const loadData = async () => {
    loading.value = true
    errorText.value = ''

    try {
        const response = await readTaskFile(props.taskId, filePath.value, true, true)
        const text = typeof response === 'string' ? response : ''

        if (!text) {
            rows.value = []
            columns.value = []
            errorText.value = `${t('Rp2DataFileMissing')}: ${filePath.value}`
            return
        }

        const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: true })
        const keptHeaders = headers.filter((header) => !shouldRemoveColumn(header))

        rows.value = parsedRows.map((row) => {
            const mapped = {
                __rowKey: row.__rowKey
            }

            keptHeaders.forEach((header) => {
                mapped[header] = row[header] ?? ''
            })

            return mapped
        })

        columns.value = buildColumns(keptHeaders)
    } catch (error) {
        rows.value = []
        columns.value = []
        errorText.value = `${t('Rp2FailedToReadFile')}: ${filePath.value}`
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.taskId, props.sampleName, props.category, langCode.value],
    loadData,
    { immediate: true }
)
</script>
