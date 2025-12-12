// Configuration File for Lottery Pattern Analyzer
// Version: 2.0.0

const CONFIG = {
    // Application Information
    APP: {
        NAME: 'Lottery Pattern Analyzer',
        VERSION: '2.0.0',
        AUTHOR: 'LotteryUpdate000',
        YEAR: new Date().getFullYear(),
        URL: 'https://lotteryupdate000.space',
        EMAIL: 'crypto123432@yahoo.com',
        REDDIT: 'https://www.reddit.com/user/Mysterious-Bottle-44/'
    },
    
    // Default Settings
    DEFAULTS: {
        MAX_NUMBER: 69,
        NUMBER_COUNT: 6,
        GENERATION_METHOD: 'pattern',
        PRESET: 'custom',
        THEME: 'light'
    },
    
    // Lottery Game Presets
    PRESETS: {
        POWERBALL: {
            name: 'Powerball',
            maxNumber: 69,
            numberCount: 5,
            powerballRange: 26,
            description: 'US Powerball (5 numbers from 1-69, Powerball 1-26)'
        },
        MEGA_MILLIONS: {
            name: 'Mega Millions',
            maxNumber: 70,
            numberCount: 5,
            megaBallRange: 25,
            description: 'US Mega Millions (5 numbers from 1-70, Mega Ball 1-25)'
        },
        EURO_MILLIONS: {
            name: 'EuroMillions',
            maxNumber: 50,
            numberCount: 5,
            luckyStars: 12,
            description: 'EuroMillions (5 numbers from 1-50, 2 Lucky Stars 1-12)'
        },
        CUSTOM: {
            name: 'Custom',
            description: 'Customize your own lottery game'
        }
    },
    
    // Generation Methods
    METHODS: {
        PATTERN: {
            id: 'pattern',
            name: 'Pattern-Based',
            description: 'Uses frequency analysis to weight number selection',
            icon: '🎯'
        },
        BALANCED: {
            id: 'balanced',
            name: 'Balanced Set',
            description: 'Creates well-distributed combinations',
            icon: '⚖️'
        },
        RANDOM: {
            id: 'random',
            name: 'True Random',
            description: 'Completely random number selection',
            icon: '🎲'
        }
    },
    
    // Heatmap Configuration
    HEATMAP: {
        CATEGORIES: {
            HOT: {
                name: 'Hot',
                threshold: 0.7,
                color: '#ff5252',
                description: 'High frequency numbers'
            },
            WARM: {
                name: 'Warm',
                threshold: 0.5,
                color: '#ff9800',
                description: 'Above average frequency'
            },
            COOL: {
                name: 'Cool',
                threshold: 0.3,
                color: '#2196f3',
                description: 'Below average frequency'
            },
            COLD: {
                name: 'Cold',
                threshold: 0,
                color: '#9e9e9e',
                description: 'Low frequency numbers'
            }
        },
        GRID_COLUMNS: 10
    },
    
    // Validation Rules
    VALIDATION: {
        MAX_NUMBER: {
            MIN: 10,
            MAX: 100,
            MESSAGE: 'Number range must be between 10 and 100'
        },
        NUMBER_COUNT: {
            MIN: 1,
            MAX: 15,
            MESSAGE: 'Number count must be between 1 and 15'
        }
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        PREFERENCES: 'lottery_preferences_v2',
        STATISTICS: 'lottery_statistics_v2',
        SAVED_NUMBERS: 'lottery_saved_numbers_v2',
        CONSENT: 'lottery_consent_v2',
        THEME: 'lottery_theme_v2'
    },
    
    // Analytics Configuration
    ANALYTICS: {
        ENABLED: true,
        ENDPOINT: null, // Set to your analytics endpoint
        CONSENT_REQUIRED: true,
        EVENTS: {
            PAGE_VIEW: 'page_view',
            NUMBERS_GENERATED: 'numbers_generated',
            SETTINGS_CHANGED: 'settings_changed',
            EXPORT: 'export',
            SHARE: 'share',
            ERROR: 'error'
        }
    },
    
    // Performance Configuration
    PERFORMANCE: {
        LAZY_LOAD_THRESHOLD: 300, // pixels
        DEBOUNCE_DELAY: 300, // ms
        CACHE_TTL: 3600000, // 1 hour in ms
        MAX_GENERATED_SETS: 50,
        MAX_SAVED_SETS: 100
    },
    
    // Feature Flags
    FEATURES: {
        PWA: true,
        OFFLINE_SUPPORT: true,
        THEME_TOGGLE: true,
        EXPORT: true,
        SHARE: true,
        KEYBOARD_SHORTCUTS: true,
        ANALYTICS: true,
        TUTORIAL: true,
        CONSENT_BANNER: true
    },
    
    // Error Messages
    ERRORS: {
        GENERIC: 'An error occurred. Please try again.',
        NETWORK: 'Network error. Please check your connection.',
        STORAGE: 'Unable to save data. Storage may be full.',
        VALIDATION: 'Please check your input values.',
        OFFLINE: 'You are offline. Some features may be limited.'
    },
    
    // Success Messages
    SUCCESS: {
        GENERATED: 'Numbers generated successfully!',
        SAVED: 'Settings saved successfully!',
        COPIED: 'Copied to clipboard!',
        EXPORTED: 'Numbers exported successfully!',
        SHARED: 'Numbers shared successfully!',
        RESET: 'Reset completed successfully!'
    },
    
    // UI Text
    UI: {
        LOADING: 'Loading...',
        GENERATING: 'Generating numbers...',
        SAVING: 'Saving...',
        NO_NUMBERS: 'No numbers generated yet',
        SELECT_NUMBERS: 'Select numbers by clicking on the heatmap',
        READY: 'Ready to generate numbers!'
    },
    
    // API Endpoints (for future expansion)
    API: {
        BASE_URL: 'https://api.lotteryupdate000.space',
        ENDPOINTS: {
            VALIDATE: '/validate',
            STATISTICS: '/statistics',
            BACKUP: '/backup'
        },
        VERSION: 'v1'
    },
    
    // Security Configuration
    SECURITY: {
        CSP: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
        FEATURE_POLICY: "geolocation 'none'; microphone 'none'; camera 'none'",
        PERMISSIONS_POLICY: "geolocation=(), microphone=(), camera=()"
    },
    
    // Maintenance Settings
    MAINTENANCE: {
        AUTO_BACKUP: true,
        BACKUP_INTERVAL: 86400000, // 24 hours
        CLEANUP_INTERVAL: 604800000, // 7 days
        MAX_LOG_SIZE: 1000 // entries
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.LotteryConfig = CONFIG;
