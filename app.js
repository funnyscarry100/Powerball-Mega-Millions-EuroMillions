// Lottery Pattern Analyzer - Main Application
// Version: 2.0.0

// ===== GLOBAL STATE =====
let heatmapData = [];
let selectedNumbers = new Set();
let generatedSets = [];
let currentPreset = 'custom';
let maxNumber = 69;
let numberCount = 6;
let generationMethod = 'pattern';
let statistics = {
    totalGenerations: 0,
    patternTypeCounts: { pattern: 0, balanced: 0, random: 0 },
    numberFrequency: {},
    lastGenerated: null
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Lottery Pattern Analyzer v2.0.0 initializing...');
    
    // Initialize core components
    initializeCore();
    initializeUI();
    initializeEventListeners();
    initializeAnalytics();
    
    // Show main content after loading
    setTimeout(() => {
        document.getElementById('loading-skeleton').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        showToast('🎯 Ready to generate lottery numbers!', 'success');
    }, 500);
});

// ===== CORE INITIALIZATION =====
function initializeCore() {
    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    document.getElementById('app-version').textContent = '2.0.0';
    
    // Load saved preferences
    loadPreferences();
    
    // Initialize heatmap data
    initializeHeatmapData();
    
    // Load statistics
    loadStatistics();
    
    // Update time display
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
}

function initializeUI() {
    // Generate initial heatmap
    generateHeatmap();
    
    // Update pattern stats
    updatePatternStats();
    
    // Update real-time stats
    updateRealTimeStats();
    
    // Setup theme
    setupTheme();
    
    // Setup PWA installation
    setupPWAInstall();
    
    // Setup number selection
    setupNumberSelection();
}

function initializeEventListeners() {
    // Window events
    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Form inputs
    document.getElementById('maxNumber').addEventListener('change', validateInputs);
    document.getElementById('numberCount').addEventListener('change', validateInputs);
    document.getElementById('generationMethod').addEventListener('change', (e) => {
        generationMethod = e.target.value;
        savePreferences();
    });
}

// ===== HEATMAP FUNCTIONS =====
function initializeHeatmapData() {
    heatmapData = [];
    
    // Create frequency data with realistic patterns
    for (let i = 1; i <= maxNumber; i++) {
        let frequency;
        
        // Simulate real lottery patterns
        if (i <= 10) {
            frequency = 0.1 + Math.random() * 0.7; // Low numbers often overplayed
        } else if (i <= 30) {
            frequency = 0.3 + Math.random() * 0.5; // Mid-range numbers
        } else if (i <= 50) {
            frequency = 0.2 + Math.random() * 0.4; // Higher numbers
        } else {
            frequency = Math.random() * 0.3; // Highest numbers
        }
        
        // Add some clusters (hot numbers)
        if ([7, 11, 23, 32, 42, 56].includes(i)) {
            frequency += 0.4;
        }
        
        // Add some cold numbers
        if ([13, 26, 39, 52, 65].includes(i)) {
            frequency *= 0.5;
        }
        
        frequency = Math.max(0.1, Math.min(1, frequency));
        
        heatmapData.push({
            number: i,
            frequency: frequency,
            category: getCategoryFromFrequency(frequency),
            selected: false
        });
    }
}

function getCategoryFromFrequency(frequency) {
    if (frequency > 0.7) return 'hot';
    if (frequency > 0.5) return 'warm';
    if (frequency > 0.3) return 'cool';
    return 'cold';
}

function generateHeatmap() {
    const container = document.getElementById('heatmap');
    if (!container) return;
    
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    heatmapData.forEach(item => {
        const cell = document.createElement('div');
        cell.className = `number-cell ${item.category} ${selectedNumbers.has(item.number) ? 'selected' : ''}`;
        cell.textContent = item.number;
        cell.title = `Number ${item.number} - ${item.category.charAt(0).toUpperCase() + item.category.slice(1)} frequency`;
        cell.dataset.number = item.number;
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', `Number ${item.number}, ${item.category} frequency`);
        
        fragment.appendChild(cell);
    });
    
    container.appendChild(fragment);
}

function setupNumberSelection() {
    document.addEventListener('click', function(e) {
        const cell = e.target.closest('.number-cell');
        if (cell) {
            const number = parseInt(cell.dataset.number);
            toggleNumberSelection(number);
        }
    });
    
    // Keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('number-cell')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const number = parseInt(e.target.dataset.number);
                toggleNumberSelection(number);
            }
        }
    });
}

