import { api } from "src/boot/axios";

// 分页查询用户列表
export function listConfig() {
    return api({
        url: "/config/",
        method: "get"
    });
}
