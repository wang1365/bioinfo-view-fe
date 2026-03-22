<template>
    <div
        class="sample-info-display q-ml-md bg-grey-2 rounded-borders q-px-sm q-py-xs"
        v-if="sampleInfoList.length > 0"
        style="overflow-x: auto"
    >
        <!-- Single Sample: Full Info -->
        <div
            v-if="sampleInfoList.length === 1"
            class="text-subtitle2 text-grey-9 row items-center q-gutter-x-sm no-wrap"
        >
            <span class="text-nowrap"
                >{{ $t('Patient') }}:
                <span
                    class="text-primary cursor-pointer"
                    @click="showPatient(sampleInfoList[0].patientDbId)"
                    >{{ sampleInfoList[0].patientName }}</span
                ></span
            >
            <q-separator vertical />
            <span class="text-nowrap"
                >{{ $t('SampleListTableColumnPatientIdentificationNumber') }}:
                <span
                    class="text-primary cursor-pointer"
                    @click="showPatient(sampleInfoList[0].patientDbId)"
                    >{{ sampleInfoList[0].patientId }}</span
                ></span
            >
            <q-separator vertical />
            <span class="text-nowrap"
                >{{ $t('Sample') }}:
                <span
                    class="text-primary cursor-pointer"
                    @click="showSample(sampleInfoList[0].sampleDbId)"
                    >{{ sampleInfoList[0].sampleId }}</span
                ></span
            >
            <q-separator vertical />
            <span class="text-nowrap"
                >{{ $t('DataListTableColumnDataIdentificationNumber') }}:
                <span
                    class="text-primary cursor-pointer"
                    @click="showData(sampleInfoList[0].dataDbId)"
                    >{{ sampleInfoList[0].dataId }}</span
                ></span
            >
            <q-separator vertical />
            <span class="text-nowrap"
                >{{ $t('DataNewFormCaptureKit') }}: {{ sampleInfoList[0].captureKit }}</span
            >
        </div>

        <!-- Multiple Samples: Brief Info + Hover -->
        <div
            v-else
            class="text-subtitle2 text-grey-9 row items-center q-gutter-x-sm cursor-pointer no-wrap"
            @mouseenter="onMenuEnter"
            @mouseleave="onMenuLeave"
        >
            <div class="row items-center q-gutter-x-sm no-wrap">
                <div
                    v-for="(item, index) in sampleInfoList.slice(0, 2)"
                    :key="index"
                    class="bg-white q-px-sm rounded-borders row items-center q-gutter-x-xs no-wrap"
                >
                    <q-chip dense size="sm" color="primary" text-color="white">{{ index + 1 }}</q-chip>
                    <span class="text-nowrap"
                        >{{ $t('Patient') }}:
                        <span
                            class="text-primary cursor-pointer"
                            @click.stop="showPatient(item.patientDbId)"
                            >{{ item.patientName }}</span
                        ></span
                    >
                    <q-separator vertical />
                    <span class="text-nowrap"
                        >{{ $t('Sample') }}:
                        <span
                            class="text-primary cursor-pointer"
                            @click.stop="showSample(item.sampleDbId)"
                            >{{ item.sampleId }}</span
                        ></span
                    >
                    <q-separator vertical />
                    <span class="text-nowrap"
                        >{{ $t('DataListTableColumnDataIdentificationNumber') }}:
                        <span
                            class="text-primary cursor-pointer"
                            @click.stop="showData(item.dataDbId)"
                            >{{ item.dataId }}</span
                        ></span
                    >
                    <q-separator vertical />
                    <span class="text-nowrap">{{ $t('DataNewFormCaptureKit') }}: {{ item.captureKit }}</span>
                </div>
            </div>

            <span class="text-weight-bold" v-if="sampleInfoList.length > 2">({{ sampleInfoList.length }})</span>

            <q-menu
                v-model="showMultiSampleMenu"
                no-focus
                no-parent-event
                anchor="bottom start"
                self="top start"
                @mouseenter="onMenuEnter"
                @mouseleave="onMenuLeave"
                style="max-width: 800px"
            >
                <q-list style="min-width: 400px" separator>
                    <q-item v-for="(item, index) in sampleInfoList" :key="index">
                        <q-item-section>
                            <div class="row q-gutter-y-xs">
                                <div class="col-12 text-subtitle1 text-weight-bold row items-center">
                                    <q-chip
                                        dense
                                        size="sm"
                                        color="primary"
                                        text-color="white"
                                        >{{ index + 1 }}</q-chip
                                    >
                                    {{ $t('DataListTableColumnDataIdentificationNumber') }}:
                                    <span
                                        class="text-primary cursor-pointer q-ml-xs"
                                        @click="showData(item.dataDbId)"
                                        >{{ item.dataId }}</span
                                    >
                                </div>
                                <div class="col-12 row q-gutter-x-sm text-caption text-grey-8 items-center">
                                    <div class="col-auto">
                                        {{ $t('Patient') }}:
                                        <span
                                            class="text-primary cursor-pointer"
                                            @click="showPatient(item.patientDbId)"
                                            >{{ item.patientName }}</span
                                        >
                                    </div>
                                    <q-separator vertical />
                                    <div class="col-auto">
                                        {{ $t('SampleListTableColumnPatientIdentificationNumber') }}:
                                        <span
                                            class="text-primary cursor-pointer"
                                            @click="showPatient(item.patientDbId)"
                                            >{{ item.patientId }}</span
                                        >
                                    </div>
                                    <q-separator vertical />
                                    <div class="col-auto">
                                        {{ $t('SampleListTableColumnSampleIdentificationNumber') }}:
                                        <span
                                            class="text-primary cursor-pointer"
                                            @click="showSample(item.sampleDbId)"
                                            >{{ item.sampleId }}</span
                                        >
                                    </div>
                                    <q-separator vertical />
                                    <div class="col-auto">
                                        {{ $t('DataNewFormCaptureKit') }}: {{ item.captureKit }}
                                    </div>
                                </div>
                            </div>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </div>

        <q-dialog v-model="showPatientInfo">
            <q-card style="width: 900px; max-width: 80vw">
                <q-toolbar>
                    <q-toolbar-title>{{ $t('PatientInfoPageTitle') }}</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
                <q-separator />
                <q-card-section class="q-pa-none">
                    <PatientInfo :id="infoId" class="no-shadow" />
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="showSampleInfo">
            <SampleInfo :id="infoId" />
        </q-dialog>

        <q-dialog v-model="showDataInfo">
            <DataInfo :id="infoId" />
        </q-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PatientInfo from 'src/pages/main/patients/PatientInfo.vue'