function toggleNumberSelection(number) {
    if (selectedNumbers.has(number)) {
        selectedNumbers.delete(number);
    } else {
        selectedNumbers.add(number);
        if (selectedNumbers.size > numberCount) {
            // Remove oldest selection if we exceed count
            const first = selectedNumbers.values().next().value;
            selectedNumbers.delete(first);
        }
    }
    
    // Update heatmap
    generateHeatmap();
    
    // Update stats
    updatePatternStats();
    
    showToast(`Number ${number} ${selectedNumbers.has(number) ? 'added to' : 'removed from'} selection`, 'info');
}

// ===== NUMBER GENERATION =====
function generatePatternBased() {
    generateNumbers('pattern');
}

function generateBalanced() {
    generateNumbers('balanced');
}

function generateRandom() {
    generateNumbers('random');
}

function quickGenerate(count) {
    const results = [];
    for (let i = 0; i < count; i++) {
        const numbers = generateNumberSet(generationMethod);
        results.push(numbers);
    }
    displayMultipleSets(results);
}

function generateNumbers(type) {
    // Validate inputs
    if (!validateInputs()) return;
    
    // Track statistics
    statistics.totalGenerations++;
    statistics.patternTypeCounts[type] = (statistics.patternTypeCounts[type] || 0) + 1;
    statistics.lastGenerated = new Date().toISOString();
    
    // Generate numbers
    const numbers = generateNumberSet(type);
    
    // Update number frequency
    numbers.forEach(num => {
        statistics.numberFrequency[num] = (statistics.numberFrequency[num] || 0) + 1;
    });
    
    // Save statistics
    saveStatistics();
    
    // Display results
    displayGeneratedNumbers(numbers);
    
    // Update pattern stats
    updatePatternStats(numbers);
    
    // Update real-time stats
    updateRealTimeStats();
    
    // Show toast
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} numbers generated!`, 'success');
    
    // Track analytics
    if (window.lotteryAnalytics) {
        window.lotteryAnalytics.trackEvent('numbers_generated', {
            type: type,
            count: numbers.length,
            numbers: numbers.join(',')
        });
    }
    
    return numbers;
}

function generateNumberSet(type) {
    const numbers = new Set([...selectedNumbers]);
    
    switch(type) {
        case 'pattern':
            generateWeightedNumbers(numbers, 'frequency');
            break;
        case 'balanced':
            generateBalancedNumbers(numbers);
            break;
        case 'random':
            generateRandomNumbers(numbers);
            break;
    }
    
    // Convert to array and sort
    const result = Array.from(numbers);
    result.sort((a, b) => a - b);
    
    // Add to generated sets
    generatedSets.push({
        numbers: result,
        type: type,
        timestamp: new Date().toISOString(),
        preset: currentPreset
    });
    
    // Keep only last 50 sets
    if (generatedSets.length > 50) {
        generatedSets.shift();
    }
    
    return result;
}

function generateWeightedNumbers(targetSet, weightType) {
    const weights = heatmapData.map(item => ({
        number: item.number,
        weight: weightType === 'frequency' ? item.frequency : 1
    }));
    
    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    weights.forEach(w => w.weight = w.weight / totalWeight);
    
    // Select numbers
    while (targetSet.size < numberCount && targetSet.size < maxNumber) {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const item of weights) {
            cumulative += item.weight;
            if (rand <= cumulative && !targetSet.has(item.number)) {
                targetSet.add(item.number);
                break;
            }
        }
    }
}

function generateBalancedNumbers(targetSet) {
    const needed = numberCount - targetSet.size;
    if (needed <= 0) return;
    
    const midPoint = Math.floor(maxNumber / 2);
    const oddCountTarget = Math.floor(numberCount / 2);
    const evenCountTarget = numberCount - oddCountTarget;
    
    let currentOdd = Array.from(targetSet).filter(n => n % 2 !== 0).length;
    let currentEven = targetSet.size - currentOdd;
    
    // Add numbers to achieve balance
    while (targetSet.size < numberCount) {
        let num;
        
        if (currentOdd < oddCountTarget) {
            // Need more odd numbers
            num = getRandomOddNumber(midPoint);
        } else if (currentEven < evenCountTarget) {
            // Need more even numbers
            num = getRandomEvenNumber(midPoint);
        } else {
            // Balanced, add random
            num = Math.floor(Math.random() * maxNumber) + 1;
        }
        
        if (num <= maxNumber && !targetSet.has(num)) {
            targetSet.add(num);
            if (num % 2 !== 0) currentOdd++;
            else currentEven++;
        }
    }
}

function generateRandomNumbers(targetSet) {
    while (targetSet.size < numberCount && targetSet.size < maxNumber) {
        const num = Math.floor(Math.random() * maxNumber) + 1;
        targetSet.add(num);
    }
}

function getRandomOddNumber(midPoint) {
    let num;
    do {
        num = Math.floor(Math.random() * midPoint) * 2 + 1;
    } while (num <= 0 || num > maxNumber);
    return num;
}

function getRandomEvenNumber(midPoint) {
    let num;
    do {
        num = Math.floor(Math.random() * midPoint) * 2;
        if (num === 0) num = 2;
    } while (num <= 0 || num > maxNumber);
    return num;
}

// ===== DISPLAY FUNCTIONS =====
function displayGeneratedNumbers(numbers) {
    const container = document.getElementById('generatedNumbers');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!numbers || numbers.length === 0) {
        container.innerHTML = '<div class="placeholder">Click above to generate numbers</div>';
        return;
    }
    
    numbers.forEach(num => {
        const span = document.createElement('span');
        span.className = 'generated-number';
        span.textContent = num;
        span.title = `Number ${num}`;
        container.appendChild(span);
    });
    
    // Announce to screen readers
    announceToScreenReader(`Generated numbers: ${numbers.join(', ')}`);
}

function displayMultipleSets(sets) {
    const container = document.getElementById('generatedNumbers');
    if (!container) return;
    
    container.innerHTML = '';
    
    sets.forEach((set, index) => {
        const setDiv = document.createElement('div');
        setDiv.className = 'number-set';
        
        const header = document.createElement('div');
        header.className = 'set-header';
        header.textContent = `Set ${index + 1}:`;
        
        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'set-numbers';
        
        set.forEach(num => {
            const span = document.createElement('span');
            span.className = 'generated-number';
            span.textContent = num;
            numbersDiv.appendChild(span);
        });
        
        setDiv.appendChild(header);
        setDiv.appendChild(numbersDiv);
        container.appendChild(setDiv);
    });
}

// ===== STATISTICS FUNCTIONS =====
function updatePatternStats(numbers = []) {
    const stats = document.getElementById('patternStats');
    if (!stats) return;
    
    if (!numbers || numbers.length === 0) {
        stats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Odd/Even Ratio:</span>
                <span id="oddEvenRatio" class="stat-value">-</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">High/Low Ratio:</span>
                <span id="highLowRatio" class="stat-value">-</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Sum Range:</span>
                <span id="sumRange" class="stat-value">-</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Number Spread:</span>
                <span id="numberSpread" class="stat-value">-</span>
            </div>
        `;
        return;
    }
    
    // Calculate statistics
    const oddCount = numbers.filter(n => n % 2 !== 0).length;
    const evenCount = numbers.length - oddCount;
    const oddEvenRatio = `${oddCount}:${evenCount}`;
    
    const midPoint = Math.floor(maxNumber / 2);
    const highCount = numbers.filter(n => n > midPoint).length;
    const lowCount = numbers.length - highCount;
    const highLowRatio = `${highCount}:${lowCount}`;
    
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / numbers.length);
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const sumRange = `${sum} total (${min}-${max})`;
    
    const spread = max - min;
    const spreadPercentage = Math.round((spread / maxNumber) * 100);
    const numberSpread = `${spread} (${spreadPercentage}%)`;
    
    // Update display
    document.getElementById('oddEvenRatio').textContent = oddEvenRatio;
    document.getElementById('highLowRatio').textContent = highLowRatio;
    document.getElementById('sumRange').textContent = sumRange;
    document.getElementById('numberSpread').textContent = numberSpread;
}

