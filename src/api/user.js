import request from '@/utils/request'

export const userAPI = {
    // Get user list
    getUserList(params) {
        return request({
            url: '/users',
            method: 'get',
            params
        })
    },

    // Get user by id
    getUserById(id) {
        return request({
            url: `/users/${id}`,
            method: 'get'
        })
    },

    // Create user
    createUser(data) {
        return request({
            url: '/users',
            method: 'post',
            data
        })
    },

    // Update user
    updateUser(id, data) {
        return request({
            url: `/users/${id}`,
            method: 'put',
            data
        })
    },

    // Delete user
    deleteUser(id) {
        return request({
            url: `/users/${id}`,
            method: 'delete'
        })
    },

    // Batch delete users
    batchDeleteUsers(ids) {
        return request({
            url: '/users/batch',
            method: 'delete',
            data: { ids }
        })
    }
}
