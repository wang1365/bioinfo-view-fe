<template>
    <q-page padding>
        <PageTitle :title="$t('SystemUiConfig')"></PageTitle>
        <q-card class="width:600px">
            <q-card-section>
                <div class="text-h6">{{$t('SystemTitle') + ':'}}</div>
                <q-input v-model="form.title" outlined>
                    <template v-slot:before>
                        <q-icon name="flight_takeoff" />
                    </template>
                </q-input>
            </q-card-section>
            <q-separator />
            <q-card class="width:300px ">
                <q-list>
                    <q-item>
                        <q-img :src="form.image" spinner-color="white" style="height: 200px; max-width: 200px">
                            <div class="absolute-top text-center">{{$t('SystemIcon')}}</div>
                        </q-img>
                    </q-item>
                    <q-item>
                        <q-file
                            filled
                            bottom-slots
                            v-model="imageFile"
                            :label="$t('SelectImage')"
                            class="q-pa-sm"
                            max-file-size="2048000"
                            bg-color="blue"
                            label-color="white"
                            accept=".jpg,.png,.svg,.ico"
                            @rejected="onRejected"
                        >
                        </q-file>
                    </q-item>
                </q-list>
            </q-card>
            <q-separator />
            <q-card-actions align="left">
                <q-card-section>
                    <q-btn :label="$t('Save')" color="primary" icon="save_as" @click="clickSet"></q-btn>
                </q-card-section>
            </q-card-actions>
        </q-card>
    </q-page>
</template>

<script setup>
import {ref, watch, onMounted, toRefs} from 'vue'
import PageTitle from "components/page-title/PageTitle"
import {useQuasar} from 'quasar'
import { QSpinnerGears } from 'quasar'
import {listUiConfig, createUiConfig, updateUiConfig, refreshSystemUi} from 'src/api/ui'

const $q = useQuasar()

const imageFile = ref(null)
const form = ref({})

const upload = () => {
    clearTimeout(this.uploading)

    const allDone = this.uploadProgress.every(progress => progress.percent === 1)

    this.uploadProgress = this.uploadProgress.map(progress => ({
        ...progress,
        error: false,
        color: 'green-2',
        percent: allDone === true ? 0 : progress.percent
    }))
}

function fileToBase64(file) {
    console.log('开始图片转base64', file)
    return new Promise(((resolve, reject) => {
        const reader = new FileReader();
        let result = ''
        reader.readAsDataURL(file)
        reader.onload = function (e) {
            result = e.target.result
        }
        reader.onerror = function () {
            console.log('图片解析BASE64失败，', file)
            reject(error)
        }
        reader.onloadend = function () {
            resolve(result)
        }
    }))

}

watch(imageFile, (val) => {
    fileToBase64(imageFile.value).then(res => {
        console.log('base64：', res)
        form.value.image = res
    })
})

onMounted(() => {
    refreshUiConfig()
})

const refreshUiConfig = () => {
    $q.loading.show({
        spinner: QSpinnerGears,
        spinnerColor: 'red',
        message: '正在加载系统配置...'
    })
    listUiConfig().then(res => {
        console.log('========== 查询配置', res)
        if (res.length > 0) {
            // 取第一条配置
            form.value = res[res.length-1]
            refreshSystemUi(form.value)
        } else {
            // 没有配置，则初始化
            form.value = {
                id: null,
                title: '',
                image: ''
            }
        }
    }).finally(() => $q.loading.hide())
}
const clickSet = () => {
    if (!form.value.id) {
        // 新增配置
        createUiConfig(form.value).then(res => {
            $q.notify({
                message: '设置成功'
            })
            refreshSystemUi(form.value)
            refreshUiConfig()
        })
    } else {
        // 更新配置
        updateUiConfig(form.value).then(res => {
            $q.notify({
                message: '设置成功'
            })
            refreshSystemUi(form.value)
            refreshUiConfig()
        })
    }
}


const onRejected = (rejectedEntries) => {
    console.log('xxxxxxxxx', rejectedEntries)
    $q.notify({
        type: "negative",
        message: `${rejectedEntries.length} file(s) did not pass validation constraints`,
    })
}
</script>
