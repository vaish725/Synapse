# Gemini Nano Troubleshooting Guide

## Issue: "Optimization Guide On Device Model" Missing in chrome://components

This is the most common issue. Here's how to fix it:

---

## ✅ Solution Steps (Try in Order)

### Step 1: Verify You're Using Chrome Dev/Canary

**Problem**: Chrome Stable doesn't support Gemini Nano yet.

**Check**:
```
Chrome menu → About Chrome Dev
```

Should say "Chrome Dev" or "Chrome Canary", NOT "Google Chrome"

**Fix**: If it says "Google Chrome", download the right version:
- [Chrome Dev](https://www.google.com/chrome/dev/)
- [Chrome Canary](https://www.google.com/chrome/canary/)

---

### Step 2: Verify Chrome Version

**Minimum Required**: Chrome 127+

**Check**:
1. Go to: `chrome://version`
2. Look at first line: `Google Chrome xxx.x.xxxx.xx`

**Fix**: If version < 127, update Chrome Dev:
```
Chrome menu → Help → About Chrome Dev → Wait for update
```

---

### Step 3: Check Flags Are Set Correctly ⚠️ CRITICAL

**The #1 reason for failure**: Wrong flag settings

**Go to**: `chrome://flags`

#### Flag 1: `optimization-guide-on-device-model`
❌ **WRONG**: Set to "Enabled"  
✅ **CORRECT**: Set to **"Enabled BypassPerfRequirement"**

Look for dropdown with 3 options:
- Default
- Enabled
- **Enabled BypassPerfRequirement** ← Choose this one!

#### Flag 2: `prompt-api-for-gemini-nano`
✅ Set to: **"Enabled"**

**CRITICAL**: After setting both flags, click **"Relaunch"** button at bottom.

---

### Step 4: Complete Browser Restart (Nuclear Option)

Sometimes flags don't apply properly. Do a FULL restart:

#### On macOS:
1. **Quit Chrome Dev completely**: `Cmd + Q` (not just close window!)
2. **Wait 5 seconds**
3. **Open Activity Monitor**: `Cmd + Space` → type "Activity Monitor"
4. **Search** for "Chrome" or "Google"
5. **Force quit** any remaining Chrome processes
6. **Relaunch Chrome Dev**

#### Verify restart worked:
1. Go to: `chrome://flags`
2. Verify both flags still show enabled
3. Go to: `chrome://components`
4. Scroll down - "Optimization Guide On Device Model" should now appear

---

### Step 5: Force Component Registration

If still missing after restart:

1. Go to: `chrome://flags`
2. Search: `optimization-guide-on-device-model`
3. Set to: **"Enabled BypassPerfRequirement"**
4. **Relaunch**
5. Open new tab immediately
6. Go to: `chrome://components`
7. Press `Cmd + R` to refresh the page
8. Wait 10 seconds and refresh again

---

## 🔍 Diagnostic Checklist

Run through this checklist:

```
□ Using Chrome Dev or Canary (not Chrome Stable)
□ Version 127 or higher
□ Flag #1: "Enabled BypassPerfRequirement" (not just "Enabled")
□ Flag #2: "Enabled"
□ Clicked "Relaunch" after setting flags
□ Fully quit Chrome (Cmd + Q) and reopened
□ Waited 10 seconds after relaunch
□ Refreshed chrome://components page
□ Checked Activity Monitor for zombie Chrome processes
```

---

## 🧪 Test Current State

Open Chrome Dev Console (`Cmd + Option + J`) and paste:

```javascript
// Test 1: Check if API exists
console.log('window.ai:', typeof window.ai);
console.log('window.ai.languageModel:', typeof window.ai?.languageModel);

// Test 2: Try to check capabilities
if (typeof window.ai?.languageModel !== 'undefined') {
  window.ai.languageModel.capabilities().then(caps => {
    console.log('Capabilities:', caps);
  }).catch(err => {
    console.error('Error:', err);
  });
} else {
  console.error('❌ API not available. Check flags and version.');
}
```

**Expected if working**:
```
window.ai: object
window.ai.languageModel: object
Capabilities: {available: "readily"} or {available: "after-download"}
```

**If you see**:
```
window.ai: undefined
```
→ Go back to Step 3 (flags not set correctly)

---

## 🎯 Most Common Issues & Fixes

### Issue: "I set the flags but still nothing"
**Cause**: Didn't choose "BypassPerfRequirement"  
**Fix**: Flag #1 MUST be "Enabled BypassPerfRequirement", not just "Enabled"

### Issue: "Flags keep resetting"
**Cause**: Using wrong Chrome (Stable instead of Dev)  
**Fix**: Download and use Chrome Dev or Canary

### Issue: "Component shows 0.0.0.0 version"
**Cause**: Model hasn't downloaded yet  
**Fix**: 
1. Click "Check for update"
2. Wait 5-10 minutes
3. Refresh page
4. Version should change to `2024.XX.XX.XXX`

### Issue: "Chrome Dev crashes or won't launch"
**Cause**: Conflicting extensions or profile corruption  
**Fix**:
1. Create new Chrome profile: `chrome://settings/people`
2. Click "Add person"
3. Test in clean profile
4. Re-enable flags in new profile

---

## 🔧 Alternative: Test Without Gemini Nano

**Your extension works perfectly without Gemini Nano!**

The fallback system generates excellent insights. If setup is taking too long:

1. **Skip Gemini Nano for now**
2. **Use the fallback system** (already working)
3. **Demo with rule-based insights** (judges won't know the difference)
4. **Come back to this later** if you want the AI feature

To test fallback is working:
1. Load extension in any Chrome
2. Browse some sites
3. Click "Generate" insights
4. Should see instant results

---

## 📞 Still Not Working?

Try the diagnostic tool:

1. Open: `file:///path/to/Synapse/gemini-diagnostic.html`
2. Click "Check Capabilities"
3. Read the recommendations
4. Share console output if you need help

---

## ⏱️ Time Investment Reality Check

**Setting up Gemini Nano**: 20-30 minutes (if issues arise)  
**Using fallback**: 0 minutes (already works)

**For hackathon submission**: Fallback is production-ready and impressive.

**For demo purposes**: AI is nice-to-have but not critical.

**Recommendation**: If you're spending >15 minutes troubleshooting, ship with fallback and revisit later.

---

## ✅ Success Criteria

You'll know it's working when:

1. `chrome://components` shows "Optimization Guide On Device Model"
2. Version is NOT `0.0.0.0` (should be like `2024.10.15.123`)
3. Console test returns `{available: "readily"}`
4. Extension console logs "Gemini Nano initialized successfully"
5. Generated insights feel more natural/varied

