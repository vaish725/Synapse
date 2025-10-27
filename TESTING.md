# Synapse Extension - Testing Guide & Bug Report

**Date:** October 27, 2025  
**Version:** 1.0.0  
**Tester:** Manual Testing Phase

---

## 🧪 How to Load the Extension for Testing

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the folder: `/Users/vaishnavikamdi/Documents/Synapse`
5. Verify the extension appears with the Synapse icon
6. Pin the extension to your toolbar for easy access

---

## ✅ Test Plan

### **Test 1: Extension Installation & Initialization**
- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Click icon - popup opens successfully
- [ ] Check DevTools Console (F12 on popup) - no errors
- [ ] Check background service worker logs: `chrome://extensions/` → Synapse → "service worker" link → Console

**Expected Results:**
- Popup opens showing "Loading..." initially
- Console logs: "Synapse service worker initialized"
- Default settings initialized in storage

---

### **Test 2: Time Tracking Engine**
**Test 2.1: Basic Domain Tracking**
- [ ] Visit a website (e.g., github.com)
- [ ] Open popup - verify current domain shows "github.com"
- [ ] Stay on site for 30+ seconds
- [ ] Switch to another site
- [ ] Open popup - check "Today's Activity" stats show time for github.com

**Test 2.2: Idle Detection**
- [ ] Visit a site and let 60+ seconds pass without interaction (no mouse/keyboard)
- [ ] Check if tracking pauses (background console should log "Idle state changed: idle")
- [ ] Move mouse/type - verify tracking resumes

**Test 2.3: Tab Switching**
- [ ] Open 3 tabs with different sites
- [ ] Switch between tabs actively
- [ ] Verify popup shows correct "Current Site" for active tab
- [ ] Verify time is only counted for active tab

**Test 2.4: Data Persistence**
- [ ] Track time on several sites
- [ ] Close and reopen browser
- [ ] Open popup - verify stats persist

---

