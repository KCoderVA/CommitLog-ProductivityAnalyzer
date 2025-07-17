/**
 * Helper Utilities - Common utility functions for the application
 * This module provides various helper functions used throughout the application.
 */

const Helpers = {
    /**
     * Formats a number with thousands separators
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString();
    },

    /**
     * Formats bytes to human readable format
     * @param {number} bytes - Number of bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted size
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Formats a date to a relative time string
     * @param {string|Date} date - Date to format
     * @returns {string} Relative time string
     */
    formatRelativeTime(date) {
        const now = new Date();
        const target = new Date(date);
        const diffMs = now - target;
        
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffSeconds < 60) return 'just now';
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
        if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
        return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
    },

    /**
     * Formats a date to a human readable string
     * @param {string|Date} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date string
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        
        return new Date(date).toLocaleDateString('en-US', defaultOptions);
    },

    /**
     * Formats a duration in milliseconds to human readable format
     * @param {number} ms - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    },

    /**
     * Debounces a function call
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Whether to trigger immediately
     * @returns {Function} Debounced function
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttles a function call
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clones an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Generates a random ID
     * @param {number} length - Length of the ID
     * @returns {string} Random ID
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Validates an email address
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validates a URL
     * @param {string} url - URL to validate
     * @returns {boolean} Whether URL is valid
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Capitalizes the first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Converts camelCase to kebab-case
     * @param {string} str - String to convert
     * @returns {string} Kebab-case string
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    },

    /**
     * Converts kebab-case to camelCase
     * @param {string} str - String to convert
     * @returns {string} CamelCase string
     */
    kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    },

    /**
     * Truncates text to a specified length
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Suffix to add when truncated
     * @returns {string} Truncated text
     */
    truncateText(text, length, suffix = '...') {
        if (!text || text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    },

    /**
     * Escapes HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Unescapes HTML characters
     * @param {string} html - HTML to unescape
     * @returns {string} Unescaped text
     */
    unescapeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    },

    /**
     * Calculates percentage with optional decimal places
     * @param {number} part - Part value
     * @param {number} total - Total value
     * @param {number} decimals - Number of decimal places
     * @returns {number} Percentage
     */
    calculatePercentage(part, total, decimals = 1) {
        if (total === 0) return 0;
        const percentage = (part / total) * 100;
        return Math.round(percentage * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    /**
     * Sorts an array of objects by a property
     * @param {Array} array - Array to sort
     * @param {string} property - Property to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     * @returns {Array} Sorted array
     */
    sortByProperty(array, property, direction = 'asc') {
        return array.sort((a, b) => {
            const aVal = this.getNestedProperty(a, property);
            const bVal = this.getNestedProperty(b, property);
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Gets a nested property from an object using dot notation
     * @param {Object} obj - Object to get property from
     * @param {string} path - Property path (e.g., 'user.profile.name')
     * @returns {*} Property value
     */
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },

    /**
     * Sets a nested property on an object using dot notation
     * @param {Object} obj - Object to set property on
     * @param {string} path - Property path (e.g., 'user.profile.name')
     * @param {*} value - Value to set
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    },

    /**
     * Groups an array of objects by a property
     * @param {Array} array - Array to group
     * @param {string} property - Property to group by
     * @returns {Object} Grouped object
     */
    groupBy(array, property) {
        return array.reduce((groups, item) => {
            const key = this.getNestedProperty(item, property);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {});
    },

    /**
     * Creates a simple hash from a string
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    createHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    },

    /**
     * Downloads data as a file
     * @param {string} data - Data to download
     * @param {string} filename - Filename
     * @param {string} type - MIME type
     */
    downloadAsFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Copies text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    },

    /**
     * Creates a delay/sleep function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Retries a function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} baseDelay - Base delay in milliseconds
     * @returns {Promise} Promise that resolves with function result
     */
    async retry(fn, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < maxRetries) {
                    const delay = baseDelay * Math.pow(2, i);
                    await this.delay(delay);
                }
            }
        }
        
        throw lastError;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helpers;
} else {
    window.Helpers = Helpers;
}
