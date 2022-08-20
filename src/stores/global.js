import { defineStore } from "pinia";

export const globalStore = defineStore("global", {
    state: () => ({
        logo: "/icons/favicon-128x128.png",
        pageTitle: "",
        // logo: "/icons/nanodi.svg",
        currentUserToken: "",
        currentUser: null,
    }),
    getters: {
        doubleCount: (state) => state.counter * 2,
    },
    actions: {
        increment() {
            this.counter++;
        },
    },
});
