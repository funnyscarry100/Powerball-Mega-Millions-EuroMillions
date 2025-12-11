// Privacy-Focused Analytics for Lottery Pattern Analyzer

class LotteryAnalytics {
    constructor(config = {}) {
        this.config = {
            endpoint: config.endpoint || '/api/analytics',
            sessionDuration: config.sessionDuration || 1800000, // 30 minutes
            maxEvents: config.maxEvents || 100,
            consentRequired: config.consentRequired !== false,
            debug: config.debug || false
        };
        
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.sessionStart = Date.now();
        this.pageViewSent = false;
        this.consent = this.getConsent();
        
        // Initialize if consent given
        if (this.consent) {
            this.init();
        }
    }
    
    // Generate unique session ID
    generateSessionId() {
        let id = localStorage.getItem('lottery_session_id');
        if (!id) {
            id = 'sesh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('lottery_session_id', id);
        }
        return id;
    }
    
    // Get user consent
    getConsent() {
        // Check Do Not Track
        if (navigator.doNotTrack === '1') {
            return false;
        }
        
        // Check localStorage
        const consent = localStorage.getItem('lottery_analytics_consent');
        return consent === 'true' || consent === null; // null = implied consent
    }
    
    // Initialize analytics
    init() {
        if (!this.consent) return;
        
        // Track initial pageview
        this.trackPageView();
        
        // Track generator usage
        this.trackGeneratorEvents();
        
        // Track errors
        this.trackErrors();
        
        // Track settings changes
        this.trackSettings();
        
        // Track exports and shares
        this.trackExports();
        
        // Session heartbeat
        this.startSessionHeartbeat();
        
        if (this.config.debug) {
            console.log('📊 Analytics initialized:', this.sessionId);
        }
    }
    
    // Track page view
    trackPageView() {
        if (this.pageViewSent) return;
        
        const data = {
            type: 'pageview',
            session: this.sessionId,
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            screen: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timestamp: new Date().toISOString(),
            performance: this.getPerformanceMetrics()
        };
        
        this.send(data);
        this.pageViewSent = true;
    }
    
    // Track custom event
    trackEvent(name, properties = {}) {
        if (!this.consent) return;
        
        const data = {
            type: 'event',
            session: this.sessionId,
            name: name,
            properties: this.sanitizeProperties(properties),
            timestamp: new Date().toISOString()
        };
        
        this.queueEvent(data);
        
        if (this.config.debug) {
            console.log('📊 Event tracked:', name, properties);
        }
    }
    
