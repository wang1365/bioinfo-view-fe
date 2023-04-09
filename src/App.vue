<template>
    <a-config-provider :locale="antLocale" >
        <router-view />
    </a-config-provider>
</template>

<script>
import { defineComponent } from "vue"
import cn from 'ant-design-vue/es/locale/zh_CN'
import en from 'ant-design-vue/es/locale/en_US'
import moment from "moment"
import "moment/locale/zh-cn"
import { globalStore } from "stores/global"

moment.locale("zh-cn");
export default defineComponent({
    name: "App",
    data() {
        return {
        }
    },
    computed: {
      antLocale: () => {
          const store = globalStore()
          return store.lang === 'zh-CN' ? cn : en
      }
    },
});
</script>
