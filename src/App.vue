<template>
    <a-config-provider :locale="antLocale">
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
import { listConfig } from 'src/api/config'
import { useI18n } from 'vue-i18n';


moment.locale("zh-cn");
export default defineComponent({
    name: "App",
    data() {
        const store = globalStore()
        const { locale } = useI18n({ useScope: 'global' })
        return {
            store, locale
        }
    },
    computed: {
      antLocale: () => {
          const store = globalStore()
          return store.lang === 'zh-CN' ? cn : en
      }
    },
    mounted() {
        const store = globalStore()
        listConfig().then(res => {
            for (let item of res.results) {
                if (item.name === 'langConfig') {
                    const langConfig = JSON.parse(item.data)

                    store.langConfig.langSwitch = langConfig.langSwitch
                    store.langConfig.defaultLang = langConfig.defaultLang
                    console.log('---------->', langConfig)
                    // 如果没有开启语言切换，则使用语言配置中的默认语言
                    if (!langConfig.lang_switch) {
                        this.locale = langConfig.defaultLang === 'en' ? 'en-US' : 'zh-CN'
                        store.langConfig.lang =  langConfig.defaultLang
                    }
                }
            }
        })
    }
});
</script>
