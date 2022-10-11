export const isSuper = (user) => {
    return isRole(user, 'super')
}

export const isAdmin = (user) => {
    return isRole(user, 'admin')
}

export const isNormal = (user) => {
    return isRole(user, 'normal')
}

const isRole = (user, roleName) => {
    const roles = user.role || user.role_list || []
    if (!roles) {
        return false
    }

    return roles.includes(roleName)
}
