# Quick Test Guide: My Playlists Feature

## Step 1: Reload the Extension
1. Open Chrome and go to `chrome://extensions`
2. Find "Synapse" extension
3. Click the **Reload** button (circular arrow icon)

## Step 2: Open Extension with Console
1. Click the Synapse extension icon in your browser toolbar
2. **Right-click** anywhere in the popup window
3. Select **"Inspect"** from the context menu
4. A DevTools window will open - go to the **Console** tab

## Step 3: Connect to Spotify (if not connected)
1. In the extension popup, click the green **"Connect"** button
2. Authorize Spotify in the popup window that appears
3. Wait for connection success
4. You should see:
   - Green "Disconnect" button
   - "My Playlists" button should now be visible
   - Spotify player section visible

## Step 4: Test My Playlists Button
1. Look for the **"My Playlists"** button (purple button with music note icon)
2. **Click it**
3. Watch the console for log messages

### What You Should See (Success ✅):

**In the Console:**
```
🎵 My Playlists button clicked!
📂 Opening My Playlists modal...
✅ All modal elements found
✅ Modal displayed, loading playlists...
📋 Loading user playlists...
📋 getUserPlaylists called
✅ Authenticated, fetching playlists...
📡 Spotify API response status: 200
✅ Retrieved [number] playlists
✅ Playlist UI rendered
```

**In the UI:**
- A modal window should appear
- Shows "My Playlists" title at the top
- Displays your Spotify playlists with album art
- You can click any playlist to play it

## Common Issues & Quick Fixes

### Issue 1: Button Not Visible ❌
**What you see:** No "My Playlists" button appears

**Quick test in console:**
```javascript
document.getElementById('myPlaylistsBtn')
```

**If it returns `null`:** The button doesn't exist in HTML
**If it exists but hidden:** Run this to show it:
```javascript
document.getElementById('myPlaylistsBtn').style.display = 'flex'
```

### Issue 2: Button Doesn't Respond ❌
**What you see:** Click button, nothing happens

**Console shows:**
```
❌ My Playlists button not found in DOM!
```
OR no logs at all

**Quick fix - Manually trigger it:**
```javascript
window.spotifyUI.openMyPlaylistsModal()
```

### Issue 3: Modal Opens But No Playlists ❌
**What you see:** Loading spinner forever or "No playlists found"

**Console shows:**
```
❌ Not authenticated - cannot fetch playlists
```

**Quick fix - Check authentication:**
```javascript
// Check if authenticated
window.spotifyIntegration.isAuthenticated()

// Check token expiry
chrome.storage.local.get(['spotifyTokenExpiry'], (data) => {
  console.log('Token expires:', new Date(data.spotifyTokenExpiry));
  console.log('Is expired:', Date.now() > data.spotifyTokenExpiry);
});
```

**Solution:** Disconnect and reconnect to Spotify

### Issue 4: API Error ❌
**Console shows:**
```
📡 Spotify API response status: 401
❌ Spotify API error: {...}
```

**Quick fix - Clear tokens and reconnect:**
```javascript
chrome.storage.local.remove(['spotifyAccessToken', 'spotifyRefreshToken', 'spotifyTokenExpiry'], () => {
  console.log('✅ Tokens cleared - reload extension and reconnect');
  location.reload();
});
```

## Manual Tests You Can Run in Console

### Test 1: Check Button Exists
```javascript
const btn = document.getElementById('myPlaylistsBtn');
console.log('Button exists:', !!btn);
console.log('Button visible:', btn?.style.display);
```

### Test 2: Check Spotify Integration Loaded
```javascript
console.log('Spotify Integration:', !!window.spotifyIntegration);
console.log('Spotify UI:', !!window.spotifyUI);
```

### Test 3: Check Authentication Status
```javascript
const isAuth = window.spotifyIntegration.isAuthenticated();
console.log('Is Authenticated:', isAuth);
console.log('Access Token exists:', !!window.spotifyIntegration.accessToken);
```

### Test 4: Manually Fetch Playlists
```javascript
window.spotifyIntegration.getUserPlaylists(5)
  .then(playlists => {
    console.log('✅ Success! Playlists:', playlists);
    playlists.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} (${p.tracks.total} tracks)`);
    });
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });
```

### Test 5: Force Open Modal
```javascript
window.spotifyUI.openMyPlaylistsModal();
```

### Test 6: Check Modal Elements
```javascript
const elements = {
  overlay: document.getElementById('playlistPickerOverlay'),
  title: document.getElementById('playlistPickerTitle'),
  loading: document.getElementById('playlistLoading'),
  grid: document.getElementById('playlistGrid')
};
console.log('Modal Elements:', elements);
Object.entries(elements).forEach(([key, el]) => {
  console.log(`${key}:`, el ? '✅ Found' : '❌ Missing');
});
```

## Expected Behavior Summary

### When Connected to Spotify:
✅ "My Playlists" button is visible (purple button)
✅ Button shows music note icon + "My Playlists" text
✅ Clicking opens a modal overlay
✅ Modal shows your playlists with album art
✅ Clicking a playlist loads it in the Spotify embed player

### When Not Connected:
❌ "My Playlists" button is hidden
✅ Only "Connect" button visible

## Screenshot of What Success Looks Like

**Button Location:**
- Top right of Spotify player section
- Purple gradient button
- Next to green "Disconnect" button

**Modal Should Show:**
- Full-screen overlay (dark background)
- White modal box in center
- "My Playlists" title at top
- Grid of playlist cards with:
  - Album artwork
  - Playlist name
  - Track count and owner

## Next Steps After Testing

### If Everything Works ✅
Great! Commit your changes:
```bash
git commit -m "fix: Add debugging for My Playlists feature"
git push origin main
```

### If You See Errors ❌
1. Copy ALL console logs
2. Note which test failed
3. Share the error messages
4. I'll help you fix the specific issue

## One-Line Health Check

Run this in console for quick status:
```javascript
console.log({
  buttonExists: !!document.getElementById('myPlaylistsBtn'),
  buttonVisible: document.getElementById('myPlaylistsBtn')?.style.display,
  spotifyLoaded: !!window.spotifyIntegration,
  uiLoaded: !!window.spotifyUI,
  authenticated: window.spotifyIntegration?.isAuthenticated(),
  modalExists: !!document.getElementById('playlistPickerOverlay')
});
```

Expected output when working:
```javascript
{
  buttonExists: true,
  buttonVisible: "flex",
  spotifyLoaded: true,
  uiLoaded: true,
  authenticated: true,
  modalExists: true
}
```
