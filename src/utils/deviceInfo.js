// Device and Location Information Utility

/**
 * Get comprehensive device information
 * @returns {Object} Device information object
 */
export const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const language = navigator.language
    const screenWidth = screen.width
    const screenHeight = screen.height
    const colorDepth = screen.colorDepth
    const pixelRatio = window.devicePixelRatio || 1
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Detect device type
    let deviceType = 'desktop'
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        deviceType = 'mobile'
    } else if (/iPad|Android/i.test(userAgent)) {
        deviceType = 'tablet'
    }

    // Detect browser
    let browser = 'unknown'
    let browserVersion = 'unknown'

    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
        browser = 'Chrome'
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
        if (match) browserVersion = match[1]
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox'
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
        if (match) browserVersion = match[1]
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari'
        const match = userAgent.match(/Version\/(\d+\.\d+)/)
        if (match) browserVersion = match[1]
    } else if (userAgent.includes('Edge')) {
        browser = 'Edge'
        const match = userAgent.match(/Edge\/(\d+\.\d+)/)
        if (match) browserVersion = match[1]
    } else if (userAgent.includes('Opera')) {
        browser = 'Opera'
        const match = userAgent.match(/Opera\/(\d+\.\d+)/)
        if (match) browserVersion = match[1]
    }

    // Detect OS
    let os = 'unknown'
    let osVersion = 'unknown'

    if (userAgent.includes('Windows NT')) {
        os = 'Windows'
        const match = userAgent.match(/Windows NT (\d+\.\d+)/)
        if (match) {
            const version = match[1]
            if (version === '10.0') osVersion = '10'
            else if (version === '6.3') osVersion = '8.1'
            else if (version === '6.2') osVersion = '8'
            else if (version === '6.1') osVersion = '7'
            else osVersion = version
        }
    } else if (userAgent.includes('Mac OS X')) {
        os = 'macOS'
        const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
        if (match) osVersion = match[1].replace('_', '.')
    } else if (userAgent.includes('Linux')) {
        os = 'Linux'
    } else if (userAgent.includes('Android')) {
        os = 'Android'
        const match = userAgent.match(/Android (\d+\.\d+)/)
        if (match) osVersion = match[1]
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS'
        const match = userAgent.match(/OS (\d+[._]\d+)/)
        if (match) osVersion = match[1].replace('_', '.')
    }

    // Get additional browser capabilities
    const capabilities = {
        cookies: navigator.cookieEnabled,
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webGL: !!document.createElement('canvas').getContext('webgl'),
        webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }

    return {
        userAgent,
        platform,
        language,
        screenWidth,
        screenHeight,
        colorDepth,
        pixelRatio,
        timezone,
        deviceType,
        browser,
        browserVersion,
        os,
        osVersion,
        capabilities,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || null
    }
}

/**
 * Get location information (if available)
 * @returns {Promise<Object>} Location information object
 */
export const getLocationInfo = async () => {
    try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            throw new Error('Geolocation not supported')
        }

        // Get current position with timeout
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    timeout: 10000,
                    enableHighAccuracy: false,
                    maximumAge: 300000 // 5 minutes
                }
            )
        })

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date().toISOString(),
            source: 'geolocation'
        }
    } catch (error) {
        // Fallback to IP-based location (if available)
        try {
            const response = await fetch('https://ipapi.co/json/')
            const data = await response.json()

            return {
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: null,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
                timestamp: new Date().toISOString(),
                source: 'ip',
                city: data.city,
                region: data.region,
                country: data.country,
                countryCode: data.country_code,
                timezone: data.timezone,
                error: null
            }
        } catch (ipError) {
            return {
                latitude: null,
                longitude: null,
                accuracy: null,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
                timestamp: new Date().toISOString(),
                source: 'none',
                error: error.message,
                ipError: ipError.message
            }
        }
    }
}

/**
 * Generate a unique session ID
 * @returns {string} Session ID
 */
export const generateSessionId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const userAgent = navigator.userAgent.slice(-5)
    return `session_${timestamp}_${random}_${userAgent}`
}

/**
 * Get network information (if available)
 * @returns {Object} Network information
 */
export const getNetworkInfo = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (connection) {
        return {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
            type: connection.type
        }
    }

    return {
        effectiveType: 'unknown',
        downlink: null,
        rtt: null,
        saveData: null,
        type: 'unknown'
    }
}

/**
 * Get comprehensive client information
 * @returns {Promise<Object>} Complete client information
 */
export const getClientInfo = async () => {
    const deviceInfo = getDeviceInfo()
    const locationInfo = await getLocationInfo()
    const networkInfo = getNetworkInfo()

    return {
        device: deviceInfo,
        location: locationInfo,
        network: networkInfo,
        sessionId: generateSessionId(),
        timestamp: new Date().toISOString()
    }
}
