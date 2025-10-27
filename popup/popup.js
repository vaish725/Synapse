// Synapse Popup JavaScript

// DOM Elements
const currentDomain = document.getElementById('currentDomain');
const categorySelect = document.getElementById('categorySelect');
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const focusModeCheckbox = document.getElementById('focusModeCheckbox');
const workTime = document.getElementById('workTime');
const unproductiveTime = document.getElementById('unproductiveTime');
const totalTime = document.getElementById('totalTime');
const generateInsightsBtn = document.getElementById('generateInsightsBtn');
const insightsContent = document.getElementById('insightsContent');

// Pomodoro state
let pomodoroState = {
  isRunning: false,
  isPaused: false,
  timeRemaining: 25 * 60, // 25 minutes in seconds
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  isWorkSession: true,
  intervalId: null
};

// Initialize popup
async function init() {
  await loadCurrentSite();
  await loadTodayStats();
  await loadSettings();
  await loadPomodoroState(); // Load persisted timer state
  setupEventListeners();
}

// Load current site info
async function loadCurrentSite() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCurrentTab' });
    if (response && response.domain) {
      currentDomain.textContent = response.domain;
      
      // Load site category
      const result = await chrome.storage.local.get(['siteCategories']);
      const categories = result.siteCategories || {};
      const category = categories[response.domain] || 'neutral';
      categorySelect.value = category;
    }
  } catch (error) {
    console.error('Error loading current site:', error);
    currentDomain.textContent = 'Unable to detect';
  }
}

// Load today's statistics
async function loadTodayStats() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getTodayStats' });
    if (response) {
      const { timeData, categories } = response;
      
      let workSeconds = 0;
      let unproductiveSeconds = 0;
      let totalSeconds = 0;
      
      for (const [domain, seconds] of Object.entries(timeData)) {
        totalSeconds += seconds;
        const category = categories[domain] || 'neutral';
        
        if (category === 'work') {
          workSeconds += seconds;
        } else if (category === 'unproductive') {
          unproductiveSeconds += seconds;
        }
      }
      
      workTime.textContent = formatTime(workSeconds);
      unproductiveTime.textContent = formatTime(unproductiveSeconds);
      totalTime.textContent = formatTime(totalSeconds);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load settings
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    if (result.settings) {
      const settings = result.settings;
      pomodoroState.workDuration = (settings.pomodoroWorkMinutes || 25) * 60;
      pomodoroState.breakDuration = (settings.pomodoroBreakMinutes || 5) * 60;
      focusModeCheckbox.checked = settings.enableFocusMode || false;
      
      // Sync focus mode state with background worker
      await chrome.runtime.sendMessage({
        action: 'setFocusMode',
        enabled: settings.enableFocusMode || false
      });
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Load persisted Pomodoro state
async function loadPomodoroState() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getPomodoroState' });
    if (response && response.isRunning) {
      // Calculate elapsed time since last update
      const elapsed = Math.floor((Date.now() - response.lastUpdate) / 1000);
      pomodoroState.timeRemaining = Math.max(0, response.timeRemaining - elapsed);
      pomodoroState.isWorkSession = response.isWorkSession;
      pomodoroState.isRunning = true;
      pomodoroState.isPaused = false;
      
      // Update UI
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      updateTimerDisplay();
      
      // Start UI timer countdown (will be synced by interval)
      if (!pomodoroState.intervalId) {
        pomodoroState.intervalId = setInterval(() => {
          if (pomodoroState.timeRemaining > 0) {
            pomodoroState.timeRemaining--;
            updateTimerDisplay();
          } else {
            // Timer completed, reload state
            clearInterval(pomodoroState.intervalId);
            pomodoroState.intervalId = null;
            pomodoroState.isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            setTimeout(() => loadPomodoroState(), 500);
          }
        }, 1000);
      }
    } else if (response) {
      // Timer is not running, but load the saved state
      pomodoroState.timeRemaining = response.timeRemaining;
      pomodoroState.isWorkSession = response.isWorkSession;
      pomodoroState.isRunning = false;
      pomodoroState.isPaused = false;
      
      // Clear any running interval
      if (pomodoroState.intervalId) {
        clearInterval(pomodoroState.intervalId);
        pomodoroState.intervalId = null;
      }
      
      // Update UI
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      updateTimerDisplay();
    }
  } catch (error) {
    console.error('Error loading Pomodoro state:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Category change
  categorySelect.addEventListener('change', async () => {
    const domain = currentDomain.textContent;
    const category = categorySelect.value;
    
    if (domain && domain !== 'Unable to detect') {
      const result = await chrome.storage.local.get(['siteCategories']);
      const categories = result.siteCategories || {};
      categories[domain] = category;
      await chrome.storage.local.set({ siteCategories: categories });
      
      // Reload stats to reflect category change
      await loadTodayStats();
    }
  });
  
  // Pomodoro controls
  startBtn.addEventListener('click', startPomodoro);
  pauseBtn.addEventListener('click', pausePomodoro);
  resetBtn.addEventListener('click', resetPomodoro);
  
  // Focus mode
  focusModeCheckbox.addEventListener('change', async () => {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};
    settings.enableFocusMode = focusModeCheckbox.checked;
    await chrome.storage.local.set({ settings });
    
    // Sync with background worker
    await chrome.runtime.sendMessage({
      action: 'setFocusMode',
      enabled: focusModeCheckbox.checked
    });
  });
  
  // AI Insights
  generateInsightsBtn.addEventListener('click', generateInsights);
  
  // Settings and data view buttons
  document.getElementById('openInTabBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') });
  });
  
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('viewDataBtn')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Pomodoro functions
async function startPomodoro() {
  if (pomodoroState.isRunning) return;
  
  pomodoroState.isRunning = true;
  pomodoroState.isPaused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  
  // Get current settings
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || {};
  
  // Notify background worker and pass state
  await chrome.runtime.sendMessage({
    action: 'setPomodoroState',
    running: true,
    timeRemaining: pomodoroState.timeRemaining,
    isWorkSession: pomodoroState.isWorkSession,
    settings: settings
  });
  
  // Save state to storage
  await chrome.runtime.sendMessage({
    action: 'updatePomodoroState',
    state: {
      isRunning: true,
      timeRemaining: pomodoroState.timeRemaining,
      isWorkSession: pomodoroState.isWorkSession,
      lastUpdate: Date.now()
    }
  });
  
  pomodoroState.intervalId = setInterval(() => {
    if (pomodoroState.timeRemaining > 0) {
      pomodoroState.timeRemaining--;
      updateTimerDisplay();
    } else {
      // Session complete
      handleSessionComplete();
    }
  }, 1000);
}

