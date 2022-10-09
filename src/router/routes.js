const routes = [
    {
        path: '/',
        component: () => import('layouts/HomeLayout.vue'),
        children: [],
        redirect: '/main',
        meta: { pageTitle: '首页' },
    },
    {
        path: '/login',
        component: () => import('layouts/LoginLayout/index.vue'),
        children: [],
        name: 'Login',
        meta: {
            pageTitle: '登陆页',
        },
    },

    {
        path: '/main',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import('pages/main/dashboard/IndexPage.vue'),
            },
            {
                path: 'dashboard',
                component: () => import('pages/main/dashboard/IndexPage.vue'),
            },
            {
                path: 'projects',
                component: () => import('pages/main/projects/index.vue'),
            },
            {
                path: 'projects/:id',
                component: () => import('pages/main/projects/ProjectDetail/index.vue'),
            },
            {
                path: 'patients',
                component: () => import('pages/main/patients/PatientsPage.vue'),
            },
            {
                path: 'patients/:id',
                component: () => import('pages/main/patients/PatientDetailPage.vue'),
            },
            {
                path: 'samples',
                component: () => import('pages/main/samples/SamplesPage.vue'),
            },
            {
                path: 'data',
                component: () => import('pages/main/data/DataPage.vue'),
            },
            {
                path: 'tasks',
                component: () => import('pages/main/tasks/index.vue'),
            },
            {
                path: 'tasks/:id',
                component: () => import('pages/main/tasks/TaskDetail/index.vue'),
            },

            {
                path: 'settings',
                component: () => import('pages/main/settings/SettingBlank'),
                children: [
                    {
                        path: 'flowManagement',
                        component: () => import('pages/main/settings/flow'),
                    },
                    {
                        path: 'system',
                        component: () => import('pages/main/settings/SettingsPage.vue'),
                    },
                    {
                        path: 'ui',
                        component: () => import('pages/main/settings/UiSettingsPage.vue'),
                    },
                ],
            },
            {
                path: 'users',
                component: () => import('pages/main/users'),
            },
            {
                path: 'profile',
                component: () => import('pages/main/user-profile/UserProfilePage.vue'),
            },
            {
                path: 'panel',
                // component: () => import('pages/main/panel-flows/FlowsPage.vue'),
                component: () => import('pages/main/settings/SettingBlank'),
                children: [
                    {
                        path: 'group',
                        component: () => import('pages/main/panel-flows/FlowsPage'),
                    },
                    {
                        path: 'panel',
                        component: () => import('pages/main/panel-flows/FlowsPage'),
                    },
                    {
                        path: 'flow',
                        component: () => import('pages/main/panel-flows/FlowsPage'),
                    },
                ],
            },
            {
                path: 'group',
                component: () => import('pages/main/group-flows/FlowsPage.vue'),
            },
            {
                path: 'tools/comment',
                component: () => import('pages/main/tools/comment/CommentPage.vue'),
            },
            {
                path: 'tools/browse',
                component: () => import('pages/main/tools/browse/index.vue'),
            },
            {
                path: 'tools/browse/detail',
                component: () => import('pages/main/tools/browse/BrowsePage.vue'),
            },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
    },
]

export default routes
