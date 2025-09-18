import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userAPI } from '@/api/user'
import { logger } from '@/utils/logger'

export const useUserStore = defineStore('user', () => {
    const userList = ref([])
    const total = ref(0)
    const loading = ref(false)
    const currentUser = ref(null)

    // Get user list
    const getUserList = async (params = {}) => {
        try {
            loading.value = true
            const response = await userAPI.getUserList(params)

            if (response.success) {
                userList.value = response.data.list
                total.value = response.data.total
                logger.info('User list loaded', { count: response.data.list.length })
                return { success: true, data: response.data }
            } else {
                logger.warn('Failed to load user list', { error: response.message })
                return { success: false, message: response.message }
            }
        } catch (error) {
            logger.error('Get user list error:', error)
            return { success: false, message: 'Failed to load user list' }
        } finally {
            loading.value = false
        }
    }

    // Get user by id
    const getUserById = async (id) => {
        try {
            loading.value = true
            const response = await userAPI.getUserById(id)

            if (response.success) {
                currentUser.value = response.data
                logger.info('User details loaded', { userId: id })
                return { success: true, data: response.data }
            } else {
                logger.warn('Failed to load user details', { userId: id, error: response.message })
                return { success: false, message: response.message }
            }
        } catch (error) {
            logger.error('Get user by id error:', error)
            return { success: false, message: 'Failed to load user details' }
        } finally {
            loading.value = false
        }
    }

    // Create user
    const createUser = async (userData) => {
        try {
            loading.value = true
            const response = await userAPI.createUser(userData)

            if (response.success) {
                logger.info('User created successfully', { userId: response.data.id })
                return { success: true, data: response.data }
            } else {
                logger.warn('Failed to create user', { error: response.message })
                return { success: false, message: response.message }
            }
        } catch (error) {
            logger.error('Create user error:', error)
            return { success: false, message: 'Failed to create user' }
        } finally {
            loading.value = false
        }
    }

    // Update user
    const updateUser = async (id, userData) => {
        try {
            loading.value = true
            const response = await userAPI.updateUser(id, userData)

            if (response.success) {
                logger.info('User updated successfully', { userId: id })
                return { success: true, data: response.data }
            } else {
                logger.warn('Failed to update user', { userId: id, error: response.message })
                return { success: false, message: response.message }
            }
        } catch (error) {
            logger.error('Update user error:', error)
            return { success: false, message: 'Failed to update user' }
        } finally {
            loading.value = false
        }
    }

    // Delete user
    const deleteUser = async (id) => {
        try {
            loading.value = true
            const response = await userAPI.deleteUser(id)

            if (response.success) {
                logger.info('User deleted successfully', { userId: id })
                return { success: true }
            } else {
                logger.warn('Failed to delete user', { userId: id, error: response.message })
                return { success: false, message: response.message }
            }
        } catch (error) {
            logger.error('Delete user error:', error)
            return { success: false, message: 'Failed to delete user' }
        } finally {
            loading.value = false
        }
    }

    // Batch delete users
    const batchDeleteUsers = async (ids) => {
        try {
            loading.value = true
            const response = await userAPI.batchDeleteUsers(ids)

            if (response.success) {
                logger.info('Users deleted successfully', { count: ids.length })
                return { success: true }
            } else {
                logger.warn('Failed to delete users', { error: response.message })
                return { success: false, message: response.message }
            }
        } catch (error) {
            logger.error('Batch delete users error:', error)
            return { success: false, message: 'Failed to delete users' }
        } finally {
            loading.value = false
        }
    }

    return {
        userList,
        total,
        loading,
        currentUser,
        getUserList,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        batchDeleteUsers
    }
})
