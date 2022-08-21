<template>
    <q-card style="width: 70vw; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>患者详情</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
            <div class="text-subtitle1 text-bold">患者信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col">姓名: {{ patient.name }}</div>
                <div class="col">性别: {{ patient.gender }}</div>
                <div class="col">年龄: {{ patient.age }}</div>
                <div class="col">出生日期: {{ patient.birthday }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">身份证: {{ patient.id_card }}</div>
                <div class="col">家庭地址: {{ patient.location }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">患者识别号: {{ patient.identifier }}</div>
                <div class="col">送检机构: {{ patient.inspection_agency }}</div>
                <div class="col">诊疗医生: {{ patient.medical_doctor }}</div>
            </div>
            <div class="text-subtitle1 text-bold">临床信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col">临床诊断: {{ patient.diagnosis }}</div>
                <div class="col">肿瘤分期: {{ patient.tumor_stage }}</div>
                <div class="col">遗传病: {{ patient.disease }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">家族史: {{ patient.family_history }}</div>
                <div class="col">用药史: {{ patient.medication_history }}</div>
            </div>
            <div class="text-subtitle1 text-bold">其他信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col">治疗史: {{ patient.treatment_history }}</div>
                <div class="col">预后时间: {{ patient.prognosis_time }}</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">复发时间: {{ patient.recurrence_time }}</div>
                <div class="col">存活时间: {{ patient.survival_time }}</div>
            </div>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-list>
                <q-item>
                    <q-section class="q-gutter-x-sm">
                        <q-btn color="primary" label="关闭" v-close-popup />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
    </q-card>
</template>

<script setup>
import { api, getTokenCookie } from "src/boot/axios";
import { onMounted, ref } from "vue";
const emit = defineEmits(["refresh"]);

const close = () => {
    emit("refresh");
};
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
    console.log(props.id);
    api.get(`/patient/patients/${props.id}`, {
        headers: { Authorization: getTokenCookie() },
    }).then((resp) => {
        let data = resp.data;
        console.log(data);
        patient.value = data;
    });
});
</script>
