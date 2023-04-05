const menu = [
    {
        icon: 'inbox',
        label: 'PlatformMonitoring',
        separator: true,
        path: '/main/dashboard',
        roles: ['super', 'admin'],
    },
    {
        icon: 'folder',
        label: 'ProjectManage',
        separator: false,
        path: '/main/projects',
    },
    {
        icon: 'auto_mode',
        label: 'TaskManage',
        separator: false,
        path: '/main/tasks',
    },
    {
        icon: 'receipt_long',
        label: 'CustomReport',
        separator: false,
        path: '/main/reports',
    },

    {
        icon: 'groups_2',
        label: 'PatientManage',
        separator: false,
        path: '/main/patients',
    },
    {
        icon: 'description',
        label: 'SampleManage',
        separator: false,
        path: '/main/samples',
    },

    {
        icon: 'save',
        label: 'DataManage',
        separator: false,
        path: '/main/data',
    },
    {
        icon: 'hub',
        label: 'PanelFlow',
        separator: false,
        path: '/main/panel',
    },
    // {
    //     icon: "hub",
    //     label: "(暂时不做)群体分析流程",
    //     separator: false,
    //     path: "/main/group",
    // },
    //
    // {
    //     icon: 'rate_review',
    //     label: '数据库注释',
    //     separator: false,
    //     path: '/main/tools/comment',
    //     // children: [
    //     //     {
    //     //         label: '基因',
    //     //         separator: false,
    //     //         path: '/main/tools/comment/gene',
    //     //         roles: ['super'],
    //     //     },
    //     //     {
    //     //         label: '突变',
    //     //         separator: false,
    //     //         path: '/main/tools/comment/mutation',
    //     //     },
    //     //     {
    //     //         label: '药物',
    //     //         separator: false,
    //     //         path: '/main/tools/comment/medicine',
    //     //     },
    //     // ],
    // },
    {
        icon: 'biotech',
        label: 'GeneBrowser',
        separator: true,
        path: '/main/tools/browse',
    },
    {
        icon: 'settings',
        label: 'SystemSetting',
        separator: false,
        path: '/main/settings',
        roles: ['super', 'admin'],
        children: [
            {
                icon: 'mediation',
                label: 'FlowManage',
                separator: false,
                path: '/main/settings/flowManagement',
                roles: ['super'],
            },
            {
                icon: 'handyman',
                label: 'SystemSetting',
                separator: false,
                path: '/main/settings/system',
            },
            {
                icon: 'wallpaper',
                label: 'UiSetting',
                separator: false,
                path: '/main/settings/ui',
            },
        ],
    },
    {
        icon: 'people',
        label: 'UserManage',
        separator: false,
        path: '/main/users',
        roles: ['super', 'admin'],
    },
    {
        icon: 'manage_accounts',
        label: 'UserProfile',
        separator: false,
        path: '/main/profile',
    },
]

export const getAuthMenu = (currentUser) => {
    if (!currentUser) {
        return []
    }
    const currentRoles = currentUser.role_list || []
    function filter(items) {
        return items.filter((item) => {
            let result = false
            if (!item.roles) {
                result = true
            } else {
                for (let role of item.roles) {
                    if (currentRoles.includes(role)) {
                        result = true
                        break
                    }
                }
            }

            if (result && item.children) {
                item.children = filter(item.children)
            }
            return result
        })
    }

    return filter(menu)
}
