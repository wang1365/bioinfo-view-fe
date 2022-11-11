<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明</q-btn
    >
    <div class="q-py-md">
        微卫星不稳定结果介绍微卫星不稳定结果介绍微卫星不稳定结果介绍微卫星不稳定结果介绍微卫星不稳定结果介绍
    </div>

    <div class="q-py-md">
        <div class="text-h6">总体微卫星状态表</div>
        <div class="bio-data-table">
            <table>
                <thead>
                    <tr>
                        <td>Total_Number_of_Sites</td>
                        <td>Number_of_Somatic_Sites</td>
                        <td>%</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1929</td>
                        <td>635</td>
                        <td>32.92</td>
                    </tr>
                    <tr>
                        <td>1929</td>
                        <td>635</td>
                        <td>32.92</td>
                    </tr>
                    <tr>
                        <td>1929</td>
                        <td>635</td>
                        <td>32.92</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="q-py-md">
        <div class="text-h6">金标微卫星图</div>
        <div class="bio-data-table">
            <table>
                <thead>
                    <tr>
                        <td>CHROM</td>
                        <td>POSITION</td>
                        <td>NAME</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>chr2</td>
                        <td>47641579</td>
                        <td class="cursor-pointer" @click="openImage()">BAT-26</td>
                    </tr>
                    <tr>
                        <td>chr2</td>
                        <td>47641579</td>
                        <td class="cursor-pointer" @click="openImage()">BAT-26</td>
                    </tr>
                    <tr>
                        <td>chr2</td>
                        <td>47641579</td>
                        <td class="cursor-pointer" @click="openImage()">BAT-26</td>
                    </tr>
                    <tr>
                        <td>chr2</td>
                        <td>47641579</td>
                        <td class="cursor-pointer" @click="openImage()">BAT-26</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <q-dialog v-model="showImage">
        <img src="" alt="" style="width:500px;height:400px;background-color:white" />
    </q-dialog>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">质控解读</q-bar>
            <q-card-section>
                <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">关闭</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
const showImage = ref('false')
const openImage = () => {
    showImage.value = true
}

const props = defineProps({
    intro: {
        type: String,
        required: false
    }
})
</script>
