<template>
    <div >
        <div class="q-pa-md">
            <q-uploader
                label="系统Logo设置(最大2M)"
                max-file-size="20480"
                auto-upload
                color="purple"
                @rejected="onRejected"
                :url="getUrl"
            />
        </div>

        <q-file filled bottom-slots v-model="model" label="系统Logo设置(最大2M)" counter class="q-pa-md"
                max-file-size="20480"
                bg-color="blue"
                label-color="white"
                standout
        >
            <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop />
            </template>
            <template v-slot:append>
                <q-icon name="yard" @click.stop="model = null" class="cursor-pointer" />
            </template>

            <template v-slot:hint>
                图片大小
            </template>
        </q-file>
    </div>
</template>

<script setup>

const getUrl = (files) => {
    return `http://localhost:4444/upload?count=${files.length}`
}
const onRejected = (rejectedEntries) => {
    this.$q.notify({
        type: 'negative',
        message: `${rejectedEntries.length} file(s) did not pass validation constraints`
    })
}
</script>
