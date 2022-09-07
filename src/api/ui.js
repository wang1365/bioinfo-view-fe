import {api} from "src/boot/axios";

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
        url: "/site_config/",
        method: "update",
        data
    });
}

