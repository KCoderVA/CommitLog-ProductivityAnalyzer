/**
 * Online Configuration - Configuration for the online version of the dashboard
 * This file contains settings and options specific to the GitHub Pages hosted version.
 */

const OnlineConfig = {
    // Application settings
    app: {
        name: 'Git Commit Productivity Analyzer',
        version: '0.1.15',
        environment: 'online',
        debug: false,
        baseUrl: 'https://kcoderva.github.io/CommitLog-ProductivityAnalyzer' // GitHub Pages URL
    },

    // GitHub API settings
    github: {
        apiBaseUrl: 'https://api.github.com',
        rateLimit: {
            requestsPerHour: 60, // Unauthenticated GitHub API limit
            requestsPerMinute: 10,
            retryAfter: 3600 // Seconds to wait after rate limit hit
        },
        defaultBranch: 'main',
        maxCommitsPerRequest: 30,
        maxPagesPerAnalysis: 10,
        requestTimeout: 30000, // 30 seconds
        enableCaching: true,
        cacheDuration: 5 * 60 * 1000 // 5 minutes
    },

    // API security settings (for future authentication)
    api: {
        enableAuthentication: false,
        personalAccessToken: null, // Would be set by user if needed
        useTokenFromStorage: false,
        tokenStorageKey: 'github-token'
    },

    // UI settings
    ui: {
        theme: 'light', // 'light' or 'dark'
        animationsEnabled: true,
        autoRefresh: false,
        showAdvancedMetrics: true,
        defaultView: 'summary', // 'summary' or 'detailed'
        showRateLimitInfo: true,
        enableNotifications: true
    },

    // Chart settings
    charts: {
        defaultType: 'bar', // 'bar', 'line', 'pie'
        animationDuration: 300,
        colors: {
            primary: '#3498db',
            secondary: '#2ecc71',
            tertiary: '#e74c3c',
            quaternary: '#f39c12',
            accent: '#9b59b6'
        },
        maxDataPoints: 100,
        enableInteractivity: true
    },

    // Export settings
    export: {
        formats: ['json', 'csv'],
        includeCharts: false, // Could be enabled with additional libraries
        maxExportSize: 5 * 1024 * 1024, // 5MB
        defaultFilename: 'git-analysis-online'
    },

    // Performance settings
    performance: {
        enableWorkers: false, // Could be enabled for heavy processing
        batchSize: 25,
        debounceDelay: 500,
        maxConcurrentOperations: 3,
        enableCompression: true
    },

    // Security settings
    security: {
        allowFileAccess: false, // No local file access in online version
        sanitizeInput: true,
        validateUrls: true,
        maxUrlLength: 2048,
        enableCSP: true // Content Security Policy
    },

    // Cache settings
    cache: {
        enabled: true,
        maxSize: 10 * 1024 * 1024, // 10MB
        ttl: 10 * 60 * 1000, // 10 minutes
        keyPrefix: 'git-analyzer-online',
        useSessionStorage: false // Use localStorage by default
    },

    // Logging settings
    logging: {
        level: 'warn', // 'debug', 'info', 'warn', 'error'
        maxLogEntries: 50,
        logToConsole: true,
        logToStorage: false,
        enableAnalytics: false // Could be enabled for usage tracking
    },

    // Feature flags
    features: {
        localRepositoryAnalysis: false, // Not available in online version
        githubRepositoryAnalysis: true,
        advancedCharts: true,
        exportFunctionality: true,
        fileComparison: false,
        branchAnalysis: true,
        contributorAnalysis: true,
        timelineAnalysis: true,
        shareResults: true,
        bookmarkAnalysis: true
    },

    // Error handling
    errorHandling: {
        showUserFriendlyMessages: true,
        reportErrors: false,
        fallbackToBasicMode: true,
        retryAttempts: 3,
        enableErrorBoundary: true
    },

    // Accessibility
    accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReaderOptimized: true,
        keyboardNavigation: true,
        focusManagement: true
    },

    // Online-specific settings
    online: {
        enableServiceWorker: false, // Could be enabled for offline support
        enablePWA: false, // Progressive Web App features
        shareApiEnabled: false, // Web Share API
        enableUrlSharing: true,
        autoSaveAnalysis: true
    },

    // Analytics and tracking (placeholder for future implementation)
    analytics: {
        enabled: false,
        trackingId: null,
        trackPageViews: false,
        trackEvents: false,
        respectDoNotTrack: true
    }
};

// Initialize configuration based on environment and user preferences
function initializeOnlineConfig() {
    // Detect if running on GitHub Pages
    if (window.location.hostname.includes('github.io')) {
        OnlineConfig.app.baseUrl = window.location.origin;
        OnlineConfig.app.environment = 'production';
    }

    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('git-analyzer-online-preferences');
    if (savedPreferences) {
        try {
            const preferences = JSON.parse(savedPreferences);
            // Merge saved preferences with default config
            Object.assign(OnlineConfig.ui, preferences.ui || {});
            Object.assign(OnlineConfig.charts, preferences.charts || {});
            Object.assign(OnlineConfig.accessibility, preferences.accessibility || {});
            Object.assign(OnlineConfig.github, preferences.github || {});
        } catch (error) {
            console.warn('Failed to load saved preferences:', error);
        }
    }

    // Load GitHub token if stored and enabled
    if (OnlineConfig.api.useTokenFromStorage) {
        const storedToken = localStorage.getItem(OnlineConfig.api.tokenStorageKey);
        if (storedToken) {
            OnlineConfig.api.personalAccessToken = storedToken;
            OnlineConfig.api.enableAuthentication = true;
            OnlineConfig.github.rateLimit.requestsPerHour = 5000; // Authenticated limit
        }
    }

    // Detect user preferences
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        OnlineConfig.ui.theme = 'dark';
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        OnlineConfig.ui.animationsEnabled = false;
        OnlineConfig.accessibility.reducedMotion = true;
    }

    // Check for Web Share API support
    if ('share' in navigator) {
        OnlineConfig.online.shareApiEnabled = true;
    }

    // Apply configuration
    applyOnlineConfig();
}

