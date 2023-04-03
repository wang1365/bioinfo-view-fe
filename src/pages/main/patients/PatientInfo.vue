<template>
    <q-card>
        <q-separator></q-separator>
        <q-card-section>
            <div class="text-subtitle1 text-bold">患者信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">姓名: {{ patient.name }}</div>
                <div class="col q-pa-sm">性别: {{ patient.gender }}</div>
                <div class="col q-pa-sm">年龄: {{ patient.age }}</div>
                <div class="col q-pa-sm">出生日期: {{ patient.birthday }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">身份证: {{ patient.id_card }}</div>
                <div class="col q-pa-sm">家庭地址: {{ patient.location }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">患者识别号: {{ patient.identifier }}</div>
                <div class="col q-pa-sm">送检机构: {{ patient.inspection_agency }}</div>
                <div class="col q-pa-sm">诊疗医生: {{ patient.medical_doctor }}</div>
            </div>
            <div class="text-subtitle1 text-bold">临床信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">临床诊断: {{ patient.diagnosis }}</div>
                <div class="col q-pa-sm">肿瘤分期: {{ patient.tumor_stage }}</div>
                <div class="col q-pa-sm">遗传病: {{ patient.disease }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">家族史: {{ patient.family_history }}</div>
                <div class="col q-pa-sm">用药史: {{ patient.medication_history }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">吸烟: {{ patient.smoking }}</div>
                <div class="col q-pa-sm">饮酒: {{ patient.drinking }}</div>
                <div class="col q-pa-sm">病毒感染: {{ patient.viral_infection }}</div>
            </div>
            <div class="text-subtitle1 text-bold">其他信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">治疗史: {{ patient.treatment_history }}</div>
                <div class="col q-pa-sm">预后信息: {{ patient.prognosis }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col q-pa-sm">预后时间(天): {{ patient.prognosis_time }}</div>
                <div class="col q-pa-sm">复发时间(天): {{ patient.recurrence_time }}</div>
                <div class="col q-pa-sm">存活时间(天): {{ patient.survival_time }}</div>
            </div>
        </q-card-section>
        <q-card-section>
            <div class="text-subtitle1 text-bold">患者的样本</div>
            <q-separator></q-separator>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>采样日期</td>
                            <td>送测日期</td>
                            <td>采样部位</td>
                            <td>样本类型</td>
                            <td>肿瘤含量</td>
                            <td>肿瘤样本</td>
                            <td>样本识别号</td>
                            <td>{{$t('Action')}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="hover" v-for="item in patient.samplemeta_set" v-bind:key="item.name">
                            <td>
                                {{ item.id }}
                            </td>
                            <td>
                                {{ item.sample_date }}
                            </td>
                            <td>
                                {{ item.test_date }}
                            </td>
                            <td>{{ item.sample_componet }}</td>
                            <td>
                                {{ item.sample_type }}
                            </td>
                            <td>
                                {{ item.panel_proportion }}
                            </td>
                            <td>{{ item.is_panel }}</td>
                            <td>{{ item.identifier }}</td>
                            <!-- <td>{{ item.user_id }}</td> -->
                            <!-- <td>{{ item.create_time }}</td>
                            <td>{{ item.modify_time }}</td> -->
                            <td class="q-gutter-x-sm"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { useApi } from "src/api/apiBase";
import { onMounted, ref } from "vue";

const { apiGet,apiGetById } = useApi();

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});
const patient = ref({
    name: "",
    gender: "",
    age: "",
    birthday: "",
    id_card: "",
    location: "",
    identifier: "",
    inspection_agency: "",
    medical_doctor: "",
    diagnosis: "",
    tumor_stage: "",
    disease: "",
    family_history: "",
    medication_history: "",
    treatment_history: "",
    prognosis_time: "",
    recurrence_time: "",
    survival_time: "",
});
onMounted(() => {
    apiGetById('patient',props.id,(res)=>{
        patient.value = res.data.results[0];
    })
    // apiGet(`/patient/patients/${props.id}`, (res) => {
    //     patient.value = res.data;
    // });
});
</script>
