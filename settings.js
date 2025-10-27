// Synapse Settings Page JavaScript

// DOM Elements
const workMinutes = document.getElementById('workMinutes');
const breakMinutes = document.getElementById('breakMinutes');
const enableFocusMode = document.getElementById('enableFocusMode');
const savePomodoroBtn = document.getElementById('savePomodoroBtn');
const searchSites = document.getElementById('searchSites');
const sitesList = document.getElementById('sitesList');
const totalSites = document.getElementById('totalSites');
const totalDays = document.getElementById('totalDays');
const totalTime = document.getElementById('totalTime');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const importFileInput = document.getElementById('importFileInput');
const clearAllDataBtn = document.getElementById('clearAllDataBtn');

// State
let allSites = {};
let searchQuery = '';

// Initialize
async function init() {
  await loadSettings();
  await loadSiteCategories();
  await loadDataStats();
  setupEventListeners();
}

// Load Pomodoro settings
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    if (result.settings) {
      workMinutes.value = result.settings.pomodoroWorkMinutes || 25;
      breakMinutes.value = result.settings.pomodoroBreakMinutes || 5;
      enableFocusMode.checked = result.settings.enableFocusMode || false;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save Pomodoro settings
async function saveSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};
    
    settings.pomodoroWorkMinutes = parseInt(workMinutes.value) || 25;
    settings.pomodoroBreakMinutes = parseInt(breakMinutes.value) || 5;
    settings.enableFocusMode = enableFocusMode.checked;
    
    await chrome.storage.local.set({ settings });
    
    // Visual feedback
    savePomodoroBtn.textContent = '✓ Saved!';
    savePomodoroBtn.style.background = '#10b981';
    setTimeout(() => {
      savePomodoroBtn.textContent = 'Save Pomodoro Settings';
      savePomodoroBtn.style.background = '';
    }, 2000);
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings. Please try again.');
  }
}

// Load site categories with time data
async function loadSiteCategories() {
  try {
    const result = await chrome.storage.local.get(['siteCategories', 'timeData']);
    const categories = result.siteCategories || {};
    const timeData = result.timeData || {};
    
    // Aggregate time per site across all days
    allSites = {};
    for (const [date, sites] of Object.entries(timeData)) {
      for (const [domain, seconds] of Object.entries(sites)) {
        if (!allSites[domain]) {
          allSites[domain] = {
            category: categories[domain] || 'neutral',
            totalSeconds: 0,
            days: []
          };
        }
        allSites[domain].totalSeconds += seconds;
        if (!allSites[domain].days.includes(date)) {
          allSites[domain].days.push(date);
        }
      }
    }
    
    renderSitesList();
  } catch (error) {
    console.error('Error loading site categories:', error);
  }
}

