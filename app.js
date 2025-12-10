// Lottery Pattern Analyzer Main Application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Initialize pattern analyzer
    initializeAnalyzer();
    
    // Generate initial heatmap
    generateHeatmap();
    
    // Set up event listeners for number selection
    setupNumberSelection();
    
    // Initialize with some pattern stats
    updatePatternStats();
    
    // Update latest time display
    updateLatestTime();
});

// Heatmap data and state
let heatmapData = [];
let selectedNumbers = new Set();
let maxNumber = 69;
let numberCount = 6;

// Initialize analyzer with default settings
function initializeAnalyzer() {
    // Load saved preferences from localStorage
    const savedMax = localStorage.getItem('lottery_maxNumber');
    const savedCount = localStorage.getItem('lottery_numberCount');
    
    if (savedMax) {
        maxNumber = parseInt(savedMax);
        document.getElementById('maxNumber').value = maxNumber;
    }
    
    if (savedCount) {
        numberCount = parseInt(savedCount);
        document.getElementById('numberCount').value = numberCount;
    }
    
    // Initialize heatmap data with simulated frequency
    initializeHeatmapData();
}

// Generate simulated frequency data for heatmap
function initializeHeatmapData() {
    heatmapData = [];
    for (let i = 1; i <= maxNumber; i++) {
        // Simulate some numbers being "hot" (more frequent)
        let frequency;
        if (i <= 10) {
            frequency = Math.random() * 0.8 + 0.2; // Hot range
        } else if (i <= 30) {
            frequency = Math.random() * 0.6 + 0.2; // Warm range
        } else if (i <= 50) {
            frequency = Math.random() * 0.4 + 0.1; // Cool range
        } else {
            frequency = Math.random() * 0.2; // Cold range
        }
        
        // Add some randomness to make it more interesting
        frequency += (Math.random() - 0.5) * 0.3;
        frequency = Math.max(0, Math.min(1, frequency));
        
        heatmapData.push({
            number: i,
            frequency: frequency,
            category: getCategoryFromFrequency(frequency)
        });
    }
}

// Categorize numbers based on frequency
function getCategoryFromFrequency(frequency) {
    if (frequency > 0.7) return 'hot';
    if (frequency > 0.5) return 'warm';
    if (frequency > 0.3) return 'cool';
    return 'cold';
}

// Generate the heatmap display
function generateHeatmap() {
    const container = document.getElementById('heatmap');
    container.innerHTML = '';
    
    heatmapData.forEach(item => {
        const cell = document.createElement('div');
        cell.className = `number-cell ${item.category} ${selectedNumbers.has(item.number) ? 'selected' : ''}`;
        cell.textContent = item.number;
        cell.title = `Number ${item.number} - ${item.category.charAt(0).toUpperCase() + item.category.slice(1)} frequency`;
        cell.dataset.number = item.number;
        
        container.appendChild(cell);
    });
}

// Set up click handlers for number selection
function setupNumberSelection() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('number-cell')) {
            const number = parseInt(e.target.dataset.number);
            toggleNumberSelection(number);
        }
    });
}

// Toggle number selection
function toggleNumberSelection(number) {
    if (selectedNumbers.has(number)) {
        selectedNumbers.delete(number);
    } else {
        selectedNumbers.add(number);
    }
    
    // Update heatmap display
    generateHeatmap();
}

// Update user preferences
function updatePreferences() {
    const newMax = parseInt(document.getElementById('maxNumber').value);
    const newCount = parseInt(document.getElementById('numberCount').value);
    
    // Validate inputs
    if (newMax < 10 || newMax > 100) {
        alert('Please enter a number between 10 and 100 for the range.');
        return;
    }
    
    if (newCount < 1 || newCount > 15) {
        alert('Please enter a number between 1 and 15 for the count.');
        return;
    }
    
    maxNumber = newMax;
    numberCount = newCount;
    
    // Save to localStorage
    localStorage.setItem('lottery_maxNumber', maxNumber);
    localStorage.setItem('lottery_numberCount', numberCount);
    
    // Reinitialize analyzer with new settings
    initializeHeatmapData();
    generateHeatmap();
    selectedNumbers.clear();
    updatePatternStats();
}

// Generate pattern-based numbers
function generatePatternBased() {
    const numbers = generateNumbers('pattern');
    displayGeneratedNumbers(numbers);
}

// Generate balanced set
function generateBalanced() {
    const numbers = generateNumbers('balanced');
    displayGeneratedNumbers(numbers);
}

// Generate random numbers
function generateRandom() {
    const numbers = generateNumbers('random');
    displayGeneratedNumbers(numbers);
}