function updateRealTimeStats() {
    document.getElementById('statsTotal').textContent = statistics.totalGenerations.toLocaleString();
    
    // Find most used type
    let maxType = 'pattern';
    let maxCount = 0;
    Object.entries(statistics.patternTypeCounts).forEach(([type, count]) => {
        if (count > maxCount) {
            maxCount = count;
            maxType = type;
        }
    });
    document.getElementById('statsMostUsed').textContent = maxType.charAt(0).toUpperCase() + maxType.slice(1);
    
    // Find hot numbers
    const hotNumbers = Object.entries(statistics.numberFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([num]) => parseInt(num));
    document.getElementById('statsHotNumbers').textContent = hotNumbers.join(', ');
}

// ===== PREFERENCES & SETTINGS =====
function loadPreferences() {
    try {
        const savedMax = localStorage.getItem('lottery_maxNumber');
        const savedCount = localStorage.getItem('lottery_numberCount');
        const savedMethod = localStorage.getItem('lottery_generationMethod');
        const savedPreset = localStorage.getItem('lottery_preset');
        const savedTheme = localStorage.getItem('lottery_theme');
        
        if (savedMax) {
            maxNumber = parseInt(savedMax);
            document.getElementById('maxNumber').value = maxNumber;
        }
        
        if (savedCount) {
            numberCount = parseInt(savedCount);
            document.getElementById('numberCount').value = numberCount;
        }
        
        if (savedMethod) {
            generationMethod = savedMethod;
            document.getElementById('generationMethod').value = generationMethod;
        }
        
        if (savedPreset) {
            setPreset(savedPreset, false);
        }
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

function savePreferences() {
    try {
        localStorage.setItem('lottery_maxNumber', maxNumber);
        localStorage.setItem('lottery_numberCount', numberCount);
        localStorage.setItem('lottery_generationMethod', generationMethod);
        localStorage.setItem('lottery_preset', currentPreset);
        localStorage.setItem('lottery_theme', document.documentElement.getAttribute('data-theme') || 'light');
    } catch (error) {
        console.error('Error saving preferences:', error);
        showToast('Error saving settings', 'error');
    }
}

function updatePreferences() {
    const newMax = parseInt(document.getElementById('maxNumber').value);
    const newCount = parseInt(document.getElementById('numberCount').value);
    
    if (!validateNumberInput(newMax, 10, 100, 'Number range must be between 10 and 100')) return;
    if (!validateNumberInput(newCount, 1, 15, 'Number count must be between 1 and 15')) return;
    
    maxNumber = newMax;
    numberCount = newCount;
    
    // Update heatmap data
    initializeHeatmapData();
    generateHeatmap();
    
    // Clear selection if it exceeds new count
    if (selectedNumbers.size > numberCount) {
        const newSelection = Array.from(selectedNumbers).slice(0, numberCount);
        selectedNumbers = new Set(newSelection);
        generateHeatmap();
    }
    
    // Save preferences
    savePreferences();
    
    showToast('Settings updated successfully!', 'success');
}

function setPreset(preset, showNotification = true) {
    currentPreset = preset;
    
    // Update active button
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.preset === preset) {
            btn.classList.add('active');
        }
    });
    
    // Set values based on preset
    switch(preset) {
        case 'powerball':
            maxNumber = 69;
            numberCount = 5;
            break;
        case 'megamillions':
            maxNumber = 70;
            numberCount = 5;
            break;
        case 'euromillions':
            maxNumber = 50;
            numberCount = 5;
            break;
        case 'custom':
            // Keep current values
            break;
    }
    
    // Update UI
    document.getElementById('maxNumber').value = maxNumber;
    document.getElementById('numberCount').value = numberCount;
    
    // Update heatmap
    initializeHeatmapData();
    generateHeatmap();
    
    // Save preferences
    savePreferences();
    
    if (showNotification) {
        showToast(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`, 'info');
    }
}

// ===== STATISTICS MANAGEMENT =====
function loadStatistics() {
    try {
        const saved = localStorage.getItem('lottery_statistics');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(statistics, data);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function saveStatistics() {
    try {
        localStorage.setItem('lottery_statistics', JSON.stringify(statistics));
    } catch (error) {
        console.error('Error saving statistics:', error);
    }
}

function resetStatistics() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        statistics = {
            totalGenerations: 0,
            patternTypeCounts: { pattern: 0, balanced: 0, random: 0 },
            numberFrequency: {},
            lastGenerated: null
        };
        saveStatistics();
        updateRealTimeStats();
        showToast('Statistics reset successfully', 'success');
    }
}

// ===== UTILITY FUNCTIONS =====
function validateInputs() {
    const maxInput = document.getElementById('maxNumber');
    const countInput = document.getElementById('numberCount');
    
    const maxValid = validateNumberInput(parseInt(maxInput.value), 10, 100, 'Number range must be between 10 and 100');
    const countValid = validateNumberInput(parseInt(countInput.value), 1, 15, 'Number count must be between 1 and 15');
    
    return maxValid && countValid;
}

function validateNumberInput(value, min, max, errorMessage) {
    if (isNaN(value) || value < min || value > max) {
        showToast(errorMessage, 'error');
        return false;
    }
    return true;
}

function scrollToAnalyzer() {
    document.getElementById('analyzer').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('latest-time').textContent = dateString;
}

// ===== THEME MANAGEMENT =====
function setupTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('lottery_theme');
    
    let theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lottery_theme', newTheme);
    
    showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme enabled`, 'info');
}

