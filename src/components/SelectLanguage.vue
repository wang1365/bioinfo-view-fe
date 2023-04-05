<template>
    <q-select dense v-model="store.lang" :options="langOptions" item-aligned
              @update:model-value="updateLang"
              borderless options-dense emit-value map-options style="max-width: 120px;color:white">
        <template v-if="false" v-slot:before>
            <q-btn flat dense color="amber-1" :label="$t('Language') + ':'"/>
        </template>
    </q-select>
</template>

<script setup>
import { onMounted } from 'vue'
import { globalStore } from 'src/stores/global'
import { useI18n } from 'vue-i18n'

const store = globalStore()
const { lang } = store
const { locale } = useI18n({ useScope: 'global' })

const langOptions = [
    { label: 'English', value:'en-US' },
    { label: '简体中文', value:'zh-CN' },
]

onMounted(() => {
    console.log('==========> navigator.language', navigator.language)
    console.log('==========> store.lang', store.lang)
    console.log('==========> locale', locale)
    if (store.lang !== locale.value) {
        locale.value = store.lang
    }
})

const updateLang = (v) => {
    console.log('==========> 语言切换到:', v)
    locale.value = v
}


</script>
