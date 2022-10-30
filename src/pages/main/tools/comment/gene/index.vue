<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="基因注释" />
        <div class="q-py-md">
            <div class="text-h6">功能介绍:</div>
            <div class="text-body">功能介绍功能介绍功能介绍功能介绍功能介绍功能介绍</div>
        </div>
        <q-card class="q-pa-sm">


            <div class="row ">
                <div class="col">
                    <q-input v-model="text" label="输入基因进行搜索:">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
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
                        <div class="text-h6">突变</div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </q-tab-panel>

                    <q-tab-panel name="突变类型">
                        <div class="text-h6">突变类型</div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </q-tab-panel>

                    <q-tab-panel name="分子特征">
                        <div class="text-h6">分子特征</div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </q-tab-panel>
                    <q-tab-panel name="支持证据">
                        <div class="text-h6">支持证据</div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </q-tab-panel>
                    <q-tab-panel name="相关临床试验">
                        <div class="text-h6">相关临床试验</div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </q-tab-panel>
                </q-tab-panels>
            </div>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref } from "vue";
const tab = ref("突变")
</script>
