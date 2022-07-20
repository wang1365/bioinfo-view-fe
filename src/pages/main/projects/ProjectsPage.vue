<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="项目管理" />
        <q-card class="my-card" flat bordered>
            <q-card-section style="padding: 0"> </q-card-section>
        </q-card>
        <div class="row q-pt-md">
            <div class="col-2 flex item-center q-pa-sm">
                <q-btn color="primary" label="新建" icon="folder" />

            </div>
            <div class="col-10 q-pa-sm">
                <q-input dense v-model="text" label="输入文本: 回车查询">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>

            </div>

        </div>
        <div class="q-pa-md">

            <table>
                <thead>
                    <tr class="text-h6">
                        <td class="q-pa-md text-center">
                            <q-checkbox v-model="selected" color="negative" />
                        </td>
                        <td class="text-center">样本名称</td>
                        <td>样本信息</td>
                        <td>胚系突变分析</td>
                        <td>体细胞突变分析</td>
                        <td>融合分析</td>
                        <td>拷贝数变异分析</td>
                        <td>HRD</td>
                        <td>报告下载</td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="bg-grey-1 hover" v-for="item in data" v-bind:key="item.name">
                        <td class="q-pa-md text-center">
                            <q-checkbox v-model="item.selected" color="negative" />
                        </td>
                        <td>
                            <div class="text-left">
                                <span class="text-h6">

                                    {{item.name}}
                                </span>

                            </div>
                            <div class="row q-gutter-xs q-mt-sm">
                                <q-btn size="sm" color="primary" label="LungCancer Panel v1.0" />
                                <q-btn size="sm" color="accent" label="Tumor" />
                                <q-btn size="sm" color="teal" label="FFPE" />
                                <q-btn size="sm" color="warning" label="No UMI" />
                            </div>
                        </td>
                        <td class="text-center">
                            <q-icon name="touch_app" color="primary" size="md" />
                        </td>
                        <td class="text-center"> 已完成</td>
                        <td class="text-center">不可分析</td>
                        <td class="text-center">可分析</td>
                        <td class="text-center">不可分析</td>
                        <td class="text-center">可分析</td>
                        <td class="text-center q-gutter-sm">
                            <q-icon name="cloud_download" color="primary" size="md" />
                            <q-icon name="cloud_download" color="grey-5" size="md" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="q-pa-md text-right">

            <q-pagination class="float-right" :model-value="current" color="purple" :max="10" :max-pages="6" boundary-numbers />
            </div>
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
 import { ref } from "vue";
 const current = ref(5)
const selected = ref([]);

const data = ref([

    {
        name: 'Jelly bean',
        info: 375,
        fat: 0.0,
        carbs: 94,
        protein: 0.0,
        sodium: 50,
        calcium: '0%',
        iron: '0%'
    },
    {
        name: 'Lollipop',
        info: 392,
        fat: 0.2,
        carbs: 98,
        protein: 0,
        sodium: 38,
        calcium: '0%',
        iron: '2%'
    },
    {
        name: 'Honeycomb',
        info: 408,
        fat: 3.2,
        carbs: 87,
        protein: 6.5,
        sodium: 562,
        calcium: '0%',
        iron: '45%'
    },
    {
        name: 'Donut',
        info: 452,
        fat: 25.0,
        carbs: 51,
        protein: 4.9,
        sodium: 326,
        calcium: '2%',
        iron: '22%'
    },
    {
        name: 'KitKat',
        info: 518,
        fat: 26.0,
        carbs: 65,
        protein: 7,
        sodium: 54,
        calcium: '12%',
        iron: '6%'
    }
])
const getSelectedString=()=> {
    return selected.value.length === 0 ? '' : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${data.value.length}`
}
</script>

<style lang="scss">
 table{
     width:100%;
     tbody{
         tr{

             &:nth-child(odd){
                 td{

             background-color:rgba(0,0,0,0.05);
                 }
             }
              &:nth-child(even){
                 td{

             background-color:rgba(0,0,0,0.08);
                 }
                         }
                         }

                         td {
                             padding: 10px;
                         }
     tr{
         &:hover{
             td{
                 background-color:rgba(0,0,0,0.15);
             }
         }
     }
     }
 }
</style>
