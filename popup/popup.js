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
      pomodoroState.timeRemaining = pomodoroState.workDuration;
      focusModeCheckbox.checked = settings.enableFocusMode || false;
      updateTimerDisplay();
    }
  } catch (error) {
    console.error('Error loading settings:', error);
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
  });
  
  // AI Insights
  generateInsightsBtn.addEventListener('click', generateInsights);
}

// Pomodoro functions
function startPomodoro() {
  if (pomodoroState.isRunning) return;
  
  pomodoroState.isRunning = true;
  pomodoroState.isPaused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  
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

function pausePomodoro() {
  if (!pomodoroState.isRunning) return;
  
  pomodoroState.isRunning = false;
  pomodoroState.isPaused = true;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  
  if (pomodoroState.intervalId) {
    clearInterval(pomodoroState.intervalId);
    pomodoroState.intervalId = null;
  }
}

function resetPomodoro() {
  pausePomodoro();
  pomodoroState.isWorkSession = true;
  pomodoroState.timeRemaining = pomodoroState.workDuration;
  pomodoroState.isPaused = false;
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
    message: message
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
  insightsContent.innerHTML = '<p class="insights-placeholder">Analyzing your activity patterns...</p>';
  
  try {
    // Get all time data for analysis
    const result = await chrome.storage.local.get(['timeData', 'siteCategories']);
    const timeData = result.timeData || {};
    const categories = result.siteCategories || {};
    
    // Prepare data for AI analysis
    const analysisData = prepareAnalysisData(timeData, categories);
    
    // TODO: Integrate with Gemini Nano API
    // For now, show a placeholder message
    const mockInsight = generateMockInsight(analysisData);
    
    insightsContent.innerHTML = `<p class="insights-text">${mockInsight}</p>`;
  } catch (error) {
    console.error('Error generating insights:', error);
    insightsContent.innerHTML = '<p class="insights-placeholder" style="color: var(--danger-color);">Error generating insights. Please try again.</p>';
  } finally {
    generateInsightsBtn.disabled = false;
  }
}

function prepareAnalysisData(timeData, categories) {
  const today = new Date().toISOString().split('T')[0];
  const todayData = timeData[today] || {};
  
  const data = {
    work: {},
    unproductive: {},
    neutral: {}
  };
  
  for (const [domain, seconds] of Object.entries(todayData)) {
    const category = categories[domain] || 'neutral';
    data[category][domain] = seconds;
  }
  
  return data;
}

function generateMockInsight(data) {
  // Find most time-consuming unproductive site
  let maxUnproductive = { domain: 'none', time: 0 };
  for (const [domain, seconds] of Object.entries(data.unproductive)) {
    if (seconds > maxUnproductive.time) {
      maxUnproductive = { domain, time: seconds };
    }
  }
  
  // Calculate totals
  const totalWork = Object.values(data.work).reduce((a, b) => a + b, 0);
  const totalUnproductive = Object.values(data.unproductive).reduce((a, b) => a + b, 0);
  
  if (totalWork === 0 && totalUnproductive === 0) {
    return "No activity detected today. Start tracking your time to get personalized insights!";
  }
  
  let insight = "📊 Today's Analysis: ";
  
  if (totalWork > totalUnproductive) {
    insight += `Great focus today! You spent ${formatTime(totalWork)} on productive work. `;
  } else if (totalUnproductive > 0) {
    insight += `You spent ${formatTime(totalUnproductive)} on unproductive sites. `;
    if (maxUnproductive.domain !== 'none') {
      insight += `The biggest distraction was ${maxUnproductive.domain} (${formatTime(maxUnproductive.time)}). `;
    }
  }
  
  insight += "💡 Tip: Try using Focus Mode during your next work session to minimize distractions.";
  
  return insight;
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