### **Test 3: Site Categorization**
**Test 3.1: Category Assignment**
- [ ] Visit a site (e.g., twitter.com)
- [ ] Open popup
- [ ] Change category dropdown to "Unproductive"
- [ ] Verify selection saves (reopen popup, check it's still "Unproductive")

**Test 3.2: Stats by Category**
- [ ] Categorize 2-3 sites as "Work" and browse them
- [ ] Categorize 2-3 sites as "Unproductive" and browse them
- [ ] Open popup
- [ ] Verify "Work" and "Unproductive" time stats are accurate

**Test 3.3: Settings Page Categories**
- [ ] Open popup → click "Settings"
- [ ] Verify all categorized sites appear in the list
- [ ] Click category badge to cycle through categories
- [ ] Verify category updates in real-time

---

### **Test 4: Pomodoro Timer**
**Test 4.1: Basic Timer**
- [ ] Open popup
- [ ] Click "Start" button
- [ ] Verify timer counts down from 25:00
- [ ] Click "Pause" - verify timer pauses
- [ ] Click "Start" again - verify timer resumes
- [ ] Click "Reset" - verify timer resets to 25:00

**Test 4.2: Session Completion**
- [ ] Start timer and let it run to 00:00 (or edit settings to 1 minute for faster test)
- [ ] Verify notification appears: "Work session complete! Time for a break."
- [ ] Verify timer switches to break duration (5:00 or custom)

**Test 4.3: Custom Durations**
- [ ] Open Settings
- [ ] Change work duration to 10 minutes
- [ ] Change break duration to 2 minutes
- [ ] Click "Save Pomodoro Settings"
- [ ] Open popup - verify timer shows 10:00

---

### **Test 5: Focus Mode**
**Test 5.1: Enable Focus Mode**
- [ ] Open popup
- [ ] Check "Enable Focus Mode" checkbox
- [ ] Start Pomodoro timer
- [ ] Visit a site categorized as "Unproductive"
- [ ] Verify notification appears: "⚠️ Focus Mode Alert - You're visiting [domain] during a work session..."
- [ ] Verify extension badge shows "!" temporarily

**Test 5.2: Focus Mode Disabled**
- [ ] Uncheck "Enable Focus Mode"
- [ ] Start Pomodoro timer
- [ ] Visit unproductive site
- [ ] Verify NO warning appears

**Test 5.3: Focus Mode Without Timer**
- [ ] Enable Focus Mode
- [ ] Do NOT start Pomodoro timer
- [ ] Visit unproductive site
- [ ] Verify NO warning (focus mode only activates during active Pomodoro)

---

### **Test 6: Settings Page**
**Test 6.1: Privacy Disclaimer**
- [ ] Open Settings
- [ ] Verify disclaimer is visible at top
- [ ] Verify it mentions "NOT a medical diagnostic tool"

**Test 6.2: Site Management**
- [ ] Search for a specific site in search box
- [ ] Verify filtering works
- [ ] Click delete button (🗑️) on a site
- [ ] Confirm deletion
- [ ] Verify site removed from list and stats updated

**Test 6.3: Data Export**
- [ ] Open Settings
- [ ] Click "Export Data" button
- [ ] Verify JSON file downloads
- [ ] Open file - verify it contains timeData, siteCategories, settings

**Test 6.4: Data Import**
- [ ] Click "Import Data"
- [ ] Select the exported JSON file
- [ ] Confirm import
- [ ] Verify data merges successfully

**Test 6.5: Delete All Data**
- [ ] Click "Delete All Data"
- [ ] Type "DELETE" in prompt
- [ ] Verify all data cleared
- [ ] Verify stats reset to 0

---

### **Test 7: Dashboard & Stats**
**Test 7.1: Real-time Updates**
- [ ] Open popup
- [ ] Keep popup open while browsing different sites
- [ ] Verify stats update automatically (every 10 seconds)

**Test 7.2: AI Insights (Mock)**
- [ ] Browse several sites (both work and unproductive)
- [ ] Open popup
- [ ] Click "Generate" insights button
- [ ] Verify mock insight appears with:
  - Summary of activity
  - Most time-consuming unproductive site (if any)
  - Actionable tip

---

### **Test 8: Edge Cases & Error Handling**
**Test 8.1: Chrome Internal Pages**
- [ ] Visit `chrome://extensions/`
- [ ] Open popup
- [ ] Verify graceful handling (should show "Unable to detect" or similar)

**Test 8.2: Very Short Sessions**
- [ ] Rapidly switch tabs (< 1 second per tab)
- [ ] Verify very short sessions are ignored (< 1 second threshold)

**Test 8.3: Multiple Windows**
- [ ] Open 2+ browser windows
- [ ] Switch between windows
- [ ] Verify tracking follows active window

**Test 8.4: Browser Restart**
- [ ] Start Pomodoro timer
- [ ] Close and reopen browser
- [ ] Verify timer resets (state doesn't persist across restarts - expected behavior)

---

## 🐛 Bug Report Template

Use this format to report any bugs found:

```markdown
### Bug #X: [Short Description]

**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Console Errors:** (if any)
Paste console logs here

**Screenshots:** (if applicable)
Attach or describe visual issues
```

---

## 📊 Known Limitations (Not Bugs)

These are expected limitations of the MVP:
1. **Pomodoro state doesn't persist** across browser restarts (intentional for MVP)
2. **AI insights are mock data** until Gemini Nano integration is complete
3. **No time-of-day tracking** (only total daily time per site)
4. **Icons are placeholder** (purple circles)
5. **No dark mode** (coming in Phase 2)

---

## ✅ Test Results Summary

**Test Date:** ________________  
**Tester:** ________________  
**Browser Version:** ________________  

| Test Category | Pass | Fail | Notes |
|--------------|------|------|-------|
| Installation |      |      |       |
| Time Tracking |     |      |       |
| Site Categorization | | |       |
| Pomodoro Timer |    |      |       |
| Focus Mode |        |      |       |
| Settings Page |     |      |       |
| Dashboard & Stats | |      |       |
| Edge Cases |        |      |       |

**Overall Status:** ☐ Pass ☐ Fail ☐ Pass with Issues

**Critical Bugs Found:** ___________

**Recommendations:**
- Priority fixes:
- Nice-to-have improvements:

---

## 🔍 Debugging Tips

### View Service Worker Logs
1. Go to `chrome://extensions/`
2. Find Synapse extension
3. Click "service worker" (blue link)
4. Check console for background.js logs

### View Popup Console
1. Open popup
2. Right-click anywhere in popup
3. Select "Inspect"
4. Check Console tab

### View Storage Data
1. Open popup console (as above)
2. Run in console:
```javascript
chrome.storage.local.get(null, (data) => console.log(data));
```

### Clear Extension Data (for clean test)
```javascript
chrome.storage.local.clear(() => console.log('Data cleared'));
```

---

## ✨ Next Steps After Testing

1. Document all bugs found
2. Prioritize: Critical → High → Medium → Low
3. Fix critical bugs before Gemini Nano integration
4. Proceed with AI integration once core functionality is stable

