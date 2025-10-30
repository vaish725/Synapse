# Spotify "My Playlists" Debugging Guide

## Issue
The "My Playlists" button isn't working in the extension.

## Changes Made
Added extensive logging to help identify the issue. The logs will now show:

1. ✅ Button click detection
2. ✅ Modal element detection
3. ✅ Authentication status
4. ✅ API request/response details
5. ✅ Playlist data retrieval

## How to Debug

### Step 1: Reload the Extension
```
1. Go to chrome://extensions
2. Click the reload icon on the Synapse extension
3. Open the extension popup
```

### Step 2: Open Developer Console
```
1. Right-click on the extension popup
2. Select "Inspect"
3. Go to the Console tab
```

### Step 3: Test the Feature
```
1. Make sure you're connected to Spotify (green "Disconnect" button visible)
2. Click the "My Playlists" button
3. Watch the console for log messages
```

## Expected Console Output (Success)

```
🎵 My Playlists button clicked!
📂 Opening My Playlists modal...
✅ All modal elements found
✅ Modal displayed, loading playlists...
📋 Loading user playlists...
📋 getUserPlaylists called
✅ Authenticated, fetching playlists...
📡 Spotify API response status: 200
✅ Retrieved 15 playlists
✅ Playlist UI rendered
```

## Common Issues & Solutions

### Issue 1: Button Not Visible
**Symptoms:** "My Playlists" button doesn't appear after connecting

**Console Check:** Look for:
```
❌ My Playlists button not found in DOM!
```

**Solution:**
- Make sure you've successfully connected to Spotify
- Check if `showConnectedState()` is being called
- Verify the button element exists in popup.html

### Issue 2: Not Authenticated
**Symptoms:** Modal opens but shows "No playlists found"

**Console Check:** Look for:
```
❌ Not authenticated - cannot fetch playlists
```

**Solution:**
1. Disconnect from Spotify
2. Reconnect and authorize again
3. Check chrome://storage for tokens:
   - `spotifyAccessToken`
   - `spotifyTokenExpiry`

### Issue 3: Modal Elements Missing
**Symptoms:** Nothing happens when clicking the button

**Console Check:** Look for:
```
❌ Modal elements not found: { overlay: null, title: null, ... }
```

**Solution:**
- Verify popup.html has the modal HTML structure
- Check if `playlistPickerOverlay` element exists
- Ensure all required IDs are present

### Issue 4: Spotify API Error
**Symptoms:** Modal opens, loading spinner shows, then error message

**Console Check:** Look for:
```
❌ Spotify API error: {...}
📡 Spotify API response status: 401 (or other error code)
```

**Solutions:**

**401 Unauthorized:**
- Token has expired
- Disconnect and reconnect to Spotify

**403 Forbidden:**
- Need to open Spotify on another device first
- Check if you have an active Spotify Premium account

**429 Rate Limited:**
- Too many requests - wait a few minutes

## Manual Tests You Can Run

### Test 1: Check Button Visibility
Open console and run:
```javascript
document.getElementById('myPlaylistsBtn').style.display
// Should return: "flex" (if connected) or "none" (if disconnected)
```

### Test 2: Check Authentication
```javascript
window.spotifyIntegration.isAuthenticated()
// Should return: true or false
```

### Test 3: Manually Trigger Modal
```javascript
window.spotifyUI.openMyPlaylistsModal()
// Should open the modal if everything is working
```

### Test 4: Check Token Expiry
```javascript
chrome.storage.local.get(['spotifyTokenExpiry'], (data) => {
  const expiry = new Date(data.spotifyTokenExpiry);
  const now = new Date();
  console.log('Token expires:', expiry);
  console.log('Token expired:', now > expiry);
});
```

### Test 5: Fetch Playlists Directly
```javascript
window.spotifyIntegration.getUserPlaylists(10).then(playlists => {
  console.log('Playlists:', playlists);
}).catch(err => {
  console.error('Error:', err);
});
```

## Quick Fixes

### Clear Spotify Tokens
If authentication seems broken:
```javascript
chrome.storage.local.remove(['spotifyAccessToken', 'spotifyRefreshToken', 'spotifyTokenExpiry'], () => {
  console.log('✅ Tokens cleared - now reconnect');
});
```

### Force Button Visibility
If button is hidden but should be visible:
```javascript
document.getElementById('myPlaylistsBtn').style.display = 'flex';
```

## What to Report

If the issue persists, please share:
1. The full console output (copy all logs)
2. Your Spotify account type (Free/Premium)
3. The specific error message shown
4. Results of the manual tests above

## Files Modified
- `src/spotify/spotify-ui.js` - Added logging to UI operations
- `src/spotify/spotify-integration.js` - Added logging to API calls