    // Track generator events
    trackGeneratorEvents() {
        // Track button clicks
        const buttons = document.querySelectorAll('.analyzer-btn, .quick-btn, .preset-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.trim() || 
                              e.target.getAttribute('onclick') || 
                              e.target.dataset.preset;
                this.trackEvent('generator_click', { action });
            });
        });
        
        // Track number generation
        const originalGenerate = window.generateNumbers;
        if (originalGenerate) {
            window.generateNumbers = function(type) {
                const result = originalGenerate(type);
                if (window.lotteryAnalytics) {
                    window.lotteryAnalytics.trackEvent('numbers_generated', {
                        type: type,
                        count: result ? result.length : 0,
                        method: 'direct'
                    });
                }
                return result;
            };
        }
    }
    
    // Track settings changes
    trackSettings() {
        const inputs = document.querySelectorAll('#maxNumber, #numberCount, #generationMethod');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.trackEvent('setting_changed', {
                    setting: e.target.id,
                    value: e.target.value
                });
            });
        });
        
        // Track preset changes
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.trackEvent('preset_changed', { preset });
            });
        });
    }
    
    // Track exports and shares
    trackExports() {
        // Override export function
        const originalExport = window.exportNumbers;
        if (originalExport) {
            window.exportNumbers = function() {
                if (window.lotteryAnalytics) {
                    window.lotteryAnalytics.trackEvent('export', { type: 'json' });
                }
                return originalExport();
            };
        }
        
        // Override share function
        const originalShare = window.shareNumbers;
        if (originalShare) {
            window.shareNumbers = function() {
                if (window.lotteryAnalytics) {
                    window.lotteryAnalytics.trackEvent('share', { method: 'web_share' });
                }
                return originalShare();
            };
        }
    }
    
    // Track errors
    trackErrors() {
        window.addEventListener('error', (e) => {
            this.trackEvent('error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                type: 'unhandled_error'
            });
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('error', {
                reason: e.reason?.message || String(e.reason),
                type: 'unhandled_promise_rejection'
            });
        });
    }
    
    // Start session heartbeat
    startSessionHeartbeat() {
        setInterval(() => {
            const now = Date.now();
            const duration = now - this.sessionStart;
            
            if (duration >= this.config.sessionDuration) {
                // Session expired, create new one
                this.sessionId = this.generateSessionId();
                this.sessionStart = now;
                this.pageViewSent = false;
                this.trackPageView();
            }
        }, 60000); // Check every minute
    }
    
    // Queue event for batch sending
    queueEvent(data) {
        this.events.push(data);
        
        // Send immediately for important events
        if (['error', 'pageview'].includes(data.type)) {
            this.send(data);
        } else if (this.events.length >= 5) {
            // Send batch
            this.sendBatch();
        } else {
            // Schedule batch send
            clearTimeout(this.batchTimeout);
            this.batchTimeout = setTimeout(() => this.sendBatch(), 5000);
        }
    }
    
    // Send batch of events
    sendBatch() {
        if (this.events.length === 0) return;
        
        const batch = this.events.slice();
        this.events = [];
        
        this.send({ type: 'batch', events: batch });
    }
    
    // Send data to endpoint
    send(data) {
        if (!this.config.endpoint || !this.consent) return;
        
        // Use sendBeacon for reliability
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon(this.config.endpoint, blob);
        } else {
            // Fallback to fetch
            fetch(this.config.endpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: true
            }).catch(error => {
                console.error('Analytics send failed:', error);
                // Requeue events on failure
                if (data.type === 'batch') {
                    this.events.push(...data.events);
                } else {
                    this.events.push(data);
                }
            });
        }
    }
    
    // Get performance metrics
    getPerformanceMetrics() {
        if (!window.performance || !window.performance.timing) return null;
        
        const timing = window.performance.timing;
        const navigation = window.performance.navigation || {};
        
        return {
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            redirectCount: navigation.redirectCount || 0,
            type: navigation.type || 0
        };
    }
    
    // Sanitize properties (remove PII)
    sanitizeProperties(properties) {
        const sanitized = { ...properties };
        
        // Remove any potential PII
        delete sanitized.email;
        delete sanitized.name;
        delete sanitized.phone;
        delete sanitized.address;
        delete sanitized.ip;
        
        // Truncate long strings
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'string' && sanitized[key].length > 500) {
                sanitized[key] = sanitized[key].substring(0, 500) + '...';
            }
        });
        
        return sanitized;
    }
    
    // Get analytics report
    getReport() {
        return {
            sessionId: this.sessionId,
            eventsCount: this.events.length,
            sessionDuration: Date.now() - this.sessionStart,
            consent: this.consent
        };
    }
    
    // Opt in to analytics
    optIn() {
        localStorage.setItem('lottery_analytics_consent', 'true');
        this.consent = true;
        this.init();
    }
    
    // Opt out of analytics
    optOut() {
        localStorage.setItem('lottery_analytics_consent', 'false');
        this.consent = false;
        this.events = [];
    }
    
    // Clear all analytics data
    clear() {
        localStorage.removeItem('lottery_session_id');
        localStorage.removeItem('lottery_analytics_consent');
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.sessionStart = Date.now();
        this.pageViewSent = false;
    }
}

// Initialize analytics globally
document.addEventListener('DOMContentLoaded', () => {
    window.lotteryAnalytics = new LotteryAnalytics({
        endpoint: CONFIG?.ANALYTICS?.ENDPOINT,
        consentRequired: CONFIG?.ANALYTICS?.CONSENT_REQUIRED !== false,
        debug: window.location.hostname === 'localhost'
    });
    
    // Expose public methods
    window.LotteryAnalytics = {
        optIn: () => window.lotteryAnalytics.optIn(),
        optOut: () => window.lotteryAnalytics.optOut(),
        getReport: () => window.lotteryAnalytics.getReport(),
        clear: () => window.lotteryAnalytics.clear()
    };
});
