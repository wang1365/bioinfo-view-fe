<template>
    <q-select dense v-model="locale" :options="langOptions"
              borderless options-dense emit-value map-options style="min-width: 80px;color:white">
        <template v-if="false" v-slot:before>
            <q-btn flat dense color="amber-1" :label="$t('Language') + ':'"/>
        </template>
    </q-select>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { globalStore } from 'src/stores/global'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = globalStore()
const { locale } = useI18n({ useScope: 'global' })

const langOptions = [
    { label: 'English', value:'en-US' },
    { label: '简体中文', value:'zh-CN' },
]
const lang = ref(locale)

watch(lang, v => {
})


onMounted(() => {
    console.log('init lang', navigator.language, store.lang, lang.value)
    console.log('quasar', $q)
})


</script>
