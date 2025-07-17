/**
 * Copyright 2025 KCoderVA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Offline Configuration - Configuration for the offline version of the dashboard
 * This file contains settings and options specific to the offline version.
 */

const OfflineConfig = {
    // Application settings
    app: {
        name: 'Git Commit Productivity Analyzer',
        version: '1.0.0',
        environment: 'offline',
        debug: false
    },

    // File handling settings
    fileHandler: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        supportedFormats: ['.git', '.json', '.csv', '.txt'],
        maxCommitsToProcess: 1000,
        enableFileSystemAPI: true // Use modern File System Access API if available
    },

    // Git analysis settings
    gitAnalysis: {
        maxBranches: 10,
        maxCommitHistory: 500,
        includeUntracked: false,
        parseCommitStats: true,
        enableFileAnalysis: true
    },

    // UI settings
    ui: {
        theme: 'light', // 'light' or 'dark'
        animationsEnabled: true,
        autoRefresh: false,
        showAdvancedMetrics: true,
        defaultView: 'summary' // 'summary' or 'detailed'
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
        maxDataPoints: 100
    },

    // Export settings
    export: {
        formats: ['json', 'csv'],
        includeCharts: false, // Charts not available in offline export
        maxExportSize: 10 * 1024 * 1024, // 10MB
        defaultFilename: 'git-analysis-offline'
    },

    // Performance settings
    performance: {
        enableWorkers: false, // Web Workers not needed for offline
        batchSize: 50,
        debounceDelay: 300,
        maxConcurrentOperations: 3
    },

    // Security settings
    security: {
        allowFileAccess: true,
        sanitizeInput: true,
        validateFileTypes: true,
        maxPathLength: 260 // Windows path limit
    },

    // Cache settings
    cache: {
        enabled: true,
        maxSize: 5 * 1024 * 1024, // 5MB
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        keyPrefix: 'git-analyzer-offline'
    },

    // Logging settings
    logging: {
        level: 'warn', // 'debug', 'info', 'warn', 'error'
        maxLogEntries: 100,
        logToConsole: true,
        logToStorage: false
    },

    // Feature flags
    features: {
        localRepositoryAnalysis: true,
        githubRepositoryAnalysis: true,
        advancedCharts: true,
        exportFunctionality: true,
        fileComparison: false,
        branchAnalysis: true,
        contributorAnalysis: true,
        timelineAnalysis: true
    },

    // Error handling
    errorHandling: {
        showUserFriendlyMessages: true,
        reportErrors: false,
        fallbackToBasicMode: true,
        retryAttempts: 3
    },

    // Accessibility
    accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReaderOptimized: true,
        keyboardNavigation: true
    },

    // Offline-specific settings
    offline: {
        storageType: 'localStorage', // 'localStorage' or 'indexedDB'
        enableOfflineMode: true,
        showOfflineIndicator: true,
        syncWhenOnline: false
    }
};

// Initialize configuration based on user preferences
function initializeOfflineConfig() {
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('git-analyzer-preferences');
    if (savedPreferences) {
        try {
            const preferences = JSON.parse(savedPreferences);
            // Merge saved preferences with default config
            Object.assign(OfflineConfig.ui, preferences.ui || {});
            Object.assign(OfflineConfig.charts, preferences.charts || {});
            Object.assign(OfflineConfig.accessibility, preferences.accessibility || {});
        } catch (error) {
            console.warn('Failed to load saved preferences:', error);
        }
    }

    // Detect user preferences
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        OfflineConfig.ui.theme = 'dark';
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        OfflineConfig.ui.animationsEnabled = false;
        OfflineConfig.accessibility.reducedMotion = true;
    }

    // Check for File System Access API support
    if (!('showDirectoryPicker' in window)) {
        OfflineConfig.fileHandler.enableFileSystemAPI = false;
    }

    // Apply configuration
    applyOfflineConfig();
}

// Apply configuration to the application
function applyOfflineConfig() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', OfflineConfig.ui.theme);

    // Apply accessibility settings
    if (OfflineConfig.accessibility.reducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0ms');
    }

    if (OfflineConfig.accessibility.highContrast) {
        document.documentElement.classList.add('high-contrast');
    }

    // Set up error handling
    if (OfflineConfig.errorHandling.reportErrors) {
        window.addEventListener('error', (event) => {
            console.error('Application error:', event.error);
        });
    }

    // Initialize logging
    if (OfflineConfig.logging.logToConsole) {
        console.log('Git Analyzer Offline Configuration:', OfflineConfig);
    }
}

// Save user preferences
function saveOfflinePreferences(preferences) {
    try {
        const currentPreferences = JSON.parse(localStorage.getItem('git-analyzer-preferences') || '{}');
        const updatedPreferences = { ...currentPreferences, ...preferences };
        localStorage.setItem('git-analyzer-preferences', JSON.stringify(updatedPreferences));
        return true;
    } catch (error) {
        console.error('Failed to save preferences:', error);
        return false;
    }
}

// Get configuration value
function getOfflineConfigValue(path) {
    const keys = path.split('.');
    let value = OfflineConfig;
    
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
function setOfflineConfigValue(path, newValue) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = OfflineConfig;
    
    for (const key of keys) {
        if (!(key in target)) {
            target[key] = {};
        }
        target = target[key];
    }
    
    target[lastKey] = newValue;
}

// Reset configuration to defaults
function resetOfflineConfig() {
    localStorage.removeItem('git-analyzer-preferences');
    location.reload(); // Reload to apply default configuration
}

// Export configuration functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OfflineConfig,
        initializeOfflineConfig,
        saveOfflinePreferences,
        getOfflineConfigValue,
        setOfflineConfigValue,
        resetOfflineConfig
    };
} else {
    // Make configuration available globally
    window.OfflineConfig = OfflineConfig;
    window.initializeOfflineConfig = initializeOfflineConfig;
    window.saveOfflinePreferences = saveOfflinePreferences;
    window.getOfflineConfigValue = getOfflineConfigValue;
    window.setOfflineConfigValue = setOfflineConfigValue;
    window.resetOfflineConfig = resetOfflineConfig;
}

// Initialize configuration when script loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOfflineConfig);
    } else {
        initializeOfflineConfig();
    }
}
