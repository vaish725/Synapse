/**
 * Spotify UI Controller for Synapse Extension
 */

class SpotifyUI {
  constructor() {
    console.log('🎵 Initializing Spotify UI...');
    this.spotify = window.spotifyIntegration;
    this.isConnected = false;
    this.currentTrack = null;
    this.isPlaying = false;
    
    // Wait for Spotify integration to be ready
    if (!this.spotify) {
      console.error('❌ Spotify integration not loaded!');
      return;
    }
    
    console.log('✅ Spotify integration found');
    
    this.initializeElements();
    this.attachEventListeners();
    
    // Check connection after a short delay to ensure everything is loaded
    setTimeout(() => {
      this.checkConnectionStatus();
    }, 100);
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    console.log('🔍 Finding DOM elements...');
    this.connectBtn = document.getElementById('spotifyConnectBtn');
    this.myPlaylistsBtn = document.getElementById('myPlaylistsBtn');
    this.disconnectedView = document.getElementById('spotifyDisconnected');
    this.connectedView = document.getElementById('spotifyConnected');
    this.albumArt = document.getElementById('spotifyAlbumArt');
    this.trackName = document.getElementById('spotifyTrackName');
    this.artistName = document.getElementById('spotifyArtistName');
    this.playBtn = document.getElementById('spotifyPlayBtn');
    this.prevBtn = document.getElementById('spotifyPrevBtn');
    this.nextBtn = document.getElementById('spotifyNextBtn');
    this.playlistBtns = document.querySelectorAll('.spotify-playlist-btn');
    
    console.log('Connect button:', this.connectBtn);
    console.log('My Playlists button:', this.myPlaylistsBtn);
    console.log('Disconnected view:', this.disconnectedView);
    console.log('Connected view:', this.connectedView);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Connect/Disconnect button
    if (this.connectBtn) {
      this.connectBtn.addEventListener('click', (e) => {
        console.log('🎵 Connect button clicked!');
        e.preventDefault();
        this.handleConnectClick();
      });
    } else {
      console.error('❌ Connect button not found!');
    }
    
    // My Playlists button
    if (this.myPlaylistsBtn) {
      this.myPlaylistsBtn.addEventListener('click', (e) => {
        console.log('🎵 My Playlists button clicked!');
        e.preventDefault();
        e.stopPropagation();
        this.openMyPlaylistsModal();
      });
    } else {
      console.error('❌ My Playlists button not found in DOM!');
    }

    // Focus playlist buttons - load genre pages directly
    const playlistButtons = document.querySelectorAll('.spotify-playlist-btn');
    playlistButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const genreType = btn.dataset.playlist;
        console.log('Loading genre:', genreType);
        this.loadGenreEmbed(genreType);
      });
    });

    // Playlist picker close button
    const closeBtn = document.getElementById('playlistPickerClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePlaylistPicker());
    }

    // Playlist picker overlay (close on background click)
    const overlay = document.getElementById('playlistPickerOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closePlaylistPicker();
        }
      });
    }

    // Playlist picker tabs
    const tabs = document.querySelectorAll('.playlist-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Load appropriate playlists
        const tabType = tab.dataset.tab;
        if (tabType === 'genre') {
          this.loadGenrePlaylists(this.currentGenre);
        } else if (tabType === 'user') {
          this.loadUserPlaylists();
        }
      });
    });
  }

  /**
   * Check if already connected
   */
  async checkConnectionStatus() {
    try {
      const isAuth = await this.spotify.loadTokens();
      console.log('Spotify auth check:', isAuth);
      
      if (isAuth && this.spotify.isAuthenticated()) {
        this.showConnectedState();
        
        // Load a default focus playlist in the embed player
        // Using Deep Focus playlist as default
        const defaultPlaylistId = '37i9dQZF1DWZeKCadgRdKQ'; // Deep Focus
        this.loadSpotifyEmbed(defaultPlaylistId);
      } else {
        this.showDisconnectedState();
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      this.showDisconnectedState();
    }
  }

  /**
   * Handle connect/disconnect button click
   */
  async handleConnectClick() {
    if (this.isConnected) {
      // Disconnect
      await this.spotify.disconnect();
      this.showDisconnectedState();
    } else {
      // Connect - Launch OAuth flow
      console.log('Starting Spotify authentication...');
      this.connectBtn.disabled = true;
      this.connectBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Connecting...</span>
      `;
      
      try {
        const success = await this.spotify.authenticate();
        console.log('Spotify authentication result:', success);
        
        if (success) {
          this.showConnectedState();
          
          // Load default playlist in embed player
          const defaultPlaylistId = '37i9dQZF1DWZeKCadgRdKQ'; // Deep Focus
          this.loadSpotifyEmbed(defaultPlaylistId);
        } else {
          alert('Failed to connect to Spotify. Please check your credentials and try again.');
          this.connectBtn.disabled = false;
          this.updateConnectButton();
        }
      } catch (error) {
        console.error('Spotify authentication error:', error);
        alert(`Failed to connect to Spotify: ${error.message}`);
        this.connectBtn.disabled = false;
        this.updateConnectButton();
      }
    }
  }

  /**
   * Show disconnected state
   */
  showDisconnectedState() {
    this.isConnected = false;
    this.disconnectedView.style.display = 'flex';
    this.connectedView.style.display = 'none';
    if (this.myPlaylistsBtn) {
      this.myPlaylistsBtn.style.display = 'none';
    }
    this.updateConnectButton();
  }

  /**
   * Show connected state
   */
  showConnectedState() {
    this.isConnected = true;
    this.disconnectedView.style.display = 'none';
    this.connectedView.style.display = 'flex';
    if (this.myPlaylistsBtn) {
      this.myPlaylistsBtn.style.display = 'flex';
    }
    this.updateConnectButton();
  }

  /**
   * Update connect button text
   */
  updateConnectButton() {
    if (this.isConnected) {
      this.connectBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <span>Disconnect</span>
      `;
      this.connectBtn.style.background = '#dc2626';
    } else {
      this.connectBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        <span>Connect</span>
      `;
      this.connectBtn.style.background = '#1DB954';
    }
    this.connectBtn.disabled = false;
  }

  /**
   * Load Spotify embed with a curated playlist for the genre
   */
  loadGenreEmbed(genreType) {
    const embedPlayer = document.getElementById('spotifyEmbedPlayer');
    if (embedPlayer) {
      // Map genres to popular curated playlists
      const genrePlaylists = {
        focus: '37i9dQZF1DWZeKCadgRdKQ',  // Deep Focus
        lofi: '37i9dQZF1DWWQRwui0ExPn',   // Lofi Beats  
        chill: '37i9dQZF1DX4WYpdgoIcn6'   // Chill Hits
      };
      
      const playlistId = genrePlaylists[genreType];
      
      if (playlistId) {
        // Spotify Embed URL for playlist
        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
        embedPlayer.src = embedUrl;
        console.log('Loading genre playlist embed:', embedUrl);
      } else {
        console.error('Playlist not found for genre:', genreType);
      }
    }
  }

  /**
   * Open My Playlists modal
   */
  async openMyPlaylistsModal() {
    console.log('📂 Opening My Playlists modal...');
    
    const overlay = document.getElementById('playlistPickerOverlay');
    const title = document.getElementById('playlistPickerTitle');
    const loading = document.getElementById('playlistLoading');
    const grid = document.getElementById('playlistGrid');
    
    if (!overlay || !title || !loading || !grid) {
      console.error('❌ Modal elements not found:', { overlay, title, loading, grid });
      return;
    }
    
    console.log('✅ All modal elements found');
    
    // Set title
    title.textContent = 'My Playlists';
    
    // Show modal
    overlay.style.display = 'flex';
    loading.style.display = 'flex';
    grid.innerHTML = '';
    
    console.log('✅ Modal displayed, loading playlists...');
    
    // Hide the tabs for My Playlists view
    const tabs = document.querySelectorAll('.playlist-tab');
    const tabsContainer = document.querySelector('.playlist-picker-tabs');
    if (tabsContainer) {
      tabsContainer.style.display = 'none';
    }
    
    // Load user playlists
    await this.loadUserPlaylists();
  }

  /**
   * Open playlist picker for a genre
   */
  async openPlaylistPicker(genreType) {
    const overlay = document.getElementById('playlistPickerOverlay');
    const title = document.getElementById('playlistPickerTitle');
    const loading = document.getElementById('playlistLoading');
    const grid = document.getElementById('playlistGrid');
    
    // Set title based on genre
    const titles = {
      focus: '📚 Focus Playlists',
      lofi: '🎧 Lo-Fi Playlists',
      ambient: '🌊 Chill Playlists'
    };
    title.textContent = titles[genreType] || 'Choose a Playlist';
    
    // Show modal and tabs
    overlay.style.display = 'flex';
    loading.style.display = 'flex';
    grid.innerHTML = '';
    
    // Show tabs for genre view
    const tabsContainer = document.querySelector('.playlist-picker-tabs');
    if (tabsContainer) {
      tabsContainer.style.display = 'flex';
    }
    
    // Store current genre for tab switching
    this.currentGenre = genreType;
    
    // Load genre playlists
    await this.loadGenrePlaylists(genreType);
  }

  /**
   * Load playlists from a genre category
   */
  async loadGenrePlaylists(genreType) {
    const loading = document.getElementById('playlistLoading');
    const grid = document.getElementById('playlistGrid');
    
    try {
      const categoryId = this.spotify.focusCategories[genreType];
      const playlists = await this.spotify.getCategoryPlaylists(categoryId, 20);
      
      loading.style.display = 'none';
      
      if (playlists.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No playlists found</p>';
        return;
      }
      
      grid.innerHTML = playlists.map(playlist => `
        <div class="playlist-item" data-uri="${playlist.uri}">
          <img src="${playlist.images[0]?.url || ''}" alt="${playlist.name}" class="playlist-item-image">
          <div class="playlist-item-info">
            <div class="playlist-item-name">${playlist.name}</div>
            <div class="playlist-item-details">${playlist.description || 'Spotify Playlist'}</div>
          </div>
        </div>
      `).join('');
      
      // Add click handlers
      grid.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
          const uri = item.dataset.uri;
          this.playSelectedPlaylist(uri);
        });
      });
    } catch (error) {
      console.error('Error loading genre playlists:', error);
      loading.style.display = 'none';
      grid.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Failed to load playlists</p>';
    }
  }

  /**
   * Load user's personal playlists
   */
  async loadUserPlaylists() {
    console.log('📋 Loading user playlists...');
    const loading = document.getElementById('playlistLoading');
    const grid = document.getElementById('playlistGrid');
    
    loading.style.display = 'flex';
    grid.innerHTML = '';
    
    try {
      console.log('🔄 Fetching playlists from Spotify API...');
      const playlists = await this.spotify.getUserPlaylists(50);
      console.log(`✅ Received ${playlists.length} playlists`);
      
      loading.style.display = 'none';
      
      if (playlists.length === 0) {
        console.warn('⚠️ No playlists found for user');
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No playlists found</p>';
        return;
      }
      
      grid.innerHTML = playlists.map(playlist => `
        <div class="playlist-item" data-uri="${playlist.uri}">
          <img src="${playlist.images[0]?.url || ''}" alt="${playlist.name}" class="playlist-item-image">
          <div class="playlist-item-info">
            <div class="playlist-item-name">${playlist.name}</div>
            <div class="playlist-item-details">${playlist.tracks.total} tracks • ${playlist.owner.display_name}</div>
          </div>
        </div>
      `).join('');
      
      console.log('✅ Playlist UI rendered');
      
      // Add click handlers
      grid.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
          const uri = item.dataset.uri;
          console.log('🎵 Playing playlist:', uri);
          this.playSelectedPlaylist(uri);
        });
      });
    } catch (error) {
      console.error('❌ Error loading user playlists:', error);
      loading.style.display = 'none';
      grid.innerHTML = `<p style="text-align: center; color: var(--danger-color);">Failed to load playlists: ${error.message}</p>`;
    }
  }

  /**
   * Play a selected playlist
   */
  async playSelectedPlaylist(uri) {
    const overlay = document.getElementById('playlistPickerOverlay');
    overlay.style.display = 'none';
    
    // Extract playlist ID from URI (spotify:playlist:XXXX)
    const playlistId = uri.split(':')[2];
    
    // Load the playlist in the embed player
    this.loadSpotifyEmbed(playlistId);
  }

  /**
   * Load Spotify embed player with a playlist
   */
  loadSpotifyEmbed(playlistId) {
    const embedPlayer = document.getElementById('spotifyEmbedPlayer');
    if (embedPlayer) {
      // Spotify Embed URL format
      const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
      embedPlayer.src = embedUrl;
      console.log('Loading Spotify embed:', embedUrl);
    }
  }

  /**
   * Close playlist picker
   */
  closePlaylistPicker() {
    const overlay = document.getElementById('playlistPickerOverlay');
    overlay.style.display = 'none';
  }


}

// Initialize Spotify UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.spotifyUI = new SpotifyUI();
});
