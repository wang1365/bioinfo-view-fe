const menu = [
    {
        icon: 'inbox',
        label: '平台监控',
        separator: true,
        path: '/main/dashboard',
        roles: ['super', 'admin'],
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
    {
        icon: 'hub',
        label: 'Panel分析流程',
        separator: false,
        path: '/main/panel',
    },
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
        children: [
            {
                label: '基因',
                separator: false,
                path: '/main/tools/comment/gene',
                roles: ['super'],
            },
            {
                label: '突变',
                separator: false,
                path: '/main/tools/comment/mutation',
            },
            {
                label: '药物',
                separator: false,
                path: '/main/tools/comment/medicine',
            },
        ],
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
        roles: ['super', 'admin'],
        children: [
            {
                icon: 'mediation',
                label: '流程管理',
                separator: false,
                path: '/main/settings/flowManagement',
                roles: ['super'],
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
        roles: ['super', 'admin'],
    },
    {
        icon: 'manage_accounts',
        label: '个人中心',
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
