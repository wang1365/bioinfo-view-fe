import { globalStore } from 'src/stores/global'

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

export const hasAnyRole = (roles) => {
    const { currentUser } = globalStore()
    if (!currentUser) {
        return false
    }

    const userRoles = currentUser.role_list
    if (!userRoles) {
        return false
    }

    for (let role of roles) {
        if (userRoles.includes(role)) {
            return true
        }
    }

    return false
}