import SampleInfo from 'src/pages/main/samples/SampleInfo.vue'
import DataInfo from 'src/pages/main/data/DataInfo.vue'

const props = defineProps({
    samples: {
        type: Array,
        default: () => []
    }
})

const sampleInfoList = computed(() => {
    if (!props.samples || props.samples.length === 0) return []
    return props.samples.map(sd => ({
        patientName: sd.sample_meta?.patient?.name || '-',
        patientId: sd.sample_meta?.patient?.identifier || '-',
        patientDbId: sd.sample_meta?.patient?.id,
        sampleId: sd.sample_meta?.identifier || '-',
        sampleDbId: sd.sample_meta?.id,
        dataId: sd.identifier || '-',
        dataDbId: sd.id,
        captureKit: sd.reagent_box || '-'
    }))
})

const showPatientInfo = ref(false)
const showSampleInfo = ref(false)
const showDataInfo = ref(false)
const infoId = ref(0)

const showMultiSampleMenu = ref(false)
let menuTimer = null

const onMenuEnter = () => {
    if (menuTimer) clearTimeout(menuTimer)
    showMultiSampleMenu.value = true
}

const onMenuLeave = () => {
    menuTimer = setTimeout(() => {
        showMultiSampleMenu.value = false
    }, 200)
}

const showPatient = (id) => {
    if (!id) return
    infoId.value = id
    showPatientInfo.value = true
}
const showSample = (id) => {
    if (!id) return
    infoId.value = id
    showSampleInfo.value = true
}
const showData = (id) => {
    if (!id) return
    infoId.value = id
    showDataInfo.value = true
}
</script>

<style scoped>
.sample-info-display {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
}
</style>
