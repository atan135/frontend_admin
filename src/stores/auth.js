import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'
import { logger } from '@/utils/logger'
import { getClientInfo } from '@/utils/deviceInfo'
import { csrfManager } from '@/utils/csrf'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '')
    const userInfo = ref(null)
    const loading = ref(false)

    const isLoggedIn = computed(() => !!token.value)


    // Initialize CSRF token
    const initializeCsrfToken = async () => {
        try {
            await csrfManager.getToken()
            logger.info('CSRF token initialized')
        } catch (error) {
            logger.warn('Failed to initialize CSRF token:', error)
        }
    }

    // Login
    const login = async (credentials) => {
        try {
            loading.value = true

            // Get comprehensive client information
            const clientInfo = await getClientInfo()

            // Prepare login data with additional information
            const loginData = {
                ...credentials,
                ...clientInfo,
                loginTime: new Date().toISOString()
            }

            logger.info('Login attempt with device info:', {
                username: credentials.username,
                deviceType: clientInfo.device.deviceType,
                browser: clientInfo.device.browser,
                os: clientInfo.device.os,
                location: clientInfo.location.latitude ? `${clientInfo.location.latitude}, ${clientInfo.location.longitude}` : 'Unknown'
            })

            const response = await authAPI.login(loginData)
            logger.info('Login response:', response)

            if (response.errcode == 0) {
                token.value = response.token
                userInfo.value = response.user
                localStorage.setItem('token', response.token)
                localStorage.setItem('userInfo', JSON.stringify(response.user))

                // Initialize CSRF token after successful login
                await initializeCsrfToken()

                logger.info('User logged in successfully', {
                    userId: response.user.id,
                    deviceType: clientInfo.device.deviceType,
                    location: clientInfo.location.latitude ? `${clientInfo.location.latitude}, ${clientInfo.location.longitude}` : 'Unknown'
                })
                return { errcode: 0, errmsg: 'Login successful' }
            } else {
                logger.warn('Login failed', { error: response.errmsg })
                return { errcode: 1, errmsg: response.errmsg }
            }
        } catch (error) {
            logger.error('Login error:', error)
            return { errcode: 1, errmsg: 'Login failed, please try again' }
        } finally {
            loading.value = false
        }
    }

    // Logout
    const logout = async () => {
        try {
            if (token.value) {
                await authAPI.logout()
            }
        } catch (error) {
            logger.error('Logout error:', error)
        } finally {
            token.value = ''
            userInfo.value = null
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')

            // Clear CSRF token on logout
            csrfManager.clearToken()

            router.push('/login')
            logger.info('User logged out')
        }
    }

    // Check authentication
    const checkAuth = async () => {
        if (!token.value) return false

        try {
            const response = await authAPI.getUserInfo()
            if (response.errcode === 0) {
                userInfo.value = response.user
                localStorage.setItem('userInfo', JSON.stringify(response.user))

                // Initialize CSRF token for authenticated user
                await initializeCsrfToken()

                return true
            } else {
                logout()
                return false
            }
        } catch (error) {
            logger.error('Auth check error:', error)
            logout()
            return false
        }
    }

    // Register
    const register = async (userData) => {
        try {
            loading.value = true

            // Get comprehensive client information
            const clientInfo = await getClientInfo()

            // Prepare registration data with additional information
            const registrationData = {
                ...userData,
                ...clientInfo,
                registrationTime: new Date().toISOString()
            }

            logger.info('Registration attempt with device info:', {
                username: userData.username,
                deviceType: clientInfo.device.deviceType,
                browser: clientInfo.device.browser,
                os: clientInfo.device.os,
                location: clientInfo.location.latitude ? `${clientInfo.location.latitude}, ${clientInfo.location.longitude}` : 'Unknown'
            })

            const response = await authAPI.register(registrationData)

            if (response.errcode == 0) {
                logger.info('User registered successfully', {
                    username: userData.username,
                    deviceType: clientInfo.device.deviceType,
                    location: clientInfo.location.latitude ? `${clientInfo.location.latitude}, ${clientInfo.location.longitude}` : 'Unknown'
                })
                return { errcode: 0, errmsg: 'Registration successful' }
            } else {
                logger.warn('Registration failed', { error: response.errmsg })
                return { errcode: 1, errmsg: response.errmsg }
            }
        } catch (error) {
            logger.error('Registration error:', error)
            return { errcode: 1, errmsg: 'Registration failed, please try again' }
        } finally {
            loading.value = false
        }
    }

    // Initialize from localStorage
    const initFromStorage = () => {
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserInfo) {
            try {
                userInfo.value = JSON.parse(storedUserInfo)
            } catch (error) {
                logger.error('Failed to parse stored user info:', error)
                localStorage.removeItem('userInfo')
            }
        }
    }

    return {
        token,
        userInfo,
        loading,
        isLoggedIn,
        login,
        logout,
        register,
        checkAuth,
        initFromStorage
    }
})
