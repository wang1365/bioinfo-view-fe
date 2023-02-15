<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="系统设置" />
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

                <q-expansion-item expand-separator default-opened icon="auto_mode" label="服务器资源设置">
                    <q-card>
                        <q-card-section row>
                            <div class="row">
                                <div class="col-5">
                                    <q-form ref="form" @submit="submit">
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="max_task.value"
                                                :rules="[(val) => (val !== null && val > 0 && val%1 === 0) || '任务数数值错误，必须是正整数']"
                                            >
                                                <template v-slot:before
                                                    ><span class="text-h6">并行任务限制(>1):</span></template
                                                >
                                            </q-input>
                                        </q-form-item>
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="memory_rate.value"
                                                :rules="[(val) => (val !== null && val > 0 && val <=1) || '内存使用率数值错误']"
                                            >
                                                <template v-slot:before
                                                    ><span class="text-h6">内存率使用限制(0-1):</span></template
                                                >
                                            </q-input>
                                        </q-form-item>
                                        <q-form-item>
                                            <q-input
                                                type="number"
                                                v-model.number="disk.value"
                                                :rules="[(val) => (val !== null && val > 0) || '磁盘限制数值错误']"
                                            >
                                                <template v-slot:before
                                                    ><span class="text-h6">磁盘使用限制(MB):</span></template
                                                >
                                            </q-input>
                                        </q-form-item>
                                        <q-form-item v-if="amISuper()">
                                            <div class="row">
                                                <q-input
                                                    type="number" class="col-9"
                                                    v-model.number="allowedRunningDays.value"
                                                    :rules="[(val) => (val !== null && val > 0) || '允许运行时间数值错误']"
                                                >
                                                    <template v-slot:before
                                                    ><span class="text-h6">允许运行时间(天):</span></template
                                                    >
                                                </q-input>
                                                <div class="text-h6 q-pt-sm q-ml-sm text-grey">已运行 {{allowedRunningDays.used}} 天</div>
                                            </div>
                                        </q-form-item>
                                    </q-form>
                                </div>
                            </div>
                        </q-card-section>
                        <q-card-actions>
                            <q-btn class="q-ml-lg" color="primary" type="submit" label="确 定" @click="submit" />
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
    if (amISuper()) {
        updateConfig(allowedRunningDays.value)
    }
    updateConfig(disk.value).then(res => {
        $q.notify({
            message: '设置成功',
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
            if (cfg.name === 'allowed_running_days') {
                allowedRunningDays.value = cfg
            }
        }
    })
}
</script>
