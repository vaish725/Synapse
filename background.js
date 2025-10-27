// Synapse Background Service Worker (Manifest V3)
// Handles time tracking, idle detection, and state management

console.log('Synapse service worker initialized');

// State management
let activeTabId = null;
let activeUrl = null;
let sessionStartTime = null;
let isIdle = false;
let focusModeActive = false;
let pomodoroRunning = false;

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Synapse extension installed');
  
  // Set idle detection interval to 60 seconds
  chrome.idle.setDetectionInterval(60);
  
  // Initialize storage with default values
  chrome.storage.local.get(['timeData', 'siteCategories', 'settings'], (result) => {
    if (!result.timeData) {
      chrome.storage.local.set({ timeData: {} });
    }
    if (!result.siteCategories) {
      chrome.storage.local.set({ siteCategories: {} });
    }
    if (!result.settings) {
      chrome.storage.local.set({ 
        settings: {
          pomodoroWorkMinutes: 25,
          pomodoroBreakMinutes: 5,
          enableFocusMode: false
        }
      });
    }
  });
});

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

// Track URL changes within the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    handleTabChange(tab);
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    saveCurrentSession();
    activeTabId = null;
    activeUrl = null;
  } else {
    // Browser gained focus
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      handleTabChange(tab);
    }
  }
});

// Handle idle state changes
chrome.idle.onStateChanged.addListener((state) => {
  console.log('Idle state changed:', state);
  
  if (state === 'idle' || state === 'locked') {
    isIdle = true;
    saveCurrentSession();
  } else if (state === 'active') {
    isIdle = false;
    // Resume tracking when user becomes active
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        handleTabChange(tabs[0]);
      }
    });
  }
});

// Handle tab change and save previous session
async function handleTabChange(tab) {
  if (!tab.url || isIdle) return;
  
  // Save previous session before switching
  saveCurrentSession();
  
  // Start new session
  activeTabId = tab.id;
  activeUrl = extractDomain(tab.url);
  sessionStartTime = Date.now();
  
  console.log('Tracking:', activeUrl);
  
  // Check for focus mode violations
  await checkFocusModeViolation(activeUrl);
}

// Check if current site violates focus mode
async function checkFocusModeViolation(domain) {
  if (!focusModeActive || !pomodoroRunning) return;
  
  const result = await chrome.storage.local.get(['siteCategories']);
  const categories = result.siteCategories || {};
  const category = categories[domain] || 'neutral';
  
  if (category === 'unproductive') {
    // Send warning notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⚠️ Focus Mode Alert',
      message: `You're visiting ${domain} during a work session. Stay focused!`,
      priority: 2
    });
    
    // Update badge to show warning
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    
    // Clear badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 5000);
  }
}

// Save the current session time to storage
function saveCurrentSession() {
  if (!activeUrl || !sessionStartTime) return;
  
  const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000); // in seconds
  
  if (sessionDuration < 1) return; // Ignore very short sessions
  
  chrome.storage.local.get(['timeData'], (result) => {
    const timeData = result.timeData || {};
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!timeData[today]) {
      timeData[today] = {};
    }
    
    if (!timeData[today][activeUrl]) {
      timeData[today][activeUrl] = 0;
    }
    
    timeData[today][activeUrl] += sessionDuration;
    
    chrome.storage.local.set({ timeData }, () => {
      console.log(`Saved ${sessionDuration}s for ${activeUrl}`);
    });
  });
  
  // Reset session
  sessionStartTime = null;
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// Message handler for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ 
          domain: extractDomain(tabs[0].url),
          url: tabs[0].url
        });
      }
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getTodayStats') {
    const today = new Date().toISOString().split('T')[0];
    chrome.storage.local.get(['timeData', 'siteCategories'], (result) => {
      const timeData = result.timeData?.[today] || {};
      const categories = result.siteCategories || {};
      sendResponse({ timeData, categories });
    });
    return true;
  }
  
  if (request.action === 'setFocusMode') {
    focusModeActive = request.enabled;
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'setPomodoroState') {
    pomodoroRunning = request.running;
    if (pomodoroRunning) {
      chrome.action.setBadgeText({ text: '⏱️' });
      chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
    sendResponse({ success: true });
    return true;
  }
});

// Periodic save (every 10 seconds) to prevent data loss
setInterval(() => {
  if (!isIdle && activeUrl && sessionStartTime) {
    saveCurrentSession();
    // Restart session immediately
    sessionStartTime = Date.now();
  }
}, 10000);
