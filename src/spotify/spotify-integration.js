/**
 * Spotify Web API Integration for Synapse
 * Handles authentication, playback control, and playlist management
 */

class SpotifyIntegration {
  constructor() {
    this.clientId = '407b27873f2448bda132e770716208db'; // Your Spotify Client ID
    this.redirectUri = 'https://mgphnnmkakefndpmdjbecggpkiiihcac.chromiumapp.org/spotify';
    this.scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'user-read-email',
      'user-read-private',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];
    
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.player = null;
    this.deviceId = null;
    
    // Focus playlists categories
    this.focusCategories = {
      focus: '0JQ5DAqbMKFCbimwdOYlsl', // Focus genre
      lofi: '0JQ5DAqbMKFKDIyhfS9NTT', // Lo-Fi genre
      chill: '0JQ5DAqbMKFFzDl7qN9Apr'  // Chill genre
    };
    
    this.loadTokens();
  }

  /**
   * Load saved tokens from Chrome storage
   */
  async loadTokens() {
    const data = await chrome.storage.local.get(['spotifyAccessToken', 'spotifyRefreshToken', 'spotifyTokenExpiry']);
    this.accessToken = data.spotifyAccessToken || null;
    this.refreshToken = data.spotifyRefreshToken || null;
    this.tokenExpiry = data.spotifyTokenExpiry || null;
    
    if (this.accessToken && this.tokenExpiry) {
      if (Date.now() < this.tokenExpiry) {
        return true; // Token is still valid
      } else if (this.refreshToken) {
        return await this.refreshAccessToken();
      }
    }
    return false;
  }

  /**
   * Save tokens to Chrome storage
   */
  async saveTokens() {
    await chrome.storage.local.set({
      spotifyAccessToken: this.accessToken,
      spotifyRefreshToken: this.refreshToken,
      spotifyTokenExpiry: this.tokenExpiry
    });
  }

  /**
   * Start OAuth authentication flow with PKCE
   */
  async authenticate() {
    console.log('🎵 Starting Spotify OAuth flow with PKCE...');
    const authUrl = await this.buildAuthUrl();
    console.log('Auth URL:', authUrl);
    
    try {
      const redirectUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      });
      
      console.log('Redirect URL received:', redirectUrl);
      
      // Parse the authorization code from the redirect URL
      const url = new URL(redirectUrl);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (error) {
        console.error('❌ Authorization error:', error);
        throw new Error(`Authorization failed: ${error}`);
      }
      
      if (!code) {
        console.error('❌ No authorization code received');
        throw new Error('No authorization code in redirect URL');
      }
      
      console.log('✅ Authorization code received, exchanging for token...');
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          code_verifier: this.codeVerifier
        })
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('❌ Token exchange failed:', errorData);
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
      }
      
      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      const expiresIn = tokenData.expires_in || 3600;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
      
      console.log('✅ Access token received, expires in:', expiresIn, 'seconds');
      
      await this.saveTokens();
      console.log('✅ Tokens saved to storage');
      
      // Initialize player (find active devices)
      await this.initializePlayer();
      console.log('✅ Spotify player initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Spotify authentication failed:', error);
      return false;
    }
  }

  /**
   * Build Spotify authorization URL
   * Using Authorization Code with PKCE for better security
   */
  async buildAuthUrl() {
    // Generate code verifier and challenge for PKCE
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      show_dialog: 'true'
    });
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }
  
  /**
   * Generate code verifier for PKCE
   */
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }
  
  /**
   * Generate code challenge from verifier
   */
  generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    return crypto.subtle.digest('SHA-256', data).then(hash => {
      return this.base64URLEncode(new Uint8Array(hash));
    });
  }
  
  /**
   * Base64 URL encode
   */
  base64URLEncode(buffer) {
    const base64 = btoa(String.fromCharCode.apply(null, buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Refresh the access token (if using authorization code flow)
   */
  async refreshAccessToken() {
    // Note: Token refresh requires a backend server with client_secret
    // For Chrome extensions, we use implicit grant (no refresh token)
    // Users need to re-authenticate when token expires
    console.log('Token expired, need to re-authenticate');
    return false;
  }

  /**
   * Initialize Spotify Web Playback SDK
   * Note: Web Playback SDK requires external script loading which isn't supported in MV3
   * We'll use the Web API for playback control instead
   */
  async initializePlayer() {
    return new Promise((resolve, reject) => {
      // For Manifest V3, we can't load external scripts
      // We'll use Spotify Web API for playback control instead
      console.log('Using Spotify Web API for playback control');
      
      // Check if user has active devices
      this.getAvailableDevices().then(devices => {
        if (devices && devices.length > 0) {
          this.deviceId = devices[0].id;
          resolve(this.deviceId);
        } else {
          console.log('No active Spotify devices found. Please open Spotify on another device.');
          resolve(null);
        }
      }).catch(err => {
        console.error('Error getting devices:', err);
        reject(err);
      });
      
      /* Original Web Playback SDK code - not compatible with MV3
      if (!window.Spotify) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.head.appendChild(script);
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
          name: 'Synapse Focus Timer',
          getOAuthToken: cb => { cb(this.accessToken); },
          volume: 0.5
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => {
          console.error('Spotify initialization error:', message);
          reject(message);
        });
        
        player.addListener('authentication_error', ({ message }) => {
          console.error('Spotify authentication error:', message);
          this.disconnect();
          reject(message);
        });
        
        player.addListener('account_error', ({ message }) => {
          console.error('Spotify account error:', message);
          reject(message);
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
          console.log('Spotify player ready with Device ID', device_id);
          this.deviceId = device_id;
          resolve(device_id);
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
          console.log('Spotify device has gone offline', device_id);
        });

        // Player state changes
        player.addListener('player_state_changed', state => {
          if (state) {
            this.updatePlayerUI(state);
          }
        });

        // Connect to player
        player.connect();
        this.player = player;
      };
      */
    });
  }
  
  /**
   * Get available Spotify devices
   */
  async getAvailableDevices() {
    if (!this.isAuthenticated()) return [];
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to get devices');
      
      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }

  /**
   * Disconnect and clear tokens
   */
  async disconnect() {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
    
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.deviceId = null;
    
    await chrome.storage.local.remove(['spotifyAccessToken', 'spotifyRefreshToken', 'spotifyTokenExpiry']);
  }

  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying() {
    if (!this.isAuthenticated()) return null;
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (response.status === 204) return null; // Nothing playing
      if (!response.ok) throw new Error('Failed to get current track');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting current track:', error);
      return null;
    }
  }

  /**
   * Play/Resume playback
   */
  async play(contextUri = null, uris = null) {
    if (!this.isAuthenticated()) return false;
    
    const body = {};
    if (contextUri) body.context_uri = contextUri;
    if (uris) body.uris = uris;
    if (this.deviceId) body.device_id = this.deviceId;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play${this.deviceId ? `?device_id=${this.deviceId}` : ''}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          console.warn('⚠️ No active device. Please open Spotify on desktop/web/mobile and start playing.');
        } else {
          console.error('Playback error:', error);
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      return false;
    }
  }

  /**
   * Pause playback
   */
  async pause() {
    if (!this.isAuthenticated()) return false;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/pause${this.deviceId ? `?device_id=${this.deviceId}` : ''}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error pausing playback:', error);
      return false;
    }
  }

  /**
   * Skip to next track
   */
  async nextTrack() {
    if (!this.isAuthenticated()) return false;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/next${this.deviceId ? `?device_id=${this.deviceId}` : ''}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error skipping track:', error);
      return false;
    }
  }

  /**
   * Skip to previous track
   */
  async previousTrack() {
    if (!this.isAuthenticated()) return false;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/previous${this.deviceId ? `?device_id=${this.deviceId}` : ''}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error going to previous track:', error);
      return false;
    }
  }

  /**
   * Play a specific playlist by URI or ID
   */
  async playPlaylist(playlistUri) {
    if (!this.isAuthenticated()) return false;
    
    // Convert ID to URI if needed
    const uri = playlistUri.startsWith('spotify:') 
      ? playlistUri 
      : `spotify:playlist:${playlistUri}`;
    
    return await this.play(uri);
  }

  /**
   * Update player UI with current state
   */
  updatePlayerUI(state) {
    const event = new CustomEvent('spotifyStateChange', {
      detail: {
        track: state.track_window.current_track,
        isPlaying: !state.paused,
        position: state.position,
        duration: state.duration
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(limit = 50) {
    console.log('📋 getUserPlaylists called');
    
    if (!this.isAuthenticated()) {
      console.error('❌ Not authenticated - cannot fetch playlists');
      return [];
    }
    
    console.log('✅ Authenticated, fetching playlists...');
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      console.log('📡 Spotify API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Spotify API error:', errorData);
        throw new Error(`Failed to get playlists: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Retrieved ${data.items?.length || 0} playlists`);
      return data.items || [];
    } catch (error) {
      console.error('❌ Error fetching user playlists:', error);
      throw error; // Re-throw to let UI handle it
    }
  }

  /**
   * Get playlists from a specific category
   */
  async getCategoryPlaylists(categoryId, limit = 20) {
    if (!this.isAuthenticated()) return [];
    
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to get category playlists');
      
      const data = await response.json();
      return data.playlists.items;
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  }
}

// Export for use in popup
window.spotifyIntegration = new SpotifyIntegration();
