<template>
     <div>
            <q-btn
                v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
                icon="bookmarks"
                size="small"
                color="primary"
                class="relative-position float-right q-mr-md"
                :label="$t('ReportStickDone')"
                @click="reset()"
            />
            <q-btn
                v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
                icon="bookmarks"
                size="small"
                outline
                color="primary"
                class="relative-position float-right q-mr-md"
                @click="stickFilter()"
                :label="$t('ReportStickData')"
            />
            <q-btn
                icon="help_outline"
                size="small"
                outline
                color="orange"
                class="relative-position float-right q-mr-md"
                @click="dlgVisible = !dlgVisible"
                >{{ $t('Intro') }}</q-btn
            >
     </div>

</template>

<script setup>
import { computed, toRef, onMounted,ref,watch } from "vue";
const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showMutGermline: true,
                showMutSomatic: true,
                showSticky: false,
            }
        },
    },
    task: {
        type: Object,
        required: false,
    },
    stepData: {
        type: Object,
        default: () => {}
    }
})

</script>
