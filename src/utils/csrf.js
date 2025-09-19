// CSRF Token Management Utility

import { authAPI } from '@/api/auth'
import { logger } from '@/utils/logger'

class CSRFManager {
    constructor() {
        this.token = null
        this.refreshPromise = null
        this.lastRefresh = null
        this.refreshInterval = 30 * 60 * 1000 // 30 minutes
    }

    /**
     * Get CSRF token, refresh if needed
     * @returns {Promise<string>} CSRF token
     */
    async getToken() {
        // If we have a valid token and it's not expired, return it
        if (this.token && this.isTokenValid()) {
            return this.token
        }

        // If we're already refreshing, wait for that promise
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        // Start a new refresh
        this.refreshPromise = this.refreshToken()
        const token = await this.refreshPromise
        this.refreshPromise = null
        return token
    }

    /**
     * Refresh CSRF token from server
     * @returns {Promise<string>} New CSRF token
     */
    async refreshToken() {
        try {
            logger.info('Refreshing CSRF token')
            const response = await authAPI.getCsrfToken()

            if (response.errcode === 0) {
                this.token = response.csrfToken
                this.lastRefresh = Date.now()
                logger.info('CSRF token refreshed successfully')
                return this.token
            } else {
                logger.error('Failed to refresh CSRF token:', response.errmsg)
                throw new Error(response.errmsg)
            }
        } catch (error) {
            logger.error('CSRF token refresh error:', error)
            this.token = null
            this.lastRefresh = null
            throw error
        }
    }

    /**
     * Check if current token is still valid
     * @returns {boolean} True if token is valid
     */
    isTokenValid() {
        if (!this.token || !this.lastRefresh) {
            return false
        }

        const now = Date.now()
        const timeSinceRefresh = now - this.lastRefresh

        // Token is valid if it's less than refresh interval old
        return timeSinceRefresh < this.refreshInterval
    }

    /**
     * Set CSRF token (for initial load or manual setting)
     * @param {string} token - CSRF token
     */
    setToken(token) {
        this.token = token
        this.lastRefresh = Date.now()
        logger.info('CSRF token set manually')
    }

    /**
     * Clear CSRF token
     */
    clearToken() {
        this.token = null
        this.lastRefresh = null
        this.refreshPromise = null
        logger.info('CSRF token cleared')
    }

    /**
     * Get current token without refreshing
     * @returns {string|null} Current CSRF token or null
     */
    getCurrentToken() {
        return this.token
    }

    /**
     * Check if we have a valid token
     * @returns {boolean} True if we have a valid token
     */
    hasValidToken() {
        return this.token !== null && this.isTokenValid()
    }

    /**
     * Force refresh token (useful for logout/login scenarios)
     * @returns {Promise<string>} New CSRF token
     */
    async forceRefresh() {
        this.clearToken()
        return this.getToken()
    }
}

// Create singleton instance
export const csrfManager = new CSRFManager()

// Export the class for testing
export { CSRFManager }
