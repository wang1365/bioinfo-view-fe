<template>
    <div id="igvContainer">
        <q-bar class="bg-primary">
            <span>{{props.file}}</span>
            <q-space></q-space>
            <q-btn icon="close" color="red" size="mini" v-close-popup></q-btn>
        </q-bar>
        <div class="row q-gutter-sm">
            <div v-for="igv in options" :id="igv.uid" :key="igv.uid" class="col"></div>
            <!--            <div id="igv-1" class="col"></div>-->
            <!--            <div id="igv-2" class="col"></div>-->
        </div>
        <q-resize-observer @resize="onResize" />
    </div>
</template>
<script setup>
import {ref, onMounted, onUpdated, nextTick, onUnmounted } from 'vue'
import {readTaskFile} from "src/api/task"
import { uid } from 'quasar'
import * as hg from 'src/utils/refGenome'
import igv from "igv"

const props = defineProps({
    taskId: {
        type: Number,
        required: true
    },
    file: {
        type: String,
        required: true
    }
})

const options = ref([])

onMounted(() => {
    console.log('===> onMounted')
    readTaskFile(props.taskId, props.file).then(res => {
        let lines = res.split('\n').filter(t => t.length > 0)
        lines = lines.map(line => JSON.parse(line))

        // url 处理
        options.value = lines.map(line => {
            // 移除gnome属性
            const { genome, ...option} = line
            option.uid = uid()
            // 添加reference属性
            option.reference = option.genome === 'hg19' ? hg.hg19 : hg.hg38
            for (let track of option.tracks) {
                const url = track['url']
                if (url) {
                    track['url'] = '/igv' + url
                }
                const indexURL = track['indexURL']
                if (indexURL) {
                    track['indexURL'] = '/igv' + indexURL
                }
            }
            return option
        })

        // 延迟渲染，防止出现igv内部size不正常的现象
        setTimeout(() => {
            options.value.forEach(option => {
                refreshIgvBrowser(option.uid, option)
            })
        }, 1000)
    })
})

onUpdated(() => {
    console.log('===> onUpdated')
})

const onResize = () => {
    console.log('========== resize')
}

onUnmounted(() => {
    console.log('===> onUnmounted')
})

const refreshIgvBrowser = (id, options) => {
    const div = document.getElementById(id)

    console.log('==> 创建IGV浏览器节点', id, div, options)
    igv.createBrowser(div, options)
        .then(function (browser) {
            console.log("Created IGV browser", browser)
            browser.visibilityChange()
        })
}
</script>
