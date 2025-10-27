#!/bin/bash

# Gemini Nano Setup Verification Script
# Run this to check your Chrome Dev configuration

echo "🔍 Gemini Nano Setup Checker"
echo "================================"
echo ""

# Check Chrome Dev installation
echo "1️⃣ Checking Chrome Dev installation..."
if [ -f "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev" ]; then
    VERSION=$(/Applications/Google\ Chrome\ Dev.app/Contents/MacOS/Google\ Chrome\ Dev --version)
    echo "✅ Found: $VERSION"
    
    # Extract version number
    VERSION_NUM=$(echo $VERSION | grep -oE '[0-9]+' | head -1)
    if [ "$VERSION_NUM" -ge 127 ]; then
        echo "✅ Version $VERSION_NUM meets minimum requirement (127+)"
    else
        echo "❌ Version $VERSION_NUM is too old (need 127+)"
    fi
else
    echo "❌ Chrome Dev not found"
    echo "   Download from: https://www.google.com/chrome/dev/"
    exit 1
fi

echo ""
echo "2️⃣ Next Steps (MANUAL):"
echo "================================"
echo ""
echo "⚠️  You MUST do these steps manually in Chrome Dev:"
echo ""
echo "Step A: Enable Flags"
echo "-------------------"
echo "1. Open Chrome Dev"
echo "2. Go to: chrome://flags"
echo "3. Search: optimization-guide-on-device-model"
echo "4. Set to: 'Enabled BypassPerfRequirement' ⚠️ (NOT just 'Enabled'!)"
echo "5. Search: prompt-api-for-gemini-nano"
echo "6. Set to: 'Enabled'"
echo "7. Click 'Relaunch' button at bottom"
echo ""
echo "Step B: Verify Component Appears"
echo "-------------------------------"
echo "1. After relaunch, go to: chrome://components"
echo "2. Scroll down to find: 'Optimization Guide On Device Model'"
echo "3. If NOT there:"
echo "   - Fully quit Chrome Dev (Cmd+Q)"
echo "   - Wait 5 seconds"
echo "   - Reopen Chrome Dev"
echo "   - Check chrome://components again"
echo ""
echo "Step C: Download Model"
echo "---------------------"
echo "1. Find 'Optimization Guide On Device Model' in chrome://components"
echo "2. Click 'Check for update'"
echo "3. Wait 5-10 minutes (downloads ~1.5GB)"
echo "4. Verify version shows '2024.XX.XX.XXX' (not 0.0.0.0)"
echo ""
echo "Step D: Test in Console"
echo "----------------------"
echo "1. Open console: Cmd+Option+J"
echo "2. Paste this command:"
echo ""
echo "   await window.ai.languageModel.capabilities()"
echo ""
echo "3. Expected result: {available: 'readily'}"
echo ""
echo "================================"
echo ""
echo "📝 If 'Optimization Guide On Device Model' is STILL missing:"
echo ""
echo "The issue is usually:"
echo "• Flag #1 was set to 'Enabled' instead of 'Enabled BypassPerfRequirement'"
echo "• Chrome wasn't fully restarted (use Cmd+Q, not just close window)"
echo "• Need to check Activity Monitor for zombie Chrome processes"
echo ""
echo "💡 Quick Fix:"
echo "1. chrome://flags → Search 'optimization'"
echo "2. Make SURE dropdown shows 'Enabled BypassPerfRequirement'"
echo "3. Cmd+Q to fully quit Chrome Dev"
echo "4. Open Activity Monitor → Kill all Chrome processes"
echo "5. Relaunch Chrome Dev"
echo "6. Go to chrome://components → Refresh page"
echo ""
echo "⏰ If this takes >15 min, consider using fallback (already works perfectly!)"
echo ""
