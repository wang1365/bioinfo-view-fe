const routes = [
    {
        path: "/",
        component: () => import("layouts/HomeLayout.vue"),
        children: [],
    },
    {
        path: "/login",
        component: () => import("layouts/LoginLayout/index.vue"),
        children: [],
    },

    {
        path: "/main",
        component: () => import("layouts/MainLayout.vue"),
        children: [
            {
                path: "",
                component: () => import("pages/main/dashboard/IndexPage.vue"),
            },
            {
                path: "dashboard",
                component: () => import("pages/main/dashboard/IndexPage.vue"),
            },
            {
                path: "files",
                component: () => import("pages/main/files/FilesPage.vue"),
            },
            {
                path: "samples",
                component: () => import("pages/main/samples/SamplesPage.vue"),
            },
            {
                path: "patients",
                component: () => import("pages/main/patients/PatientsPage.vue"),
            },
            {
                path: "tasks",
                component: () => import("pages/main/tasks/TasksPage.vue"),
            },
            {
                path: "settings",
                component: () => import("pages/main/settings/SettingsPage.vue"),
            },
            {
                path: "users",
                component: () => import("pages/main/users/UsersPage.vue"),
            },
            {
                path: "profile",
                component: () =>
                    import("pages/main/user-profile/UserProfilePage.vue"),
            },
            {
                path: "panel",
                component: () => import("pages/main/panel-flows/FlowsPage.vue"),
            },
            {
                path: "group",
                component: () => import("pages/main/group-flows/FlowsPage.vue"),
            },
            {
                path: "tools/comment",
                component: () => import("pages/main/tools/comment/CommentPage.vue"),
            },
            {
                path: "tools/browse",
                component: () => import("pages/main/tools/browse/BrowsePage.vue"),
            },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: "/:catchAll(.*)*",
        component: () => import("pages/ErrorNotFound.vue"),
    },
];

export default routes;
