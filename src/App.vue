<template>
    <a-config-provider :locale="locale">
        <router-view />
    </a-config-provider>
</template>

<script>
import { defineComponent } from "vue";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import moment from "moment";
import "moment/locale/zh-cn";

moment.locale("zh-cn");
export default defineComponent({
    name: "App",
    data() {
        return {
            locale: zhCN,
        };
    },
});
</script>
