# Synapse - Quick Reference Card

## 🎯 Folder Structure at a Glance

```
Synapse/
├── 📄 manifest.json           → Extension config
├── ⚙️  background.js           → Service worker
├── 🎨 popup/                  → Popup UI
├── ⚙️  settings.*              → Settings page
├── 🖼️  icons/                  → Extension icons
├── 💻 src/                    → Source code
│   ├── 🤖 ai/                 → AI features (5 files)
│   ├── 🎵 spotify/            → Spotify integration (2 files)
│   └── 🔧 utils/              → Utilities (2 files)
└── 📚 docs/                   → Documentation (9 files)
```

## 📁 File Count by Category

| Category | Files | Location |
|----------|-------|----------|
| **AI Features** | 5 | `src/ai/` |
| **Spotify** | 2 | `src/spotify/` |
| **Utilities** | 2 | `src/utils/` |
| **Documentation** | 9 | `docs/` |
| **UI Components** | 6 | `popup/`, root |
| **Config Files** | 2 | root |
| **Icons** | 4 | `icons/` |

## 🔍 Where to Find Things

### Adding AI Features?
→ `src/ai/` - All AI-related code goes here

### Adding Spotify Features?
→ `src/spotify/` - OAuth, API, player code

### Need a Utility Script?
→ `src/utils/` - Helper scripts, dev tools

### Writing Documentation?
→ `docs/` - All markdown files except README.md

### Modifying UI?
→ `popup/` for popup, `settings.*` for settings page

## ⚡ Quick Commands

### Reload Extension
```bash
# In Chrome: chrome://extensions
# Click refresh icon on Synapse extension
```

### Check File Structure
```bash
cd /Users/vaishnavikamdi/Documents/Synapse
find . -type f -not -path '*/\.git/*' | wc -l  # Count files
```

### Verify No TypeScript Files
```bash
find . -name "*.ts" -type f  # Should return nothing
```

## 🐛 Fixing TypeScript Phantom Errors

If you see TypeScript errors for deleted files:

**Quick Fix**: Reload VS Code Window
- `Cmd+Shift+P` → "Developer: Reload Window"

**Alternative**: Restart TypeScript Server
- `Cmd+Shift+P` → "TypeScript: Restart TS Server"

## 📝 File Path Quick Reference

### Current Locations:
- ✅ `src/ai/content-multi-ai.js` (used in manifest.json)
- ✅ `src/ai/ai-insights-multi.js` (used in popup.html)
- ✅ `src/ai/offscreen-ai.js` (used in src/offscreen.html)
- ✅ `src/spotify/spotify-integration.js` (used in popup.html)
- ✅ `src/spotify/spotify-ui.js` (used in popup.html)

### Files Updated with New Paths:
- ✅ `manifest.json` - content_scripts path
- ✅ `popup/popup.html` - script imports
- ✅ `src/offscreen.html` - offscreen-ai.js path

## 🎨 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| JavaScript | kebab-case | `spotify-integration.js` |
| HTML | kebab-case | `ai-test.html` |
| CSS | kebab-case | `popup.css` |
| Docs | SCREAMING_SNAKE | `SPOTIFY_SETUP.md` |
| Config | standard | `manifest.json` |

## 📚 Documentation Index

| File | Purpose |
|------|---------|
| `DEVELOPMENT_GUIDE.md` | 🎓 Folder structure best practices |
| `FOLDER_STRUCTURE.md` | 📁 Current structure reference |
| `TYPESCRIPT_ERROR_RESOLUTION.md` | 🐛 TS error fix guide |
| `AI_INTEGRATION.md` | 🤖 AI features documentation |
| `SPOTIFY_SETUP.md` | 🎵 Spotify OAuth setup |
| `PRE_FLIGHT.md` | ✈️ Pre-submission checklist |
| `FINAL_SPRINT.md` | 🏃 Sprint notes |

## ✅ Organization Checklist

- [x] Files organized by feature
- [x] Documentation in docs/ folder
- [x] Utilities in src/utils/
- [x] Clean root directory
- [x] All paths updated in manifest/HTML
- [x] No TypeScript files (pure JavaScript)
- [x] .gitignore covers build artifacts
- [x] Development guides created

## 🚀 Next Steps

1. **Reload VS Code** to clear phantom TS errors
2. **Test extension** in chrome://extensions
3. **Continue development** with organized structure
4. **Follow guidelines** in DEVELOPMENT_GUIDE.md

---

💡 **Pro Tip**: Bookmark `docs/DEVELOPMENT_GUIDE.md` for detailed explanations of the folder structure!
