<template>
    <q-card>
        <q-card-section>
            <div class="row q-gutter-xs justify-around">
                <sample-field :model-value="sample.patient.name" label="患者姓名" />
                <sample-field :model-value="sample.patient.age" label="患者年龄" />
                <sample-field :model-value="sample.identifier" label="样本标识号" />
                <sample-field :model-value="sample.is_panel ? '是' : '否'" label="是否肿瘤" />
                <sample-field :model-value="sample.panel_proportion" label="肿瘤含量" />
                <sample-field :model-value="sample.patient_identifier" label="患者标识号" />
                <sample-field :model-value="sample.sample_componet" label="采样部位" />
                <sample-field :model-value="sample.sample_date" label="采样日期" />
                <sample-field :model-value="sample.sample_type" label="样本类型" />
                <sample-field :model-value="sample.test_date" label="送测日期" />
            </div>
        </q-card-section>
    </q-card>
</template>
<script setup>
import {toRefs} from 'vue'
import SampleField from './SampleField'


const props = defineProps({
    sample: {
        required: true,
        default: null
    }
})

const {sample} = toRefs(props)
</script>