// Apply configuration to the application
function applyOnlineConfig() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', OnlineConfig.ui.theme);

    // Apply accessibility settings
    if (OnlineConfig.accessibility.reducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0ms');
    }

    if (OnlineConfig.accessibility.highContrast) {
        document.documentElement.classList.add('high-contrast');
    }

    // Set up error handling
    if (OnlineConfig.errorHandling.reportErrors) {
        window.addEventListener('error', (event) => {
            console.error('Application error:', event.error);
            // Could send to error reporting service
        });
    }

    // Initialize analytics if enabled
    if (OnlineConfig.analytics.enabled && OnlineConfig.analytics.trackingId) {
        initializeAnalytics();
    }

    // Initialize logging
    if (OnlineConfig.logging.logToConsole) {
        console.log('Git Analyzer Online Configuration:', OnlineConfig);
    }

    // Set up Content Security Policy headers (if supported)
    if (OnlineConfig.security.enableCSP) {
        setupCSP();
    }
}

// Save user preferences
function saveOnlinePreferences(preferences) {
    try {
        const currentPreferences = JSON.parse(localStorage.getItem('git-analyzer-online-preferences') || '{}');
        const updatedPreferences = { ...currentPreferences, ...preferences };
        localStorage.setItem('git-analyzer-online-preferences', JSON.stringify(updatedPreferences));
        return true;
    } catch (error) {
        console.error('Failed to save preferences:', error);
        return false;
    }
}

// Store GitHub token securely
function setGitHubToken(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }

    try {
        localStorage.setItem(OnlineConfig.api.tokenStorageKey, token);
        OnlineConfig.api.personalAccessToken = token;
        OnlineConfig.api.enableAuthentication = true;
        OnlineConfig.github.rateLimit.requestsPerHour = 5000;
        return true;
    } catch (error) {
        console.error('Failed to store GitHub token:', error);
        return false;
    }
}

// Remove GitHub token
function removeGitHubToken() {
    try {
        localStorage.removeItem(OnlineConfig.api.tokenStorageKey);
        OnlineConfig.api.personalAccessToken = null;
        OnlineConfig.api.enableAuthentication = false;
        OnlineConfig.github.rateLimit.requestsPerHour = 60;
        return true;
    } catch (error) {
        console.error('Failed to remove GitHub token:', error);
        return false;
    }
}

// Get configuration value
function getOnlineConfigValue(path) {
    const keys = path.split('.');
    let value = OnlineConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return undefined;
        }
    }
    
    return value;
}

// Set configuration value
function setOnlineConfigValue(path, newValue) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = OnlineConfig;
    
    for (const key of keys) {
        if (!(key in target)) {
            target[key] = {};
        }
        target = target[key];
    }
    
    target[lastKey] = newValue;
}

// Initialize analytics (placeholder)
function initializeAnalytics() {
    // Placeholder for analytics initialization
    console.log('Analytics initialized with tracking ID:', OnlineConfig.analytics.trackingId);
}

// Set up Content Security Policy (placeholder)
function setupCSP() {
    // This would typically be done server-side, but can be set via meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
    cspMeta.setAttribute('content', "default-src 'self' https://api.github.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    document.head.appendChild(cspMeta);
}

// Check API rate limit status
async function checkRateLimit() {
    try {
        const headers = {};
        if (OnlineConfig.api.enableAuthentication && OnlineConfig.api.personalAccessToken) {
            headers['Authorization'] = `token ${OnlineConfig.api.personalAccessToken}`;
        }

        const response = await fetch(`${OnlineConfig.github.apiBaseUrl}/rate_limit`, { headers });
        if (response.ok) {
            const data = await response.json();
            return {
                remaining: data.rate.remaining,
                limit: data.rate.limit,
                reset: new Date(data.rate.reset * 1000),
                resetFormatted: new Date(data.rate.reset * 1000).toLocaleString()
            };
        }
    } catch (error) {
        console.error('Failed to check rate limit:', error);
    }
    
    return null;
}

// Reset configuration to defaults
function resetOnlineConfig() {
    localStorage.removeItem('git-analyzer-online-preferences');
    localStorage.removeItem(OnlineConfig.api.tokenStorageKey);
    location.reload(); // Reload to apply default configuration
}

// Export configuration functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OnlineConfig,
        initializeOnlineConfig,
        saveOnlinePreferences,
        setGitHubToken,
        removeGitHubToken,
        getOnlineConfigValue,
        setOnlineConfigValue,
        checkRateLimit,
        resetOnlineConfig
    };
} else {
    // Make configuration available globally
    window.OnlineConfig = OnlineConfig;
    window.initializeOnlineConfig = initializeOnlineConfig;
    window.saveOnlinePreferences = saveOnlinePreferences;
    window.setGitHubToken = setGitHubToken;
    window.removeGitHubToken = removeGitHubToken;
    window.getOnlineConfigValue = getOnlineConfigValue;
    window.setOnlineConfigValue = setOnlineConfigValue;
    window.checkRateLimit = checkRateLimit;
    window.resetOnlineConfig = resetOnlineConfig;
}

// Initialize configuration when script loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOnlineConfig);
    } else {
        initializeOnlineConfig();
    }
}
