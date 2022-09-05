import { useRouter } from "vue-router";
import { Notify } from "quasar";
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
export function getTokenCookie() {
    let cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        let datas = cookie.split("=");
        if (datas[0] === "token") {
            return datas[1];
        }
    }
    return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2NjMyMjM5MjQsInN1YiI6ImFjY2VzcyJ9.Y6c5dcTZppCiNjW6Nq8LDxjF5wqDAL3bEOnU54Sapa4";
}
const api = axios.create({
    baseURL: "/api",
    headers: {
        Authorization: getTokenCookie(),
    },
    withCredentials: true,
});
export function defaultErrorHandler(data) {
    Notify.create({
        type: "negative",
        message: `服务器错误：${data.msg}`,
    });
}
export function defaultHttpErrorHandler(error) {
    Notify.create({
        type: "negative",
        message: `服务器错误：${error}`,
    });
    console.log(error);
}
export function defaultHandler(router, resp, onSuccess, onError) {
    const res = resp.data;
    const code = resp.data.code;
    const statusCode = res.status_code;
    if (code === 0) {
        onSuccess(res);
    } else if (statusCode === 401) {
        Notify.create({
            type: "negative",
            message: "未登录",
        });
        router.push("/login");
    } else if (statusCode === 403) {
        Notify.create({
            type: "negative",
            message: "无权限",
        });
        router.push("/login");
    } else if (statusCode === 400 || code === 1) {
        if (onError) {
            onError(res);
        } else {
            defaultErrorHandler(res);
        }
    } else if (statusCode === 404) {
        Notify.create({
            type: "negative",
            message: "路由不存在",
        });
        console.log(resp.data.data);
    } else {
        Notify.create({
            type: "negative",
            message: `服务异常: ${res.msg}`,
        });
    }
}

export function useApi() {
    const router = useRouter();
    function apiGet(
        url,
        onSuccess,
        config = {},
        onError = null,
        onHttpError = null
    ) {
        api.get(url, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError);
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error);
                } else {
                    defaultHttpErrorHandler(error);
                }
            });
    }
    function apiPost(
        url,
        onSuccess,
        data = {},
        config = {},
        onError = null,
        onHttpError = null
    ) {
        api.post(url, data, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError);
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error);
                } else {
                    defaultHttpErrorHandler(error);
                }
            });
    }
    function apiPut(
        url,
        onSuccess,
        data = {},
        config = {},
        onError = null,
        onHttpError = null
    ) {
        api.put(url, data, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError);
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error);
                } else {
                    defaultHttpErrorHandler(error);
                }
            });
    }
    function apiPatch(
        url,
        onSuccess,
        data = {},
        config = {},
        onError = null,
        onHttpError = null
    ) {
        api.patch(url, data, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError);
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error);
                } else {
                    defaultHttpErrorHandler(error);
                }
            });
    }
    function apiDelete(
        url,
        onSuccess,
        data = {},
        config = {},
        onError = null,
        onHttpError = null
    ) {
        if (data) {
            config.data = data;
        }
        api.delete(url, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError);
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error);
                } else {
                    defaultHttpErrorHandler(error);
                }
            });
    }

    return { apiGet, apiPost, apiPut, apiDelete, apiPatch };
}