// ===== PWA INSTALLATION =====
function setupPWAInstall() {
    let deferredPrompt;
    const installButton = document.getElementById('install-button');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.style.display = 'flex';
        
        installButton.addEventListener('click', () => {
            installButton.style.display = 'none';
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    showToast('App installed successfully!', 'success');
                }
                deferredPrompt = null;
            });
        });
    });
    
    window.addEventListener('appinstalled', () => {
        installButton.style.display = 'none';
        deferredPrompt = null;
    });
}

// ===== EXPORT & SHARE FUNCTIONS =====
function exportNumbers() {
    const numbers = getCurrentNumbers();
    if (!numbers || numbers.length === 0) {
        showToast('Generate numbers first', 'warning');
        return;
    }
    
    const data = {
        generated: new Date().toISOString(),
        numbers: numbers,
        statistics: {
            sum: numbers.reduce((a, b) => a + b, 0),
            oddCount: numbers.filter(n => n % 2).length,
            evenCount: numbers.filter(n => n % 2 === 0).length,
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            average: Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length)
        },
        settings: {
            preset: currentPreset,
            maxNumber: maxNumber,
            numberCount: numberCount,
            method: generationMethod
        },
        source: {
            tool: "Lottery Pattern Analyzer",
            url: window.location.href,
            version: "2.0.0"
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lottery-numbers-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Numbers exported as JSON', 'success');
}

function shareNumbers() {
    const numbers = getCurrentNumbers();
    if (!numbers || numbers.length === 0) {
        showToast('Generate numbers first', 'warning');
        return;
    }
    
    const text = `My lottery numbers: ${numbers.join(', ')}`;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Lottery Numbers',
            text: text,
            url: url
        }).then(() => {
            showToast('Numbers shared successfully!', 'success');
        }).catch((error) => {
            console.log('Sharing cancelled:', error);
        });
    } else {
        // Fallback to clipboard
        copyToClipboard(text);
    }
}