// Render sites list
function renderSitesList() {
  const filteredSites = Object.entries(allSites).filter(([domain]) => 
    domain.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (filteredSites.length === 0) {
    sitesList.innerHTML = '<p class="empty-state">No sites found.</p>';
    return;
  }
  
  // Sort by total time descending
  filteredSites.sort((a, b) => b[1].totalSeconds - a[1].totalSeconds);
  
  sitesList.innerHTML = filteredSites.map(([domain, data]) => `
    <div class="site-item" data-domain="${domain}">
      <div class="site-info">
        <div class="site-domain">${domain}</div>
        <div class="site-stats">
          ${formatTime(data.totalSeconds)} • ${data.days.length} day${data.days.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div class="site-actions">
        <button class="category-badge category-${data.category}" data-domain="${domain}">
          ${capitalize(data.category)}
        </button>
        <button class="delete-site-btn" data-domain="${domain}" title="Delete site">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
  
  // Add click listeners for category badges
  document.querySelectorAll('.category-badge').forEach(badge => {
    badge.addEventListener('click', (e) => {
      const domain = e.target.dataset.domain;
      cycleCategorybadge(domain);
    });
  });
  
  // Add click listeners for delete buttons
  document.querySelectorAll('.delete-site-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const domain = e.target.dataset.domain;
      deleteSite(domain);
    });
  });
}

// Cycle through categories
async function cycleCategorybadge(domain) {
  const categories = ['neutral', 'work', 'unproductive'];
  const currentCategory = allSites[domain].category;
  const currentIndex = categories.indexOf(currentCategory);
  const newCategory = categories[(currentIndex + 1) % categories.length];
  
  // Update in storage
  const result = await chrome.storage.local.get(['siteCategories']);
  const siteCategories = result.siteCategories || {};
  siteCategories[domain] = newCategory;
  await chrome.storage.local.set({ siteCategories });
  
  // Update local state
  allSites[domain].category = newCategory;
  
  // Re-render
  renderSitesList();
}

// Delete site category and all time data
async function deleteSite(domain) {
  if (!confirm(`Delete all data for "${domain}"? This cannot be undone.`)) {
    return;
  }
  
  try {
    // Remove from categories
    const categoriesResult = await chrome.storage.local.get(['siteCategories']);
    const siteCategories = categoriesResult.siteCategories || {};
    delete siteCategories[domain];
    
    // Remove from time data
    const timeResult = await chrome.storage.local.get(['timeData']);
    const timeData = timeResult.timeData || {};
    for (const date in timeData) {
      delete timeData[date][domain];
    }
    
    // Save updated data
    await chrome.storage.local.set({ siteCategories, timeData });
    
    // Update local state
    delete allSites[domain];
    
    // Re-render and update stats
    renderSitesList();
    await loadDataStats();
  } catch (error) {
    console.error('Error deleting site:', error);
    alert('Error deleting site. Please try again.');
  }
}

// Load data statistics
async function loadDataStats() {
  try {
    const result = await chrome.storage.local.get(['timeData']);
    const timeData = result.timeData || {};
    
    const uniqueSites = new Set();
    let totalSeconds = 0;
    
    for (const [date, sites] of Object.entries(timeData)) {
      for (const [domain, seconds] of Object.entries(sites)) {
        uniqueSites.add(domain);
        totalSeconds += seconds;
      }
    }
    
    totalSites.textContent = uniqueSites.size;
    totalDays.textContent = Object.keys(timeData).length;
    totalTime.textContent = formatTime(totalSeconds);
  } catch (error) {
    console.error('Error loading data stats:', error);
  }
}

// Export data as JSON
async function exportData() {
  try {
    const result = await chrome.storage.local.get(['timeData', 'siteCategories', 'settings']);
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      timeData: result.timeData || {},
      siteCategories: result.siteCategories || {},
      settings: result.settings || {}
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data. Please try again.');
  }
}

// Import data from JSON
async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate data structure
    if (!data.timeData || !data.siteCategories) {
      alert('Invalid data file. Please select a valid Synapse export file.');
      return;
    }
    
    if (!confirm('Import this data? This will merge with your existing data.')) {
      return;
    }
    
    // Merge with existing data
    const result = await chrome.storage.local.get(['timeData', 'siteCategories', 'settings']);
    
    const mergedTimeData = { ...result.timeData, ...data.timeData };
    const mergedCategories = { ...result.siteCategories, ...data.siteCategories };
    const mergedSettings = { ...result.settings, ...data.settings };
    
    await chrome.storage.local.set({
      timeData: mergedTimeData,
      siteCategories: mergedCategories,
      settings: mergedSettings
    });
    
    alert('Data imported successfully!');
    
    // Reload everything
    await loadSettings();
    await loadSiteCategories();
    await loadDataStats();
  } catch (error) {
    console.error('Error importing data:', error);
    alert('Error importing data. Please check the file and try again.');
  }
  
  // Reset file input
  event.target.value = '';
}

// Clear all data
async function clearAllData() {
  const confirmation = prompt(
    'This will permanently delete ALL your browsing data, categories, and settings.\n\n' +
    'Type "DELETE" to confirm:'
  );
  
  if (confirmation !== 'DELETE') {
    return;
  }
  
  try {
    await chrome.storage.local.clear();
    alert('All data has been deleted.');
    
    // Reload everything
    allSites = {};
    await loadSettings();
    renderSitesList();
    await loadDataStats();
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('Error clearing data. Please try again.');
  }
}

// Setup event listeners
function setupEventListeners() {
  savePomodoroBtn.addEventListener('click', saveSettings);
  searchSites.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderSitesList();
  });
  exportDataBtn.addEventListener('click', exportData);
  importDataBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', importData);
  clearAllDataBtn.addEventListener('click', clearAllData);
}

// Utility: Format time
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

// Utility: Capitalize
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize on load
init();
