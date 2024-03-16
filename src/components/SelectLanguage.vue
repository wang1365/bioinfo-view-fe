<template>
    <q-select
        dense
        v-model="store.langConfig.lang"
        :options="langOptions"
        item-aligned
        @update:model-value="updateLang"
        borderless
        options-dense
        emit-value
        map-options
        style="max-width: 120px;color:white"
    >
        <template v-if="false" v-slot:before>
            <q-btn flat dense color="amber-1" :label="$t('Language') + ':'" />
        </template>
    </q-select>
</template>

<script setup>
import { onMounted } from 'vue'
import { globalStore } from 'src/stores/global'
import { useI18n } from 'vue-i18n'

const store = globalStore()
const { langConfig } = store
const { locale } = useI18n({ useScope: 'global' })

const langOptions = [
    { label: 'English', value:'en' },
    { label: '简体中文', value:'cn' },
]

onMounted(() => {
    console.log('==========> navigator.language', navigator.language)
    console.log('==========> store.langConfig', store.langConfig)
    console.log('==========> locale', locale)
    locale.value = langConfig.lang === 'en' ? 'en-US' : 'zh-CN'
})

const updateLang = (v) => {
    console.log('==========> 语言切换到:', v)
    locale.value = v === 'en' ? 'en-US' : 'zh-CN'
}
</script>
