<template>
    <div>
        <div class="row ">
            <div class="col">
                <q-input v-model="text" label="输入基因进行搜索:">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
        </div>
    </div>
    <div class="q-py-md">
        <div class="row q-gutter-sm">
            <div class="col">
                <div class="text-center text-bold" style="position:relative">对照样本
                    <q-icon name="download" style="position:absolute;right:10px;bottom: 5px;cursor:pointer;"></q-icon>
                </div>
                <q-separator></q-separator>
                <div class="bio-data-table">
                    <table>
                        <thead>
                            <tr>
                                <td>基因</td>
                                <td>
                                    <div class="relative-position container cursor-pointer " v-ripple>
                                        深度平均值
                                        <q-icon name="expand_more" />
                                    </div>

                                </td>
                                <td>
                                    <div class="relative-position container cursor-pointer " v-ripple>
                                        深度中位值
                                        <q-icon name="expand_less" />
                                    </div>
                                </td>
                                <td>
                                    <div class="relative-position container cursor-pointer " v-ripple>
                                        基因覆盖度
                                        <q-icon name="expand_less" />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>基因</td>
                                <td>深度平均值</td>
                                <td>深度中位值</td>
                                <td>基因覆盖度</td>
                            </tr>
                            <tr>
                                <td>基因</td>
                                <td>深度平均值</td>
                                <td>深度中位值</td>
                                <td>基因覆盖度</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col">
                <div class="text-center text-bold" style="position:relative">肿瘤样本
                    <q-icon name="download" style="position:absolute;right:10px;bottom: 5px;cursor:pointer"></q-icon>
                </div>
                <q-separator></q-separator>
                <div class="bio-data-table">
                    <table>
                        <thead>
                            <tr>
                                <td>基因</td>
                                <td>
                                    <div class="relative-position container cursor-pointer" v-ripple>
                                        深度平均值
                                        <q-icon name="expand_more" />
                                    </div>

                                </td>
                                <td>
                                    <div class="relative-position container cursor-pointer" v-ripple>
                                        深度中位值
                                        <q-icon name="expand_less" />
                                    </div>
                                </td>
                                <td>
                                    <div class="relative-position container cursor-pointer" v-ripple>
                                        基因覆盖度
                                        <q-icon name="expand_less" />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>基因</td>
                                <td>深度平均值</td>
                                <td>深度中位值</td>
                                <td>基因覆盖度</td>
                            </tr>
                            <tr>
                                <td>基因</td>
                                <td>深度平均值</td>
                                <td>深度中位值</td>
                                <td>基因覆盖度</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

</template>
<script setup>
import { ref, onMounted } from "vue";
</script>