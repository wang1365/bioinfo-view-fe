import { api } from 'src/boot/axios'

// 分页查询用户列表
export function listUser(keyword, page = 1, size = 10) {
    return api({
        url: '/account/',
        method: 'get',
        params: { keyword, page, size },
    })
}

export function getInfo(token) {
    return api({
        url: '/account/',
        method: 'get',
        params: { token },
    })
}

export function logout() {
    return api({
        url: '/user/logout',
        method: 'post',
    })
}

export function register(data) {
    return api({
        url: '/account/?action=register',
        method: 'post',
        data,
    })
}

export function getUsers(page = 1, size = 10) {
    return api({
        url: '/account/manager',
        method: 'get',
        params: { page, size },
    })
}

export function createUser(data) {
    return api({
        url: '/account/create_user',
        method: 'post',
        data,
    })
}

export function batchDeleteUser(data) {
    return api({
        url: 'account/delete_user',
        method: 'delete',
        data,
    })
}

export function updateCurrentUser(data) {
    return api({
        url: 'account/',
        method: 'patch',
        data,
    })
}

export function updateUser(userid, is_active, role, department) {
    return api({
        url: 'account/manager',
        method: 'patch',
        data: { userid, is_active, role, department },
    })
}

export function patchUser(userId, data) {
    return api({
        url: `account/${userId}`,
        method: 'patch',
        data: data,
    })
}

export function resetPassword(userId, password) {
    return api({
        url: `account/${userId}/reset_password`,
        method: 'put',
        data: { password },
    })
}

export function changePassword(userId, old_password, new_password) {
    return api({
        url: `account/${userId}/change_password`,
        method: 'patch',
        data: { old_password, new_password },
    })
}
