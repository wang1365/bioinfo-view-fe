import { boot } from "quasar/wrappers";
import axios from "axios";
import { useRouter } from "vue-router";

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

    transformResponse: [
        function (data) {
            // 对 data 进行任意转换处理
            var jsonData= JSON.parse(data)
            console.log('response data======:',jsonData)
            return jsonData;
        },
    ],
});

export default boot(({ app }) => {
    // for use inside Vue files (Options API) through this.$axios and this.$api

    app.config.globalProperties.$axios = axios;
    // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
    //       so you won't necessarily have to import axios in each vue file

    app.config.globalProperties.$api = api;
    // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
    //       so you can easily perform requests against your app's API
});

export function UserApi() {
    const router = UseRouter();
}

export { api };
