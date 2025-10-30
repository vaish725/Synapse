# Spotify Integration Setup Guide for Synapse

## 📋 Prerequisites
- Spotify Premium account (required for Web Playback SDK)
- Chrome Extension ID (get this after loading the extension)

## 🔧 Setup Steps

### Step 1: Create Spotify Developer Account
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"

### Step 2: Configure Your Spotify App
1. **App Name**: `Synapse Focus Timer` (or any name you prefer)
2. **App Description**: `AI-powered productivity extension with integrated music player`
3. **Website**: Leave blank or use your GitHub repo URL
4. **Redirect URIs**: Add the following:
   ```
   https://<YOUR_EXTENSION_ID>.chromiumapp.org/spotify
   ```
   **Note**: Replace `<YOUR_EXTENSION_ID>` with your actual Chrome extension ID
   
   To find your extension ID:
   - Load the extension in Chrome
   - Go to `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Copy the ID shown under your extension name

5. **Which API/SDKs are you planning to use?**: 
   - Check "Web API"
   - Check "Web Playback SDK"

6. Click "Save"

### Step 3: Get Your Client ID
1. In your Spotify app dashboard, click on your app
2. Click "Settings"
3. Copy the **Client ID**

### Step 4: Configure the Extension
1. Open `spotify-integration.js`
2. Replace `YOUR_SPOTIFY_CLIENT_ID` with your actual Client ID:
   ```javascript
   this.clientId = 'your_actual_client_id_here';
   ```

3. Open `manifest.json`
4. Replace `YOUR_SPOTIFY_CLIENT_ID` in the `oauth2` section:
   ```json
   "oauth2": {
     "client_id": "your_actual_client_id_here",
     ...
   }
   ```

### Step 5: Update Redirect URI in Code
1. After getting your extension ID, update `spotify-integration.js`:
   ```javascript
   this.redirectUri = 'https://<YOUR_EXTENSION_ID>.chromiumapp.org/spotify';
   ```

### Step 6: Reload Extension
1. Go to `chrome://extensions`
2. Click the reload button on your Synapse extension
3. Open the extension popup
4. Click "Connect" in the Spotify section
5. Authorize the app in the Spotify login window

## 🎵 Features

### Authentication
- ✅ OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange)
- ✅ Secure token storage in Chrome local storage
- ✅ Auto re-authentication when token expires
- ✅ Refresh token support for seamless re-authentication

**Authentication Flow:**
1. Click "Connect" button
2. If not logged into Spotify in your browser, you'll see the login page
3. If already logged in, you'll go directly to the consent screen
4. Review permissions and click "Agree"
5. You'll be redirected back to the extension automatically

### Playback Control
- ✅ Play/Pause
- ✅ Next track
- ✅ Previous track
- ✅ Album art display
- ✅ Current track information

### Focus Playlists
- 📚 **Focus**: Deep Focus playlist for concentration
- 🎧 **Lo-Fi**: Lo-Fi Beats for relaxed work
- 🌊 **Chill**: Ambient music for calm focus

### Web Playback SDK
- ✅ Plays music directly in the extension
- ✅ Real-time track updates
- ✅ Device management

## 🔐 Security Notes

1. **Client ID is Public**: The Client ID in the code is not sensitive and can be public
2. **No Client Secret**: Chrome extensions use implicit grant flow (no secret required)
3. **Token Storage**: Access tokens are stored securely in Chrome local storage
4. **Token Expiry**: Tokens expire after 1 hour; users need to re-authenticate

## 🐛 Troubleshooting

### "Failed to connect to Spotify"
- Check that your Client ID is correct
- Verify redirect URI matches exactly (including extension ID)
- Make sure you have Spotify Premium

### "No Active Device Found" or 403 Errors
**This is the most common issue!** The extension controls Spotify playback on your existing devices.

**Solution:**
1. Open Spotify on at least ONE device:
   - Spotify Desktop App (Windows/Mac)
   - Spotify Web Player (open.spotify.com)
   - Spotify Mobile App
2. Start playing ANY song on that device
3. The extension will now detect your device and controls will work

**Why?** The Spotify Web API requires an active device to send playback commands to. The extension doesn't create its own player; it controls your existing Spotify sessions.

### Authentication skips login page
This is NORMAL behavior! If you're already logged into Spotify in your browser:
- Spotify skips the login screen
- Shows only the consent/permissions screen
- This is standard OAuth behavior for better UX

### "Token expired" errors
- Click "Connect" again to re-authenticate
- Tokens automatically expire after 1 hour
- Refresh tokens will auto-renew sessions in future updates

## 📝 Custom Playlists

To add your own custom playlists, edit the `focusPlaylists` object in `spotify-integration.js`:

```javascript
this.focusPlaylists = {
  focus: 'YOUR_PLAYLIST_ID',
  lofi: 'YOUR_PLAYLIST_ID',
  ambient: 'YOUR_PLAYLIST_ID'
};
```

To find a playlist ID:
1. Open Spotify
2. Right-click on a playlist
3. Select "Share" → "Copy Spotify URI"
4. Extract the ID from the URI: `spotify:playlist:<PLAYLIST_ID>`

## 🎉 You're All Set!

Your Synapse extension now has full Spotify integration! Enjoy focus music while tracking your productivity.

## 📚 Resources
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Web Playback SDK Guide](https://developer.spotify.com/documentation/web-playback-sdk)
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