function copyNumbers() {
    const numbers = getCurrentNumbers();
    if (!numbers || numbers.length === 0) {
        showToast('Generate numbers first', 'warning');
        return;
    }
    
    const text = numbers.join(', ');
    copyToClipboard(text);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch((error) => {
        console.error('Copy failed:', error);
        showToast('Failed to copy to clipboard', 'error');
    });
}

function getCurrentNumbers() {
    const container = document.getElementById('generatedNumbers');
    const numbers = Array.from(container.querySelectorAll('.generated-number'))
        .map(span => parseInt(span.textContent))
        .filter(num => !isNaN(num));
    
    return numbers.length > 0 ? numbers : null;
}

function clearNumbers() {
    if (confirm('Clear all generated numbers?')) {
        displayGeneratedNumbers([]);
        showToast('Numbers cleared', 'info');
    }
}

function saveNumbers() {
    const numbers = getCurrentNumbers();
    if (!numbers || numbers.length === 0) {
        showToast('Generate numbers first', 'warning');
        return;
    }
    
    try {
        const savedNumbers = JSON.parse(localStorage.getItem('lottery_savedNumbers') || '[]');
        savedNumbers.push({
            numbers: numbers,
            timestamp: new Date().toISOString(),
            preset: currentPreset
        });
        
        // Keep only last 100 saves
        if (savedNumbers.length > 100) {
            savedNumbers.shift();
        }
        
        localStorage.setItem('lottery_savedNumbers', JSON.stringify(savedNumbers));
        showToast('Numbers saved locally', 'success');
    } catch (error) {
        console.error('Error saving numbers:', error);
        showToast('Failed to save numbers', 'error');
    }
}

