<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="突变注释" />
        <div class="q-py-md">
            <div class="text-h6">功能介绍:</div>
            <div class="text-body">功能介绍功能介绍功能介绍功能介绍功能介绍功能介绍</div>
        </div>
        <q-card class="q-pa-sm">
            <div class="row">
                <div class="col">
                    <q-input v-model="text" label="输入突变进行搜索:">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
            </div>
            <div class="q-pt-md">
                <div class="text-h6">突变:</div>
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
            </div>
            <div class="q-pt-md">
                <div class="text-h6">突变种类:</div>
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
            </div>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref } from "vue";
</script>
