# Synapse Folder Structure

This document explains the organization of the Synapse codebase.

## Root Directory
```
/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for time tracking and state management
├── settings.html/css/js   # Settings page
├── README.md              # Project overview
├── .gitignore             # Git ignore rules
├── icons/                 # Extension icons
├── popup/                 # Extension popup UI
├── src/                   # Source code organized by feature
└── docs/                  # Documentation files
```

## Popup Directory (`popup/`)
Contains all popup-related UI files:
- `popup.html` - Main popup interface
- `popup.css` - Popup styles
- `popup.js` - Popup logic and interactions

## Source Directory (`src/`)
Organized by feature and functionality:

### AI Features (`src/ai/`)
All AI-related functionality for insights and analysis:
- `ai-insights-multi.js` - Multi-model AI insights implementation
- `ai-insights.js` - Original AI insights module
- `content-ai.js` - Content script for AI features
- `content-multi-ai.js` - Multi-AI content script (used by manifest)
- `offscreen-ai.js` - Offscreen document for AI processing

### Spotify Integration (`src/spotify/`)
Spotify OAuth and music player features:
- `spotify-integration.js` - OAuth PKCE authentication and API integration
- `spotify-ui.js` - Spotify UI controller for playlists and player

### Utilities (`src/utils/`)
Helper scripts and tools:
- `clear-spotify-tokens.js` - Debug utility to clear Spotify authentication
- `check-gemini-setup.sh` - Script to verify Gemini AI setup

### Test Files (`src/`)
- `ai-test.html` - AI feature testing page
- `offscreen.html` - Offscreen document HTML for AI processing

## Documentation Directory (`docs/`)
All project documentation:
- `AI_INTEGRATION.md` - AI feature integration guide
- `SPOTIFY_SETUP.md` - Spotify setup instructions
- `PRE_FLIGHT.md` - Pre-submission checklist
- `FINAL_SPRINT.md` - Final development sprint notes
- `OFFSCREEN_FIX.md` - Offscreen document troubleshooting
- `FLAG_GUIDE.txt` - Feature flags guide
- `QUICK_SETUP.txt` - Quick setup instructions
- `prd.md` - Product Requirements Document
- `FOLDER_STRUCTURE.md` - This file

## File Reference Updates
After reorganization, the following files were updated with new paths:
1. `manifest.json` - Updated content_scripts path to `src/ai/content-multi-ai.js`
2. `popup/popup.html` - Updated script imports to reference `src/ai/` and `src/spotify/`
3. `src/offscreen.html` - Updated script src to `ai/offscreen-ai.js`

## Benefits of This Structure
- **Clear separation of concerns**: AI, Spotify, and utilities are in separate folders
- **Easy navigation**: Related files are grouped together
- **Maintainability**: New developers can quickly understand the codebase
- **Scalability**: Easy to add new features in appropriate folders
- **Clean root**: Only essential configuration files in root directory
