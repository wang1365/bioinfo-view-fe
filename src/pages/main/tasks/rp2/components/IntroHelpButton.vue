<template>
    <div :class="wrapperClass">
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="q-mr-md"
            :label="$t('Intro')"
            @click="visible = true"
        />
    </div>

    <q-dialog v-model="visible">
        <q-card style="width: 75%; max-width: 2000px">
            <q-bar class="bg-primary text-white">{{ displayTitle }}</q-bar>
            <q-card-section>
                <div style="white-space: pre-wrap; line-height: 28px">
                    {{ displayContent }}
                </div>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">{{ $t('Close') }}</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    disableFloat: {
        type: Boolean,
        default: false
    }
})

const { t } = useI18n()
const visible = ref(false)

const displayTitle = computed(() => props.title || t('Intro'))
const displayContent = computed(() => props.content || t('Rp2HelpPlaceholder'))
const wrapperClass = computed(() => (props.disableFloat ? 'intro-help-inline' : 'intro-help-float'))
</script>

<style scoped>
.intro-help-float {
    float: right;
    margin-left: 12px;
    margin-bottom: 8px;
}

.intro-help-inline {
    margin: 0;
}
</style>