// ===== RESET FUNCTIONS =====
function resetAnalyzer() {
    if (confirm('Reset analyzer to default settings? This will clear your selections.')) {
        selectedNumbers.clear();
        generatedSets = [];
        generateHeatmap();
        displayGeneratedNumbers([]);
        updatePatternStats();
        showToast('Analyzer reset', 'info');
    }
}

function resetAll() {
    if (confirm('Reset everything including statistics? This cannot be undone.')) {
        selectedNumbers.clear();
        generatedSets = [];
        statistics = {
            totalGenerations: 0,
            patternTypeCounts: { pattern: 0, balanced: 0, random: 0 },
            numberFrequency: {},
            lastGenerated: null
        };
        
        localStorage.removeItem('lottery_statistics');
        localStorage.removeItem('lottery_savedNumbers');
        
        generateHeatmap();
        displayGeneratedNumbers([]);
        updatePatternStats();
        updateRealTimeStats();
        showToast('All data reset', 'success');
    }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close notification">×</button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
}

// ===== ACCESSIBILITY =====
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ===== EVENT HANDLERS =====
function handleResize() {
    // Adjust layout if needed
}

function handleBeforeUnload(e) {
    // Save data before leaving
    savePreferences();
    saveStatistics();
    
    // Don't show confirmation unless there's unsaved data
    // return 'You have unsaved changes. Are you sure you want to leave?';
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + 1: Generate pattern-based
    if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        generatePatternBased();
    }
    
    // Ctrl/Cmd + 2: Generate balanced
    if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        generateBalanced();
    }
    
    // Ctrl/Cmd + 3: Generate random
    if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        generateRandom();
    }
    
    // Ctrl/Cmd + S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNumbers();
    }
    
    // Ctrl/Cmd + C: Copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyNumbers();
    }
    
    // Escape: Clear selection
    if (e.key === 'Escape') {
        if (selectedNumbers.size > 0) {
            selectedNumbers.clear();
            generateHeatmap();
            updatePatternStats();
            showToast('Selection cleared', 'info');
        }
    }
}

// ===== TUTORIAL FUNCTIONS =====
function showTutorial() {
    document.getElementById('tutorial').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    showToast('Tutorial section opened', 'info');
}

// ===== CONSENT MANAGEMENT =====
function acceptConsent() {
    localStorage.setItem('lottery_consent', 'accepted');
    document.getElementById('consent-banner').style.display = 'none';
    
    // Initialize analytics
    if (typeof window.lotteryAnalytics !== 'undefined') {
        window.lotteryAnalytics.init();
    }
}

function rejectConsent() {
    localStorage.setItem('lottery_consent', 'rejected');
    document.getElementById('consent-banner').style.display = 'none';
}

function showConsentSettings() {
    // Show detailed consent settings modal
    showToast('Consent settings coming soon', 'info');
}

// ===== PRINT FUNCTION =====
function printPage() {
    window.print();
}

// ===== INITIALIZE ANALYTICS =====
function initializeAnalytics() {
    // Check consent
    const consent = localStorage.getItem('lottery_consent');
    if (consent !== 'accepted') {
        // Show consent banner after delay
        setTimeout(() => {
            document.getElementById('consent-banner').style.display = 'block';
        }, 2000);
    } else if (typeof window.lotteryAnalytics !== 'undefined') {
        window.lotteryAnalytics.init();
    }
}

// ===== PUBLIC API =====
// Expose useful functions to global scope
window.LotteryAnalyzer = {
    generatePatternBased,
    generateBalanced,
    generateRandom,
    setPreset,
    exportNumbers,
    shareNumbers,
    copyNumbers,
    resetAnalyzer,
    resetAll,
    toggleTheme,
    scrollToAnalyzer,
    showTutorial
};

// Development helper
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Development mode active');
    window.LotteryAnalyzer.debug = {
        heatmapData,
        statistics,
        generatedSets,
        selectedNumbers: Array.from(selectedNumbers)
    };
}
