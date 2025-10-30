# Pre-Flight Checklist for Synapse Extension

## ✅ Code Structure Validation

### Files Present
- [x] `manifest.json` - Valid MV3 manifest
- [x] `background.js` - Service worker
- [x] `popup/popup.html` - Popup UI
- [x] `popup/popup.css` - Popup styles
- [x] `popup/popup.js` - Popup logic
- [x] `settings.html` - Settings page
- [x] `settings.css` - Settings styles
- [x] `settings.js` - Settings logic
- [x] `icons/` - Icon files (16, 32, 48, 128)
- [x] `README.md` - Documentation
- [x] `.gitignore` - Git ignore rules

### Manifest Validation
- [x] `manifest_version: 3`
- [x] All required permissions declared (`storage`, `tabs`, `idle`, `notifications`, `activeTab`)
- [x] `host_permissions` for `<all_urls>`
- [x] Service worker path correct (`background.js`)
- [x] Popup path correct (`popup/popup.html`)
- [x] Options page defined (`settings.html`)
- [x] All icon paths valid

### Code Quality
- [x] No syntax errors in JavaScript files
- [x] No syntax errors in HTML files
- [x] CSS files valid
- [x] Console.log statements present for debugging
- [x] Error handling implemented

---

## 🔍 Static Analysis Results

### Potential Issues to Watch
1. **Service Worker Lifecycle**
   - ⚠️ Service workers can be terminated by Chrome after inactivity
   - ✅ Mitigation: Periodic saves every 10 seconds implemented
   - ✅ Session state reset on termination is handled

2. **Popup Closure**
   - ⚠️ Popup closes when user clicks outside
   - ✅ Mitigation: All state stored in background worker or storage

3. **Chrome Internal Pages**
   - ⚠️ Cannot track time on `chrome://` URLs
   - ✅ Mitigation: Try-catch blocks and "Unable to detect" fallback

4. **Type Module in Popup**
   - ⚠️ `popup.js` uses `type="module"` but doesn't import/export
   - 🔧 Recommendation: Can remove `type="module"` attribute or keep for future modules

---

## 🧪 Automated Checks

### JSON Validation
```bash
# Validate manifest.json
python3 -m json.tool manifest.json > /dev/null && echo "✅ manifest.json valid"
```

### File Permissions
```bash
# Check file permissions
ls -la manifest.json background.js popup/*.js settings.js
```

### Line Endings
```bash
# Check for consistent line endings (LF preferred)
file manifest.json background.js popup/*.js settings.js
```

---

## 🚀 Load Extension Steps

**Quick Load Commands:**
```bash
# Navigate to extension folder
cd /Users/vaishnavikamdi/Documents/Synapse

# Verify all files present
ls -R

# Open Chrome extensions page
open -a "Google Chrome" "chrome://extensions/"
```

**Manual Steps:**
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select: `/Users/vaishnavikamdi/Documents/Synapse`
5. Verify extension loads without errors
6. Click extension icon to test popup

---

## 📝 Test Execution Plan

### Phase 1: Smoke Tests (5 minutes)
- [ ] Extension loads successfully
- [ ] Popup opens without errors
- [ ] Service worker initializes
- [ ] Basic time tracking works

### Phase 2: Core Features (15 minutes)
- [ ] Time tracking accuracy
- [ ] Site categorization
- [ ] Pomodoro timer
- [ ] Focus mode warnings
- [ ] Settings page

### Phase 3: Edge Cases (10 minutes)
- [ ] Idle detection
- [ ] Multiple windows
- [ ] Chrome internal pages
- [ ] Data persistence

### Phase 4: Bug Documentation (5 minutes)
- [ ] Document all issues found
- [ ] Prioritize bugs (Critical → Low)
- [ ] Create GitHub issues if needed

**Total Test Time:** ~35 minutes

---

## 🐛 Known Issues (Pre-Testing)

### Non-Critical
1. Icons are placeholder purple circles (aesthetic only)
2. AI insights use mock data (Gemini Nano not integrated yet)
3. No dark mode (planned for Phase 2)
4. No time-of-day analytics (planned for Phase 2)

### To Monitor During Testing
1. Service worker termination handling
2. Focus mode badge timing (should clear after 5 seconds)
3. Stats refresh rate (every 10 seconds)
4. Category dropdown persistence
5. Import/export data integrity

---

## ✅ Ready to Test Checklist

Before asking user to test:
- [x] All code files created
- [x] No syntax errors
- [x] Testing guide (`TESTING.md`) created
- [x] Pre-flight checklist (this file) created
- [x] README updated with installation instructions
- [x] Code committed to Git
- [ ] User informed of testing instructions
- [ ] User loads extension
- [ ] User reports findings

---

## 🔜 After Testing - Next Steps

1. **If Critical Bugs Found:**
   - Fix immediately before proceeding
   - Re-test affected features
   - Update code and commit

2. **If Minor Bugs Found:**
   - Document in GitHub Issues
   - Mark as "nice-to-have" fixes
   - Proceed with Gemini Nano integration

3. **If No Bugs Found:**
   - 🎉 Celebrate!
   - Proceed directly to Gemini Nano integration (Todo #7)
   - Implement AI aggregation and prompt API

---

## 📊 Test Results (To Be Filled)

**Test Date:** ______________  
**Duration:** ______________  
**Critical Bugs:** ______________  
**High Priority:** ______________  
**Medium Priority:** ______________  
**Low Priority:** ______________  

**Decision:** ☐ Proceed to AI Integration ☐ Fix Bugs First

