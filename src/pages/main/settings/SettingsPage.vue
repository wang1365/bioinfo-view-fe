<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="系统设置" />
        <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm justify-center">
            <div class="col-lg-6 col-md-6 col-sm-10 col-xs-12">
                <PieChart3 />
            </div>
            <div class="col-lg-6 col-md-6 col-sm-10 col-xs-12">
                <PieChart2 />
            </div>
            <!-- <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12">
                <PieChart />
            </div> -->
        </div>
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
                                    <q-input type="number" v-model.number="max_task.value">
                                        <template v-slot:before><span class="text-h6">并行任务限制:</span></template>
                                    </q-input>
                                    <q-input type="number" v-model.number="memory_rate.value">
                                        <template v-slot:before
                                            ><span class="text-h6">内存率使用限制(%):</span></template
                                        >
                                    </q-input>
                                    <q-input type="number" v-model.number="disk.value">
                                        <template v-slot:before
                                            ><span class="text-h6">磁盘使用限制(MB):</span></template
                                        >
                                    </q-input>
                                </div>
                            </div>
                        </q-card-section>
                        <q-card-actions>
                            <q-btn class="q-ml-lg" color="primary" label="确 定" @click="clickSave" />
                        </q-card-actions>
                    </q-card>
                </q-expansion-item>
                <!-- <q-expansion-item
                    expand-separator
                    icon="running_with_errors"
                    label="用户磁盘空间限制"
                >
                    <q-card>
                        <q-card-section>
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit. Quidem, eius reprehenderit eos corrupti
                            commodi magni quaerat ex numquam, dolorum officiis
                            modi facere maiores architecto suscipit iste eveniet
                            doloribus ullam aliquid.
                        </q-card-section>
                    </q-card>
                </q-expansion-item> -->
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { listConfig, updateConfig } from 'src/api/config'

const max_task = ref({})
const memory_rate = ref({})
const disk = ref({})

const $q = useQuasar()

onMounted(() => {
    refresh()
})

const clickSave = () => {
    updateConfig(max_task.value)
    updateConfig(memory_rate.value)
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
        }
    })
}
</script>
