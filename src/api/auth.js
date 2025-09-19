import request from '@/utils/request'

export const authAPI = {
    // Login
    login(data) {
        return request({
            url: '/auth/login',
            method: 'post',
            data
        })
    },

    // Logout
    logout() {
        return request({
            url: '/auth/logout',
            method: 'post'
        })
    },

    // Get user info
    getUserInfo() {
        return request({
            url: '/auth/user',
            method: 'get'
        })
    },

    // Refresh token
    refreshToken() {
        return request({
            url: '/auth/refresh',
            method: 'post'
        })
    },

    // Register
    register(data) {
        return request({
            url: '/auth/register',
            method: 'post',
            data
        })
    },

    // Get CSRF token
    getCsrfToken() {
        return request({
            url: '/auth/csrf-token',
            method: 'get'
        })
    }
}
