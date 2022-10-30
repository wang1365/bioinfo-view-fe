<template>
    <div class="q-py-sm">
        <div class="text-bold">肿瘤样本的中靶率：XX%，对照样本中靶率：XX%</div>
    </div>
    <q-separator></q-separator>
    <div class="q-py-sm">
        <table style="width:100%">
            <thead>
                <tr class="text-bold">
                    <td colspan="2" class="text-center">质量参数</td>
                    <td class="text-center">肿瘤数值</td>
                    <td class="text-center">对照数值</td>
                    <td class="text-center">质控标准</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-bold">病理评估</td>
                    <td class="text-center">恶性肿瘤细胞占比(%)</td>
                    <td class="text-center">40.0</td>
                    <td class="text-center">0.0</td>
                    <td class="text-center">>20</td>
                </tr>
                <tr>
                    <td class="text-bold"></td>
                    <td class="text-center">恶性肿瘤细胞占比(%)</td>
                    <td class="text-center">40.0</td>
                    <td class="text-center">0.0</td>
                    <td class="text-center">>20</td>
                </tr>
                <tr>
                    <td class="text-bold"></td>
                    <td class="text-center">恶性肿瘤细胞占比(%)</td>
                    <td class="text-center">40.0</td>
                    <td class="text-center">0.0</td>
                    <td class="text-center">>20</td>
                </tr>

                <tr>
                    <td class="text-bold">DNA质量评估</td>
                    <td class="text-center">DNA片段降解程度</td>
                    <td class="text-center">A</td>
                    <td class="text-center">A</td>
                    <td class="text-center">A/B/C/D</td>
                </tr>
                <tr>
                    <td class="text-bold"></td>
                    <td class="text-center">DNA片段降解程度</td>
                    <td class="text-center">A</td>
                    <td class="text-center">A</td>
                    <td class="text-center">A/B/C/D</td>
                </tr>
                <tr>
                    <td class="text-bold"></td>
                    <td class="text-center">DNA片段降解程度</td>
                    <td class="text-center">A</td>
                    <td class="text-center">A</td>
                    <td class="text-center">A/B/C/D</td>
                </tr>

            </tbody>
        </table>
    </div>


</template>
<script setup>
import { ref, onMounted } from "vue";
</script>
<style lang="scss">
table {
    tr {
        line-height: 22px;
    }
}
</style>