// Main number generation function
function generateNumbers(type) {
    const numbers = new Set([...selectedNumbers]);
    
    // Different generation strategies
    if (type === 'pattern') {
        // Weighted towards hot numbers
        generateWeightedNumbers(numbers, 'pattern');
    } else if (type === 'balanced') {
        // Balanced distribution
        generateBalancedNumbers(numbers);
    } else {
        // Completely random
        generateRandomNumbers(numbers);
    }
    
    // Convert to array and sort
    const result = Array.from(numbers);
    result.sort((a, b) => a - b);
    
    // Update pattern stats
    updatePatternStats(result);
    
    return result;
}

// Generate weighted numbers based on heatmap
function generateWeightedNumbers(targetSet, type) {
    const weights = [];
    heatmapData.forEach(item => {
        let weight;
        switch(type) {
            case 'pattern':
                weight = item.frequency;
                break;
            default:
                weight = 1;
        }
        weights.push({ number: item.number, weight: weight });
    });
    
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

// Generate balanced numbers (odd/even, high/low)
function generateBalancedNumbers(targetSet) {
    const needed = numberCount - targetSet.size;
    if (needed <= 0) return;
    
    const midPoint = Math.floor(maxNumber / 2);
    const oddCount = Math.floor(needed / 2);
    const evenCount = needed - oddCount;
    
    // Add balanced numbers
    let attempts = 0;
    while (targetSet.size < numberCount && attempts < 1000) {
        let num;
        if (targetSet.size % 2 === 0) {
            // Try to add odd number
            num = getRandomOddNumber(midPoint);
        } else {
            // Try to add even number
            num = getRandomEvenNumber(midPoint);
        }
        
        if (num <= maxNumber && !targetSet.has(num)) {
            targetSet.add(num);
        }
        attempts++;
    }
    
    // Fill remaining with random if needed
    if (targetSet.size < numberCount) {
        generateRandomNumbers(targetSet);
    }
}

// Generate completely random numbers
function generateRandomNumbers(targetSet) {
    while (targetSet.size < numberCount && targetSet.size < maxNumber) {
        const num = Math.floor(Math.random() * maxNumber) + 1;
        targetSet.add(num);
    }
}

// Helper function to get random odd number
function getRandomOddNumber(midPoint) {
    let num;
    do {
        num = Math.floor(Math.random() * midPoint) * 2 + 1;
    } while (num <= 0);
    return num;
}

// Helper function to get random even number
function getRandomEvenNumber(midPoint) {
    let num;
    do {
        num = Math.floor(Math.random() * midPoint) * 2;
    } while (num <= 0);
    return num + 2;
}

// Display generated numbers
function displayGeneratedNumbers(numbers) {
    const container = document.getElementById('generatedNumbers');
    container.innerHTML = '';
    
    if (numbers.length === 0) {
        container.textContent = 'Click above to generate numbers';
        return;
    }
    
    numbers.forEach(num => {
        const span = document.createElement('span');
        span.className = 'generated-number';
        span.textContent = num;
        container.appendChild(span);
    });
}

// Update pattern statistics
function updatePatternStats(numbers = []) {
    if (numbers.length === 0) {
        document.getElementById('oddEvenRatio').textContent = '-';
        document.getElementById('highLowRatio').textContent = '-';
        document.getElementById('sumRange').textContent = '-';
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
    
    // Update display
    document.getElementById('oddEvenRatio').textContent = oddEvenRatio;
    document.getElementById('highLowRatio').textContent = highLowRatio;
    document.getElementById('sumRange').textContent = sumRange;
}

// Update latest time display
function updateLatestTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const timeString = now.toLocaleDateString('en-US', options);
    document.getElementById('latest-time').textContent = timeString;
}

// Scroll to analyzer section
function scrollToAnalyzer() {
    document.getElementById('analyzer').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Export numbers functionality (optional enhancement)
function exportNumbers() {
    const numbers = Array.from(selectedNumbers);
    if (numbers.length === 0) {
        alert('Please select some numbers first.');
        return;
    }
    
    const data = {
        generated: new Date().toISOString(),
        numbers: numbers.sort((a, b) => a - b),
        maxNumber: maxNumber,
        settings: {
            numberCount: numberCount,
            oddEvenRatio: document.getElementById('oddEvenRatio').textContent,
            highLowRatio: document.getElementById('highLowRatio').textContent
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
}

// Share functionality (optional enhancement)
function shareNumbers() {
    if (navigator.share) {
        const numbers = Array.from(selectedNumbers).sort((a, b) => a - b);
        navigator.share({
            title: 'My Lottery Numbers',
            text: `Check out my lottery numbers: ${numbers.join(', ')}`,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const numbersText = Array.from(selectedNumbers).sort((a, b) => a - b).join(', ');
        alert(`Your numbers: ${numbersText}\n\nCopy and share them manually.`);
    }
}
