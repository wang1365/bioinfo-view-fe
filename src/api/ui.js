import {api} from "src/boot/axios";
import {globalStore} from "src/stores/global"

export function listUiConfig() {
    return api({
        url: "/site_config/",
        method: "get"
    });
}

export function createUiConfig(data) {
    return api({
        url: "/site_config/",
        method: "post",
        data
    });
}

export function updateUiConfig(data) {
    return api({
        url: `/site_config/${data.id}`,
        method: "patch",
        data
    });
}

const store = globalStore()

export function refreshSystemUi(ui) {
    if (ui) {
        store.ui = ui
        return
    }

    listUiConfig().then(res => {
        if (res.length === 0) {
            return
        }
        // 更新store中的ui配置
        let {title, image} = res[res.length-1]
        store.ui = {
            title,
            image
        }
        console.log('更新UI配置', title, image)
    })
}

