<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="药物注释" />
        <div class="q-py-md">
            <div class="text-h6">功能介绍:</div>
            <div class="text-body">功能介绍功能介绍功能介绍功能介绍功能介绍功能介绍</div>
        </div>
        <q-card class="q-pa-sm">
            <div class="row">
                <div class="col">
                    <q-input v-model="text" label="输入药物进行搜索:">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
            </div>
            <div class="q-pt-md">
                <div class="text-h6">分子特征:</div>
                <div class="text-body bio-data-table">
                    <table>
                        <thead>
                            <tr>
                                <td>分子突变</td>
                                <td>蛋白质影响</td>
                                <td>治疗方法</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>分子突变</td>
                                <td>蛋白质影响</td>
                                <td>治疗方法</td>
                            </tr>
                            <tr>
                                <td>分子突变</td>
                                <td>蛋白质影响</td>
                                <td>治疗方法</td>
                            </tr>
                            <tr>
                                <td>分子突变</td>
                                <td>蛋白质影响</td>
                                <td>治疗方法</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="q-pt-md">
                <div class="text-h6">支持证据:</div>
                <div class="text-body bio-data-table">
                    <table>
                        <thead>
                            <tr>
                                <td>分子突变</td>
                                <td>疾病</td>
                                <td>治疗效应</td>
                                <td>治疗方法</td>
                                <td>申请状态</td>
                                <td>证据类型</td>
                                <td>有效性证据</td>
                                <td>证据等级</td>
                                <td>用药Tier</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>分子突变</td>
                                <td>疾病</td>
                                <td>治疗效应</td>
                                <td>治疗方法</td>
                                <td>申请状态</td>
                                <td>证据类型</td>
                                <td>有效性证据</td>
                                <td>证据等级</td>
                                <td>用药Tier</td>
                            </tr>
                            <tr>
                                <td>分子突变</td>
                                <td>疾病</td>
                                <td>治疗效应</td>
                                <td>治疗方法</td>
                                <td>申请状态</td>
                                <td>证据类型</td>
                                <td>有效性证据</td>
                                <td>证据等级</td>
                                <td>用药Tier</td>
                            </tr>
                            <tr>
                                <td>分子突变</td>
                                <td>疾病</td>
                                <td>治疗效应</td>
                                <td>治疗方法</td>
                                <td>申请状态</td>
                                <td>证据类型</td>
                                <td>有效性证据</td>
                                <td>证据等级</td>
                                <td>用药Tier</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="q-pt-md">
                <div class="text-h6">临床试验信息:</div>
                <div class="text-body bio-data-table">
                    <table>
                        <thead>
                            <tr>
                                <td>临床试验编号</td>
                                <td>试验阶段</td>
                                <td>治疗手段</td>
                                <td>试验名称</td>
                                <td>招募状态</td>
                                <td>覆盖国家</td>
                                <td>其他国家</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>临床试验编号</td>
                                <td>试验阶段</td>
                                <td>治疗手段</td>
                                <td>试验名称</td>
                                <td>招募状态</td>
                                <td>覆盖国家</td>
                                <td>其他国家</td>
                            </tr>
                            <tr>
                                <td>临床试验编号</td>
                                <td>试验阶段</td>
                                <td>治疗手段</td>
                                <td>试验名称</td>
                                <td>招募状态</td>
                                <td>覆盖国家</td>
                                <td>其他国家</td>
                            </tr>
                            <tr>
                                <td>临床试验编号</td>
                                <td>试验阶段</td>
                                <td>治疗手段</td>
                                <td>试验名称</td>
                                <td>招募状态</td>
                                <td>覆盖国家</td>
                                <td>其他国家</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref } from "vue";
</script>
