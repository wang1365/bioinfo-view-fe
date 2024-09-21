<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('SystemSetting')" />
        <!-- <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm justify-center">
             <div class="col-lg-6 col-md-6 col-sm-10 col-xs-12">
             <PieChart3 />
             </div>
             <div class="col-lg-6 col-md-6 col-sm-10 col-xs-12">
             <PieChart2 />
             </div>

             </div> -->
        <div class="q-my-md"></div>
        <q-separator></q-separator>
        <div class="q-py-md">
            <q-list bordered class="rounded-borders">
                <!-- <q-expansion-item
                    expand-separator
                    icon="memory"
                    label="内存预警设置"
                >
                    <q-card>
                        <q-card-section>
                            预警值设置:
                            <span class="text-bold q-mx-sm">32</span>
                            <span class="text-info">GB</span>
                        </q-card-section>
                        <q-card-section>
                            预警邮箱:
                            <span class="text-info q-mx-sm">admin@bio.com</span>
                        </q-card-section>
                        <q-card-section>
                            <q-btn
                                icon="edit"
                                size="sm"
                                color="primary"
                            ></q-btn>
                        </q-card-section>
                    </q-card>
                </q-expansion-item> -->

                <q-expansion-item expand-separator default-opened icon="auto_mode" :label="$t('ServerResourceSetting')">
                    <q-card>
                        <q-card-section row>
                            <div class="row">
                                <div class="col-5">
                                    <q-form ref="form" @submit="submit">
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="max_task.value"
                                                :rules="[(val) => (val !== null && val > 0 && val%1 === 0) || $t('InvalidValue')]"
                                            >
                                                <template v-slot:before>
                                                    <span class="text-bold" style="font-size: 16px"
                                                        >{{$t('ParallelTaskLimit')}}:</span
                                                    >
                                                </template>
                                                <template v-slot:after>
                                                    <q-icon name="help_outline">
                                                        <q-tooltip>{{ $t('TaskSettingTip') }}</q-tooltip>
                                                    </q-icon>
                                                </template>
                                            </q-input>
                                        </q-form-item>
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="memory_rate.value"
                                                :rules="[(val) => (val !== null && val > 0 && val <=1) || $t('InvalidValue')]"
                                            >
                                                <template v-slot:before>
                                                    <span class="text-bold" style="font-size: 16px"
                                                        >{{$t('MemoryUsageLimit')}}:</span
                                                    >
                                                </template>
                                                <template v-slot:after>
                                                    <q-icon name="help_outline">
                                                        <q-tooltip>{{ $t('MemorySettingTip') }}</q-tooltip>
                                                    </q-icon>
                                                </template>
                                            </q-input>
                                        </q-form-item>
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="disk.value"
                                                :rules="[(val) => (val !== null && val > 0) || $t('InvalidValue')]"
                                            >
                                                <template v-slot:before>
                                                    <span class="text-bold" style="font-size: 16px"
                                                        >{{$t('DiskUsageLimit')}}:</span
                                                    >
                                                </template>
                                                <template v-slot:after>
                                                    <q-icon name="help_outline">
                                                        <q-tooltip>{{ $t('DiskSettingTip') }}</q-tooltip>
                                                    </q-icon>
                                                </template>
                                            </q-input>
                                        </q-form-item>
                                        <q-form-item v-if="amISuper()">
                                            <div class="row">
                                                <q-input
                                                    type="number"
                                                    class="col-10"
                                                    v-model.number="allowedRunningDays.value"
                                                    :rules="[(val) => (val !== null && val > 0) || $t('InvalidValue')]"
                                                >
                                                    <template v-slot:before>
                                                        <span class="text-bold" style="font-size: 16px"
                                                            >{{$t('AllowedRunningTime')}}:</span
                                                        >
                                                    </template>
                                                    <template v-slot:after>
                                                        <span class="q-ml-sm text-grey" style="font-size: 14px"
                                                            >{{$t('AlreadyRun')}}:
                                                            {{allowedRunningDays.used + $t('Days')}}
                                                        </span>
                                                    </template>
                                                </q-input>
                                            </div>
                                        </q-form-item>
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="max_manager_user.value"
                                                :rules="[(val) => (val !== null && val > 0 && val%1 === 0) || $t('InvalidValue')]"
                                            >
                                                <template v-slot:before>
                                                    <span class="text-bold" style="font-size: 16px"
                                                        >{{$t('ParallelManagerUser')}}:</span
                                                    >
                                                </template>
                                            </q-input>
                                        </q-form-item>
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="max_normal_user.value"
                                                :rules="[(val) => (val !== null && val > 0 && val%1 === 0) || $t('InvalidValue')]"
                                            >
                                                <template v-slot:before>
                                                    <span class="text-bold" style="font-size: 16px"
                                                        >{{$t('ParallelNormalUser')}}:</span
                                                    >
                                                </template>
                                            </q-input>
                                        </q-form-item>
                                    </q-form>
                                </div>
                            </div>
                        </q-card-section>
                        <q-card-actions>
                            <q-btn
                                class="q-ml-lg"
                                color="primary"
                                type="submit"
                                icon="save_as"
                                :label="$t('Confirm')"
                                @click="submit"
                            />
                        </q-card-actions>
                    </q-card>
                </q-expansion-item>
            </q-list>
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import PieChart from "./charts/PieChart.vue";
import PieChart2 from "./charts/PieChart2.vue";
import LineChart2 from "./charts/LineChart2.vue";
import PieChart3 from "./charts/PieChart3.vue";
import LineChart from "./charts/LineChart.vue";
import {ref, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import {createConfig, listConfig, updateConfig} from 'src/api/config'
import { amISuper } from 'src/utils/user'

const form = ref(null)
const max_task = ref({})
const max_manager_user = ref({
    id:0,
    name:"max_manager_user",
    value: 1,
    used:1,
})
const max_normal_user = ref({
    id:0,
    name:"max_normal_user",
    value: 10,
    used:10,
})
const memory_rate = ref({})
const disk = ref({})
const allowedRunningDays = ref({})

const $q = useQuasar()

onMounted(() => {
    refresh()
})

const submit = () => {
    updateConfig(max_task.value)
    updateConfig(memory_rate.value)
    updateConfig(max_manager_user.value)
    updateConfig(max_normal_user.value)
    if (amISuper()) {
        updateConfig(allowedRunningDays.value)
    }
    updateConfig(disk.value).then(res => {
        $q.notify({
            message: t('Success'),
            type: 'positive'
        })
    })
}

const refresh = () => {
    listConfig().then(res => {
        for (let cfg of res.results) {
            if (cfg.name === 'max_task') {
                max_task.value = cfg
            }
            if (cfg.name === 'memory_rate') {
                memory_rate.value = cfg
            }
            if (cfg.name === 'disk') {
                disk.value = cfg
            }
            if (cfg.name === 'max_manager_user') {
                max_manager_user.value = cfg
            }
            if (cfg.name === 'max_normal_user') {
                max_normal_user.value = cfg
            }
            if (cfg.name === 'allowed_running_days') {
                allowedRunningDays.value = cfg
            }
        }
    })
}
</script>
