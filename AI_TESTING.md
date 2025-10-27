# AI Integration Testing Checklist

**Test Date:** October 27, 2025  
**Version:** 1.0.0  
**Feature:** Gemini Nano AI Integration

---

## Pre-Test Setup

### 1. Reload Extension
- [ ] Go to `chrome://extensions/`
- [ ] Find Synapse extension
- [ ] Click refresh icon (⟳)
- [ ] Verify no errors appear

### 2. Verify Files Loaded
- [ ] Open extension popup
- [ ] Right-click → Inspect
- [ ] Check Console for errors
- [ ] Verify `ai-insights.js` is loaded (check Sources tab)

---

## Test 1: Basic Functionality (No Data)

**Scenario:** Test with fresh/empty data

### Steps:
1. [ ] Open extension popup
2. [ ] Click "Generate" button in AI Insights section
3. [ ] Observe loading state: "🧠 Analyzing your browsing patterns..."

### Expected Results:
- [ ] Button changes to "Analyzing..." (disabled)
- [ ] After 1-2 seconds, shows insight
- [ ] Message should say "No activity detected yet" or similar
- [ ] Disclaimer appears below insight
- [ ] Button re-enables with "Generate" text

### Console Check:
```javascript
// Open browser console (F12) and look for:
"Gemini Nano available: true" or "false"
```

**Result:** ☐ Pass ☐ Fail  
**Notes:** _____________________

---

## Test 2: With Sample Browsing Data

**Scenario:** Test with actual tracked data

### Setup:
1. [ ] Browse 2-3 websites and categorize them:
   - At least 1 as "Work" (e.g., github.com, docs site)
   - At least 1 as "Unproductive" (e.g., social media)
   - Spend 30+ seconds on each

2. [ ] Open popup and verify stats show tracked time

### Steps:
1. [ ] Click "Generate" insights button
2. [ ] Wait for analysis to complete

### Expected Results:
- [ ] Insight mentions specific sites visited
- [ ] Provides work vs unproductive ratio
- [ ] Identifies biggest distraction (if any)
- [ ] Gives actionable suggestion (e.g., "Try Pomodoro timer")
- [ ] Disclaimer shows AI status (Gemini Nano or rule-based)

### Validation Points:
- [ ] No medical terms (ADHD, anxiety, depression, etc.)
- [ ] Tone is encouraging and constructive
- [ ] Suggestion is specific and actionable
- [ ] Response is under 500 characters
- [ ] Formatting is readable (no broken HTML)

**Result:** ☐ Pass ☐ Fail  
**Notes:** _____________________

---

## Test 3: Gemini Nano Availability Detection

**Scenario:** Check if extension detects AI availability

### Console Test:
Open browser console in the popup and run:
```javascript
// Check if Gemini Nano is available
await checkGeminiNanoAvailability()
```

### Expected Results:
- [ ] Returns `true` or `false`
- [ ] If `false`: "Gemini Nano not available, using enhanced fallback"
- [ ] If `true`: "Gemini Nano available: true"

### In Chrome:
1. [ ] Go to `chrome://version/`
2. [ ] Check Chrome version: ____________________
3. [ ] Go to `chrome://flags/`
4. [ ] Search for "prompt-api-for-gemini-nano"
5. [ ] Status: ☐ Available ☐ Not Available

**Gemini Nano Status:** ☐ Available ☐ Unavailable  
**Fallback Working:** ☐ Yes ☐ No  
**Notes:** _____________________

---

## Test 4: Multiple Insight Generations

**Scenario:** Test repeated insight generation

### Steps:
1. [ ] Generate insights (1st time)
2. [ ] Wait 5 seconds
3. [ ] Click "Generate" again (2nd time)
4. [ ] Browse more sites
5. [ ] Generate insights (3rd time)

### Expected Results:
- [ ] All generations complete successfully
- [ ] No errors in console
- [ ] Insights update based on new data
- [ ] No memory leaks (check Chrome Task Manager)
- [ ] Button state handled correctly each time

**Result:** ☐ Pass ☐ Fail  
**Notes:** _____________________

---

## Test 5: Edge Cases

### Test 5.1: Only Work Sites
- [ ] Categorize all visited sites as "Work"
- [ ] Generate insights
- [ ] Expect: Positive/encouraging message about focus

### Test 5.2: Only Unproductive Sites
- [ ] Categorize all visited sites as "Unproductive"
- [ ] Generate insights
- [ ] Expect: Alert about distractions + actionable tip

