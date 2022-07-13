<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="平台监控" />

        <div
            class="q-pa-md row items-start q-gutter-md"
            style="justify-content: space-around"
        >
            <q-card class="my-card">
                <q-card-section class="text-primary text-h5 text-bold">
                    15 T
                </q-card-section>

                <q-card-section class="desc"> 本周磁盘空间使用 </q-card-section>
            </q-card>
            <q-card class="my-card">
                <q-card-section class="text-secondary text-h5 text-bold">
                    <span class="text-primary">100</span> / 105
                </q-card-section>
                <q-card-section class="desc">
                    本周任务数(成功/总数)
                </q-card-section>
            </q-card>
            <q-card class="my-card">
                <q-card-section class="text-primary text-h5 text-bold">
                    <span>100</span> /
                    <span class="text-secondary">1.5T</span>
                </q-card-section>
                <q-card-section class="desc">
                    本周新增样本数(数量/大小)</q-card-section
                >
            </q-card>
            <q-card class="my-card">
                <q-card-section class="text-secondary text-h5 text-bold">
                    100 份
                </q-card-section>
                <q-card-section class="desc"> 本周新增报告数量</q-card-section>
            </q-card>
        </div>
        <q-separator />
        <q-card class="my-card" flat bordered>
            <q-card-section style="padding: 0">
                <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
                    <!-- <div class="col-lg-4 col-md-12 col-sm-12 col-xs-12">
                        <q-card class="my-card" flat>
                            <q-card-section style="padding: 0">
                                <div>
                                    <LineChart2 />
                                </div>
                            </q-card-section>
                            <q-card-section style="padding: 0">
                                <div>
                                    <UserTable />
                                </div>
                            </q-card-section>
                        </q-card>
                    </div> -->
                    <div class="col-lg-4 col-md-12 col-sm-12 col-xs-12">
                        <div
                            class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm"
                        >
                            <div
                                class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                            >
                                <LineChart2 />
                            </div>
                            <div
                                class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                            >
                                <UserTable />
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-8 col-md-12 col-sm-12 col-xs-12">
                        <div
                            class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm"
                        >
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <PieChart />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <PieChart2 />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <LineChart />
                            </div>
                            <div
                                class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                            >
                                <PageTitle title="任务概览" />
                                <div
                                    style="
                                        height: 300px;
                                        display: flex;
                                        justify-content: space-around;
                                        justify-items: center;
                                        align-items: center;
                                    "
                                >
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-primary text-h5 text-bold"
                                        >
                                            15
                                        </q-card-section>

                                        <q-card-section class="desc">
                                            正在运行
                                        </q-card-section>
                                    </q-card>
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-negative text-h5 text-bold"
                                        >
                                            3
                                        </q-card-section>
                                        <q-card-section class="desc">
                                            失败任务
                                        </q-card-section>
                                    </q-card>
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-secondary text-h5 text-bold"
                                        >
                                            5
                                        </q-card-section>
                                        <q-card-section class="desc">
                                            排队任务</q-card-section
                                        >
                                    </q-card>
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-warning text-h5 text-bold"
                                        >
                                            30
                                        </q-card-section>
                                        <q-card-section class="desc">
                                            允许最大<br />任务数</q-card-section
                                        >
                                    </q-card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>
        <q-separator />
        <q-card class="my-card" flat>
            <q-card-section style="padding: 0"> </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import PieChart from "./charts/PieChart.vue";
import PieChart2 from "./charts/PieChart2.vue";
import LineChart2 from "./charts/LineChart2.vue";
import LineChart from "./charts/LineChart.vue";
import PageTitle from "src/components/page-title/PageTitle.vue";
import UserTable from "./userTable.vue";
</script>

<style lang="scss">
.title {
    position: sticky;
    top: -80;
    left: 0;
    font-size: 1.5em;
}
.my-card {
    text-align: center;
    .title {
        font-size: 1.5em;
        font-weight: bold;
    }
    .desc {
        color: gray;
    }
}

.counter {
    display: flex;
}
</style>
