<template>
    <q-card style="width: 700px; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>患者详情</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
            <div class="text-subtitle1 text-bold">患者信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col">姓名: XXX</div>
                <div class="col">性别: 男</div>
                <div class="col">年龄: 30</div>
                <div class="col">出生日期: YYYY-MM-DD</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">身份证: XXXXXXXXXXXXXXXXXXXXXX</div>
                <div class="col">家庭地址: ***********</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">患者识别号: XXXXXXXXXXXXXXX</div>
                <div class="col">送检机构: AAAAAA</div>
                <div class="col">诊疗医生: XXX</div>
            </div>
            <div class="text-subtitle1 text-bold">临床信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col">临床诊断: XXX</div>
                <div class="col">肿瘤分期: XXXX</div>
                <div class="col">遗传病: XXXX</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">家族史: XXXXXXX</div>
                <div class="col">用药史: XXXXXX</div>
            </div>
            <div class="text-subtitle1 text-bold">其他信息</div>
            <q-separator></q-separator>
            <div class="row q-my-sm">
                <div class="col">治疗史: XXX</div>
                <div class="col">预后时间: XXX</div>
            </div>
            <div class="row q-my-sm">
                <div class="col">复发时间: XXX</div>
                <div class="col">存活时间: XXX</div>
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
