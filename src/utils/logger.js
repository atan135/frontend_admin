// Browser-compatible logger implementation
class BrowserLogger {
    constructor(name) {
        this.name = name
        this.logs = []
        this.maxLogs = 1000 // Keep last 1000 logs in memory
    }

    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString()
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') : ''

        return `[${timestamp}] [${level.toUpperCase()}] ${this.name} - ${message}${formattedArgs}`
    }

    addToLogs(level, message, ...args) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            name: this.name,
            message,
            args: args.length > 0 ? args : undefined
        }

        this.logs.push(logEntry)

        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs)
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('app_logs', JSON.stringify(this.logs.slice(-100))) // Keep last 100 in localStorage
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    trace(message, ...args) {
        const formatted = this.formatMessage('trace', message, ...args)
        console.trace(formatted)
        this.addToLogs('trace', message, ...args)
    }

    debug(message, ...args) {
        const formatted = this.formatMessage('debug', message, ...args)
        console.debug(formatted)
        this.addToLogs('debug', message, ...args)
    }

    info(message, ...args) {
        const formatted = this.formatMessage('info', message, ...args)
        console.info(formatted)
        this.addToLogs('info', message, ...args)
    }

    warn(message, ...args) {
        const formatted = this.formatMessage('warn', message, ...args)
        console.warn(formatted)
        this.addToLogs('warn', message, ...args)
    }

    error(message, ...args) {
        const formatted = this.formatMessage('error', message, ...args)
        console.error(formatted)
        this.addToLogs('error', message, ...args)
    }

    fatal(message, ...args) {
        const formatted = this.formatMessage('fatal', message, ...args)
        console.error(formatted)
        this.addToLogs('fatal', message, ...args)
    }

    // Get all logs
    getLogs() {
        return this.logs
    }

    // Clear logs
    clearLogs() {
        this.logs = []
        localStorage.removeItem('app_logs')
    }

    // Export logs as JSON
    exportLogs() {
        return JSON.stringify(this.logs, null, 2)
    }
}

// Create logger instances
export const logger = new BrowserLogger('app')
export const errorLogger = new BrowserLogger('error')

// Log levels: trace, debug, info, warn, error, fatal
export const logLevels = {
    TRACE: 'trace',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
}