async function pausePomodoro() {
  if (!pomodoroState.isRunning) return;
  
  pomodoroState.isRunning = false;
  pomodoroState.isPaused = true;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  
  // Notify background worker
  await chrome.runtime.sendMessage({
    action: 'setPomodoroState',
    running: false
  });
  
  // Save paused state
  await chrome.runtime.sendMessage({
    action: 'updatePomodoroState',
    state: {
      isRunning: false,
      timeRemaining: pomodoroState.timeRemaining,
      isWorkSession: pomodoroState.isWorkSession,
      lastUpdate: Date.now()
    }
  });
  
  if (pomodoroState.intervalId) {
    clearInterval(pomodoroState.intervalId);
    pomodoroState.intervalId = null;
  }
}

async function resetPomodoro() {
  await pausePomodoro();
  pomodoroState.isWorkSession = true;
  pomodoroState.timeRemaining = pomodoroState.workDuration;
  pomodoroState.isPaused = false;
  
  // Save reset state
  await chrome.runtime.sendMessage({
    action: 'updatePomodoroState',
    state: {
      isRunning: false,
      timeRemaining: pomodoroState.timeRemaining,
      isWorkSession: true,
      lastUpdate: Date.now()
    }
  });
  
  updateTimerDisplay();
}

function handleSessionComplete() {
  pausePomodoro();
  
  // Send notification
  const message = pomodoroState.isWorkSession 
    ? 'Work session complete! Time for a break.' 
    : 'Break over! Ready for another work session?';
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title: 'Synapse Timer',
    message: message,
    priority: 2
  });
  
  // Switch session type
  pomodoroState.isWorkSession = !pomodoroState.isWorkSession;
  pomodoroState.timeRemaining = pomodoroState.isWorkSession 
    ? pomodoroState.workDuration 
    : pomodoroState.breakDuration;
  
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(pomodoroState.timeRemaining / 60);
  const seconds = pomodoroState.timeRemaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Generate AI insights