### Test 5.3: Balanced Mix
- [ ] Equal time on Work and Unproductive
- [ ] Generate insights
- [ ] Expect: Balanced feedback + Pomodoro suggestion

### Test 5.4: Very Short Sessions
- [ ] Visit sites for < 5 seconds each
- [ ] Generate insights
- [ ] Expect: Graceful handling (may say "insufficient data")

**Results:**
- 5.1: ☐ Pass ☐ Fail
- 5.2: ☐ Pass ☐ Fail
- 5.3: ☐ Pass ☐ Fail
- 5.4: ☐ Pass ☐ Fail

---

## Test 6: Error Handling

### Test 6.1: Network/Storage Errors
```javascript
// In console, corrupt storage temporarily
chrome.storage.local.set({ timeData: null })
```
- [ ] Generate insights
- [ ] Expect: Error message displayed gracefully
- [ ] No crashes or broken UI

### Test 6.2: Quick Successive Clicks
- [ ] Click "Generate" button 5 times rapidly
- [ ] Expect: Button disables, only 1 generation runs
- [ ] No duplicate requests

**Results:**
- 6.1: ☐ Pass ☐ Fail
- 6.2: ☐ Pass ☐ Fail

---

## Test 7: Privacy & Security

### Checks:
- [ ] Open Network tab (F12 → Network)
- [ ] Generate insights
- [ ] Verify: **ZERO external network requests** during AI generation
- [ ] All processing happens locally

### Data Verification:
- [ ] Check `chrome.storage.local` data
- [ ] Verify: No full URLs stored (only domains)
- [ ] Verify: No personal information captured
- [ ] Verify: Data can be deleted from settings

**Privacy Check:** ☐ Pass ☐ Fail  
**Notes:** _____________________

---

## Test 8: Open in Tab View

**Scenario:** Test AI in dedicated tab view

### Steps:
1. [ ] Click "📌 Open in Tab" button
2. [ ] Extension opens in new tab
3. [ ] Browse some sites
4. [ ] Click "Generate" insights in tab view

### Expected Results:
- [ ] AI generation works same as popup
- [ ] Insights display correctly
- [ ] No console errors
- [ ] Disclaimer appears

**Result:** ☐ Pass ☐ Fail  
**Notes:** _____________________

---

## Test 9: Disclaimer & Ethics

### Verification:
- [ ] Disclaimer appears below every AI insight
- [ ] States "behavioral analysis for productivity"
- [ ] States "not medical advice"
- [ ] Shows AI source (Gemini Nano or rule-based)

### Content Review:
Generate 3-5 insights and check for:
- [ ] No diagnostic language (disorder, condition, syndrome)
- [ ] No medical recommendations (therapy, medication)
- [ ] No mention of mental health conditions
- [ ] Only productivity and time management focus

**Ethics Check:** ☐ Pass ☐ Fail  
**Notes:** _____________________

---

## Test 10: Performance

### Metrics:
- [ ] Time to generate insight: _______ seconds (should be < 5s)
- [ ] CPU usage during generation: ☐ Low ☐ Medium ☐ High
- [ ] Memory impact: _______ MB (check Task Manager)
- [ ] No UI freezing or lag

### Long Session Test:
- [ ] Keep extension open for 10+ minutes
- [ ] Generate insights multiple times
- [ ] Check: No memory leaks or performance degradation

**Performance:** ☐ Pass ☐ Fail  
**Notes:** _____________________

---

## Bug Summary

### Critical Bugs (Blockers):
1. _____________________
2. _____________________

### High Priority:
1. _____________________
2. _____________________

### Medium/Low Priority:
1. _____________________
2. _____________________

### Nice-to-Have Improvements:
1. _____________________
2. _____________________

---

## Overall Assessment

**Total Tests:** 10  
**Passed:** _____ / 10  
**Failed:** _____ / 10  

**AI Integration Status:** ☐ Ready for Production ☐ Needs Fixes ☐ Major Issues

**Gemini Nano Working:** ☐ Yes ☐ No (Fallback OK: ☐ Yes ☐ No)

**Recommendation:**
☐ Proceed to packaging and demo
☐ Fix critical bugs first
☐ Requires significant rework

---

## Next Steps

If all tests pass:
- [ ] Commit any bug fixes
- [ ] Update documentation if needed
- [ ] Proceed to Todo #9: Packaging and Demo

If bugs found:
- [ ] Document in GitHub Issues
- [ ] Prioritize fixes
- [ ] Re-test after fixes

---

## Notes & Observations

_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________

