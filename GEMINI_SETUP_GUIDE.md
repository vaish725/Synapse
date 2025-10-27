# 🚀 Gemini Nano Setup Guide

Complete step-by-step guide to enable Chrome's Built-in AI in your local environment.

---

## ⏱️ Estimated Time: 15-20 minutes
(Including model download - depends on internet speed)

---

## 📋 Prerequisites

- **Minimum RAM**: 4GB (8GB+ recommended)
- **Free Disk Space**: 2GB for Chrome Dev/Canary + AI model
- **Internet Connection**: Stable connection for ~1.5GB download
- **Operating System**: macOS (you're good to go!)

---

## 🔧 Step-by-Step Setup

### Step 1: Download Chrome Dev or Canary

You need Chrome 127+ with experimental features. Choose one:

#### Option A: Chrome Dev (Recommended - More Stable)
1. Go to: https://www.google.com/chrome/dev/
2. Click **"Download Chrome Dev"**
3. Open the downloaded `.dmg` file
4. Drag **Google Chrome Dev** to Applications folder
5. Launch **Chrome Dev** (it will have a different icon from regular Chrome)

#### Option B: Chrome Canary (Latest Features - Less Stable)
1. Go to: https://www.google.com/chrome/canary/
2. Click **"Download Chrome Canary"**
3. Open the downloaded `.dmg` file
4. Drag **Google Chrome Canary** to Applications folder
5. Launch **Chrome Canary** (yellow icon)

> **Note**: You can have Chrome Stable, Dev, and Canary installed simultaneously. They won't interfere with each other.

---

### Step 2: Enable Required Flags

1. **Open Chrome Dev/Canary** (whichever you installed)

2. **Navigate to flags page**:
   - Type in address bar: `chrome://flags`
   - Press Enter

3. **Enable Flag #1 - AI Model**:
   - Search for: `optimization-guide-on-device-model`
   - Find: **"Optimization Guide On Device Model"**
   - Change dropdown to: **"Enabled BypassPerfRequirement"**
   - ⚠️ Important: Must select "BypassPerfRequirement", not just "Enabled"

4. **Enable Flag #2 - Prompt API**:
   - Search for: `prompt-api-for-gemini-nano`
   - Find: **"Prompt API for Gemini Nano"**
   - Change dropdown to: **"Enabled"**

5. **Restart Browser**:
   - Click blue **"Relaunch"** button at bottom
   - OR: Quit Chrome completely and reopen

---

### Step 3: Download AI Model

1. **Navigate to components page**:
   - Type in address bar: `chrome://components`
   - Press Enter

2. **Locate the AI model**:
   - Scroll down to find: **"Optimization Guide On Device Model"**
   - It should show version info or "0.0.0.0" if not downloaded

3. **Trigger download**:
   - Click **"Check for update"** button
   - Status should change to "Downloading..." or "Checking..."

4. **Wait for download** (~1.5GB, takes 5-10 minutes):
   - Refresh the page occasionally to see progress
   - Status will eventually show version number (e.g., "2024.10.21.123")
   - When complete, you'll see a full version number

5. **Verify download**:
   - Look for a version like: `2024.10.XX.XXX` (not 0.0.0.0)
   - Status should NOT say "Update failed"

---

### Step 4: Verify Gemini Nano is Working

#### Method 1: Quick Browser Console Test

1. Open a new tab in Chrome Dev/Canary
2. Press `Cmd + Option + J` to open Developer Console
3. Paste this code and press Enter:

```javascript
(async () => {
  if (typeof window.ai !== 'undefined' && typeof window.ai.languageModel !== 'undefined') {
    const capabilities = await window.ai.languageModel.capabilities();
    console.log('✅ Gemini Nano Status:', capabilities);
    
    if (capabilities.available === 'readily') {
      console.log('🎉 READY! Creating test session...');
      const session = await window.ai.languageModel.create();
      const response = await session.prompt("Say hello in 5 words");
      console.log('🤖 AI Response:', response);
      session.destroy();
    } else {
      console.log('⏳ Status:', capabilities.available);
    }
  } else {
    console.log('❌ window.ai not available - check flags and model download');
  }
})();
```

**Expected Output**:
```
✅ Gemini Nano Status: {available: "readily"}
🎉 READY! Creating test session...
🤖 AI Response: Hello from Gemini Nano AI!
```

#### Method 2: Use Diagnostic Page

1. In Chrome Dev/Canary, open the diagnostic tool:
   - File → Open File → Navigate to Synapse folder
   - Open `gemini-diagnostic.html`
   
2. Check the results:
   - **API Detection** should show all ✅ YES
   - **Capabilities** should show `"available": "readily"`
   - Click **"Test Session Creation"** → Should show ✅ Success
   - Click **"Test Simple Prompt"** → Should show AI response

---

### Step 5: Load Synapse Extension in Chrome Dev

1. **Open Extensions page**:
   - Go to: `chrome://extensions/`
   - Toggle **"Developer mode"** ON (top right)

2. **Load unpacked extension**:
   - Click **"Load unpacked"** button
   - Navigate to: `/Users/vaishnavikamdi/Documents/Synapse`
   - Click **"Select"**

3. **Verify extension loaded**:
   - You should see **"Synapse"** card appear
   - Extension icon should appear in toolbar
   - No errors should show

---

### Step 6: Test AI in Extension

1. **Open extension popup**:
   - Click Synapse icon in Chrome toolbar
   - Popup should open showing dashboard

2. **Generate some test data**:
   - Browse a few websites (github.com, twitter.com, etc.)
   - Let it track for 2-3 minutes
   - Categorize sites using the dropdown in popup

3. **Generate AI insights**:
   - Click **"Generate"** button in AI Insights section
   - Watch browser console (F12) for logs

4. **Expected behavior**:
   - Should see: `"Gemini Nano initialized successfully"`
   - AI response appears (will be more sophisticated than fallback)
   - No errors in console

---

## 🐛 Troubleshooting

### Problem: "window.ai is undefined"

**Solutions**:
- ✅ Verify you're using Chrome Dev/Canary (not Stable)
- ✅ Check Chrome version: `chrome://version` → Should be 127+
- ✅ Confirm flags are enabled at `chrome://flags`
- ✅ Completely quit and restart Chrome (don't just close window)
- ✅ Check if model downloaded at `chrome://components`

### Problem: "available": "after-download"

**Meaning**: Model is downloading or needs to be downloaded

**Solutions**:
- Go to `chrome://components`
- Click "Check for update" for "Optimization Guide On Device Model"
- Wait 5-10 minutes
- Refresh page to check status

### Problem: "Update failed" in chrome://components

**Solutions**:
- Clear Chrome cache: Settings → Privacy → Clear browsing data
- Restart Chrome completely
- Try "Check for update" again
- Check internet connection
- Try again in 1 hour (server may be busy)

### Problem: Model downloads but still doesn't work

**Solutions**:
- Verify flag is "Enabled BypassPerfRequirement" (not just "Enabled")
- Restart Chrome COMPLETELY (Cmd+Q to quit)
- Check console for specific errors
- Try creating new Chrome profile: Settings → Add new user

### Problem: Extension shows "Gemini Nano not available"

**Solutions**:
- Open extension in regular tab (not popup): Click "Open in Tab" button
- Check browser console (F12) for detailed error
- Run `gemini-diagnostic.html` to identify exact issue
- Verify model is downloaded (not 0.0.0.0 version)

---

## ✅ Success Checklist

Before proceeding, verify ALL of these:

- [ ] Chrome Dev or Canary installed and running
- [ ] Chrome version is 127 or higher
- [ ] Both flags enabled at `chrome://flags`:
  - [ ] `optimization-guide-on-device-model` → Enabled BypassPerfRequirement
  - [ ] `prompt-api-for-gemini-nano` → Enabled
- [ ] Browser restarted after enabling flags
- [ ] Model downloaded at `chrome://components` (version shows 2024.XX.XX.XXX)
- [ ] Browser console test passes (window.ai exists)
- [ ] Diagnostic page shows all green checkmarks
- [ ] Extension loaded in `chrome://extensions/`
- [ ] Extension generates AI insights without errors

---

## 🎯 Next Steps After Setup

Once Gemini Nano is working:

1. **Test all AI features**:
   - Generate insights with various data patterns
   - Check quality difference vs fallback
   - Verify no errors in console

2. **Compare AI vs Fallback**:
   - Take screenshots of both outputs
   - Note differences in sophistication
   - Use for demo presentation

3. **Record demo video**:
   - Show AI insights generation
   - Highlight privacy (all on-device)
   - Demonstrate fallback graceful degradation

4. **Update documentation**:
   - Note AI is optional enhancement
   - Document setup for future developers
   - Update README with availability info

---

## 📚 Additional Resources

- **Chrome AI Documentation**: https://developer.chrome.com/docs/ai/built-in
- **Gemini Nano Overview**: https://blog.google/technology/ai/google-gemini-ai/
- **Chrome Dev Download**: https://www.google.com/chrome/dev/
- **Chrome Canary Download**: https://www.google.com/chrome/canary/
- **Prompt API Explainer**: https://github.com/explainers-by-googlers/prompt-api

---

## 💡 Tips

- **Keep Chrome Stable too**: Use for daily browsing, Dev/Canary just for development
- **Check for updates**: Model improves over time, update regularly
- **Monitor memory**: AI model uses ~200MB RAM when active
- **Test fallback**: Disable flags to ensure fallback still works
- **Demo both modes**: Show AI vs fallback to judges

---

## ⚠️ Important Notes

1. **Experimental Feature**: Gemini Nano is still in early access, may have bugs
2. **Not Required**: Extension works perfectly without it (fallback system)
3. **User Experience**: Most users won't have this, so fallback is primary UX
4. **Demo Value**: Great for showing progressive enhancement and future vision
5. **Privacy**: All processing is on-device, no data leaves the browser

---

## 🎉 You're Ready!

Once you complete these steps, you'll have:
- Full Gemini Nano AI capabilities
- Both AI and fallback modes working
- Complete testing environment
- Demo-ready setup

Good luck with your hackathon! 🚀