async function generateInsights() {
  generateInsightsBtn.disabled = true;
  generateInsightsBtn.textContent = 'Analyzing...';
  insightsContent.innerHTML = '<p class="insights-placeholder">🧠 Analyzing your browsing patterns with on-device AI...</p>';
  
  try {
    // Get all time data for analysis
    const result = await chrome.storage.local.get(['timeData', 'siteCategories']);
    const timeData = result.timeData || {};
    const categories = result.siteCategories || {};
    
    // Prepare data for AI analysis
    const analysisData = prepareAnalysisData(timeData, categories);
    
    // Check if AI is available (this will also show in console)
    const isAIAvailable = await checkGeminiNanoAvailability();
    console.log('Gemini Nano available:', isAIAvailable);
    
    // Generate insights using Gemini Nano (or fallback)
    const insight = await generateAIInsights(analysisData);
    
    // Display with markdown-style formatting
    const formattedInsight = insight.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    insightsContent.innerHTML = `<div class="insights-text">${formattedInsight}</div>`;
    
    // Add disclaimer
    const disclaimer = document.createElement('p');
    disclaimer.className = 'insights-disclaimer';
    disclaimer.style.fontSize = '11px';
    disclaimer.style.color = 'var(--text-secondary)';
    disclaimer.style.marginTop = '12px';
    disclaimer.style.fontStyle = 'italic';
    disclaimer.textContent = isAIAvailable 
      ? '✨ Generated with on-device AI (Gemini Nano). This is behavioral analysis for productivity, not medical advice.'
      : '💡 Generated with rule-based analysis. For AI-powered insights, ensure Chrome has Gemini Nano enabled.';
    insightsContent.appendChild(disclaimer);
    
  } catch (error) {
    console.error('Error generating insights:', error);
    insightsContent.innerHTML = '<p class="insights-placeholder" style="color: var(--danger-color);">⚠️ Error generating insights. Please try again.</p>';
  } finally {
    generateInsightsBtn.disabled = false;
    generateInsightsBtn.textContent = 'Generate';
  }
}

function prepareAnalysisData(timeData, categories) {
  const today = new Date().toISOString().split('T')[0];
  const todayData = timeData[today] || {};
  
  const data = {
    work: {},
    unproductive: {},
    neutral: {},
    totalWorkTime: 0,
    totalUnproductiveTime: 0,
    totalNeutralTime: 0
  };
  
  for (const [domain, seconds] of Object.entries(todayData)) {
    const category = categories[domain] || 'neutral';
    data[category][domain] = seconds;
    
    if (category === 'work') {
      data.totalWorkTime += seconds;
    } else if (category === 'unproductive') {
      data.totalUnproductiveTime += seconds;
    } else {
      data.totalNeutralTime += seconds;
    }
  }
  
  return data;
}

// Utility: Format seconds to human-readable time
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Initialize on load
init();

// Refresh stats every 10 seconds
setInterval(loadTodayStats, 10000);

// Continuously sync Pomodoro timer with background worker (every second)
setInterval(async () => {
  if (pomodoroState.isRunning) {
    // Sync with background state to ensure consistency
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getPomodoroState' });
      if (response && response.isRunning) {
        const elapsed = Math.floor((Date.now() - response.lastUpdate) / 1000);
        const actualTimeRemaining = Math.max(0, response.timeRemaining - elapsed);
        
        // Only update if there's a significant difference (> 2 seconds drift)
        if (Math.abs(pomodoroState.timeRemaining - actualTimeRemaining) > 2) {
          pomodoroState.timeRemaining = actualTimeRemaining;
          pomodoroState.isWorkSession = response.isWorkSession;
          updateTimerDisplay();
        }
      } else if (!response || !response.isRunning) {
        // Background timer stopped, sync UI
        if (pomodoroState.isRunning) {
          await loadPomodoroState();
        }
      }
    } catch (error) {
      console.error('Error syncing timer:', error);
    }
  }
}, 1000);

// Cleanup on window unload (popup close)
window.addEventListener('beforeunload', () => {
  if (pomodoroState.intervalId) {
    clearInterval(pomodoroState.intervalId);
  }
});
