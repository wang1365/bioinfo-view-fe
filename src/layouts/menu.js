const menu = [
    {
        icon: 'inbox',
        label: '平台监控',
        separator: true,
        path: '/main/dashboard',
    },
    {
        icon: 'folder',
        label: '项目管理',
        separator: false,
        path: '/main/projects',
    },
    {
        icon: 'auto_mode',
        label: '任务管理',
        separator: false,
        path: '/main/tasks',
    },
    {
        icon: 'groups_2',
        label: '患者管理',
        separator: false,
        path: '/main/patients',
    },
    {
        icon: 'description',
        label: '样本管理',
        separator: false,
        path: '/main/samples',
    },

    {
        icon: 'save',
        label: '数据管理',
        separator: false,
        path: '/main/data',
    },
    // {
    //     icon: "hub",
    //     label: "Panel 分析流程",
    //     separator: false,
    //     path: "/main/panel",
    // },
    // {
    //     icon: "hub",
    //     label: "(暂时不做)群体分析流程",
    //     separator: false,
    //     path: "/main/group",
    // },

    {
        icon: 'rate_review',
        label: '数据库注释',
        separator: false,
        path: '/main/tools/comment',
    },
    {
        icon: 'biotech',
        label: '基因组浏览器',
        separator: true,
        path: '/main/tools/browse',
    },
    {
        icon: 'settings',
        label: '系统设置',
        separator: false,
        path: '/main/settings',
        children: [
            {
                icon: 'mediation',
                label: '流程管理',
                // roles: ["super"],
                separator: false,
                path: '/main/settings/flowManagement',
            },
            {
                icon: 'handyman',
                label: '系统设置',
                separator: false,
                path: '/main/settings/system',
            },
            {
                icon: 'wallpaper',
                label: '界面配置',
                separator: false,
                path: '/main/settings/ui',
            },
        ],
    },
    {
        icon: 'people',
        label: '用户管理',
        separator: false,
        path: '/main/users',
    },
    {
        icon: 'manage_accounts',
        label: '个人中心',
        separator: false,
        path: '/main/profile',
    },
]

export default menu
