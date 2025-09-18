// Application configuration
export const config = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    API_TIMEOUT: 10000,

    // App Configuration
    APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Vue3 Admin Management',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Development Settings
    DEV_PORT: import.meta.env.VITE_DEV_PORT || 3000,
    API_DEV_PORT: import.meta.env.VITE_API_DEV_PORT || 4000,

    // Pagination
    DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10,
    PAGE_SIZE_OPTIONS: (import.meta.env.VITE_PAGE_SIZE_OPTIONS || '10,20,50,100').split(','),

    // Upload Configuration
    MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2MB
    ALLOWED_FILE_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),

    // Logging
    LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
    LOG_MAX_SIZE: parseInt(import.meta.env.VITE_LOG_MAX_SIZE) || 10 * 1024 * 1024, // 10MB
    LOG_MAX_FILES: parseInt(import.meta.env.VITE_LOG_MAX_FILES) || 5
}

export default config
