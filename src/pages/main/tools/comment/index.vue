<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="数据库注释" />
        <div class="q-py-md">
            <div class="text-h6">功能介绍:</div>
            <div class="text-body">功能介绍功能介绍功能介绍功能介绍功能介绍功能介绍</div>
        </div>
        <q-card class="q-pa-sm">


            <div class="row">
                <div class="col-2"></div>
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div class="row">
                        <div class="col-2">
                            <q-select v-model="database" :options="options" stack-label :display-value="`检索方式: ${database ? database : '*none*'
                            }`">
                            </q-select>
                        </div>
                        <div class="col-10">
                            <q-input v-model="text" label="输入文本: 回车查询">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </div>
                    </div>
                </div>
                <div class="col-2"></div>
            </div>
            <div class="q-pt-md">
                <div class="text-h6">基因注释信息:</div>
                <div class="text-body">基因注释信息基因注释信息基因注释信息基因注释信息基因注释信息基因注释信息</div>
            </div>
            <div class="q-pt-md">
                <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
                    :breakpoint="0">
                    <q-tab name="突变" label="突变" />
                    <q-tab name="突变类型" label="突变类型" />
                    <q-tab name="分子特征" label="分子特征" />
                    <q-tab name="支持证据" label="支持证据" />
                    <q-tab name="相关临床试验" label="相关临床试验" />
                </q-tabs>
                <q-tab-panels v-model="tab" animated>
                    <q-tab-panel name="突变">
                        <div class="text-body bio-data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <td>突变</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>突变</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                    <tr>
                                        <td>突变</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                    <tr>
                                        <td>突变</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </q-tab-panel>

                    <q-tab-panel name="突变类型">
                        <div class="text-body bio-data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <td>突变种类</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>突变种类</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                    <tr>
                                        <td>突变种类</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                    <tr>
                                        <td>突变种类</td>
                                        <td>突变类型</td>
                                        <td>蛋白质影响</td>
                                        <td>突变描述</td>
                                        <td>耐药性关联</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </q-tab-panel>

                    <q-tab-panel name="分子特征">
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
                    </q-tab-panel>
                    <q-tab-panel name="支持证据">
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
                    </q-tab-panel>
                    <q-tab-panel name="相关临床试验">
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
                    </q-tab-panel>
                </q-tab-panels>
            </div>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref } from "vue";
const options = ref(["基因", "突变", "药物"]);
const database = ref("基因");
const tab=ref("突变")
</script>
