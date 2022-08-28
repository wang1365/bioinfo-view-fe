const routes = [
    {
        path: "/",
        component: () => import("layouts/HomeLayout.vue"),
        children: [],
        meta: { pageTitle: "首页" },
    },
    {
        path: "/login",
        component: () => import("layouts/LoginLayout/index.vue"),
        children: [],
        meta: {
            pageTitle: "登陆页",
        },
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
                path: "projects",
                component: () => import("pages/main/projects/ProjectsPage.vue"),
            },
            {
                path: "projects/:id",
                component: () =>
                    import(
                        "pages/main/projects/ChildProject/ChildProjectPage.vue"
                    ),
            },
            {
                path: "patients",
                component: () => import("pages/main/patients/PatientsPage.vue"),
            },
            {
                path: "samples",
                component: () => import("pages/main/samples/SamplesPage.vue"),
            },
            {
                path: "data",
                component: () => import("pages/main/data/DataPage.vue"),
            },
            {
                path: "tasks",
                component: () => import("pages/main/tasks/TasksPage.vue"),
            },
            {
                path: "settings",
                children: [
                    {
                        path: "system",
                        component: () =>
                            import("pages/main/settings/SettingsPage.vue"),
                    },
                    {
                        path: "ui",
                        component: () =>
                            import("pages/main/settings/UiSettingsPage.vue"),
                    },
                ],
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
                component: () =>
                    import("pages/main/tools/comment/CommentPage.vue"),
            },
            {
                path: "tools/browse",
                component: () =>
                    import("pages/main/tools/browse/BrowsePage.vue"),
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
