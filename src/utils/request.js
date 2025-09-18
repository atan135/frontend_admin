import axios from 'axios'
import { message } from 'ant-design-vue'
import { logger, errorLogger } from './logger'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/config'

// Create axios instance
const request = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor
request.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        const token = authStore.token

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
    },
    (error) => {
        errorLogger.error('Request Error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor
request.interceptors.response.use(
    (response) => {
        logger.info(`API Response: ${response.status} ${response.config.url}`)
        return response.data
    },
    (error) => {
        const authStore = useAuthStore()

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    message.error('Unauthorized, please login again')
                    authStore.logout()
                    break
                case 403:
                    message.error('Forbidden, insufficient permissions')
                    break
                case 404:
                    message.error('Resource not found')
                    break
                case 500:
                    message.error('Internal server error')
                    break
                default:
                    message.error(data?.message || 'Request failed')
            }

            errorLogger.error(`API Error: ${status} ${error.config?.url}`, data)
        } else if (error.request) {
            message.error('Network error, please check your connection')
            errorLogger.error('Network Error:', error.message)
        } else {
            message.error('Request configuration error')
            errorLogger.error('Config Error:', error.message)
        }

        return Promise.reject(error)
    }
)

export default request
