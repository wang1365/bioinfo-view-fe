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
                <q-expansion-item
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
                </q-expansion-item>

                <q-expansion-item
                    expand-separator
                    icon="auto_mode"
                    label="最大并行任务数设置"
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
                </q-expansion-item>
                <q-expansion-item
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
</script>
