# Synapse Development Guide

## Folder Structure Best Practices

### 📁 Organized File Structure Policy

**Golden Rule**: Keep related files together, separate by functionality, and maintain a clean root directory.

### Directory Organization

```
Synapse/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Service worker (NO subfolders for simple extensions)
├── settings.html/css/js       # Settings page files
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore patterns
│
├── icons/                     # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── ...
│
├── popup/                     # Popup UI (all popup-related files together)
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
│
├── src/                       # Source code organized by feature
│   ├── ai/                   # AI-related functionality
│   │   ├── ai-insights-multi.js
│   │   ├── content-multi-ai.js
│   │   ├── offscreen-ai.js
│   │   └── ...
│   │
│   ├── spotify/              # Spotify integration
│   │   ├── spotify-integration.js
│   │   ├── spotify-ui.js
│   │   └── ...
│   │
│   ├── utils/                # Utility scripts
│   │   ├── clear-spotify-tokens.js
│   │   ├── check-gemini-setup.sh
│   │   └── ...
│   │
│   └── [feature test files]  # Feature-specific test/demo files
│       ├── ai-test.html
│       └── offscreen.html
│
└── docs/                      # All documentation
    ├── DEVELOPMENT_GUIDE.md  # This file
    ├── FOLDER_STRUCTURE.md   # Folder organization reference
    ├── AI_INTEGRATION.md     # AI feature docs
    ├── SPOTIFY_SETUP.md      # Spotify setup guide
    └── ...
```

### 🎯 Folder Organization Rules

#### 1. **Feature-Based Organization** (`src/`)
- Group files by feature/functionality
- Each feature gets its own subfolder under `src/`
- Examples: `src/ai/`, `src/spotify/`, `src/analytics/`

#### 2. **UI Components** (`popup/`, `settings.*`)
- Keep UI-related files together
- Popup files stay in `popup/` folder
- Settings page files at root (small number of files)

#### 3. **Utilities** (`src/utils/`)
- Helper scripts, dev tools, setup scripts
- Cross-feature utilities
- Debug/maintenance scripts

#### 4. **Documentation** (`docs/`)
- ALL `.md` files except root `README.md`
- Guides, setup instructions, architecture docs
- Keep root clean - only `README.md` at top level

#### 5. **Configuration** (Root)
- Only essential config files at root:
  - `manifest.json`
  - `background.js` (simple service worker)
  - `settings.html/css/js` (if not many files)
  - `README.md`
  - `.gitignore`
  - `package.json` (if using npm)

### ⚠️ Anti-Patterns to Avoid

❌ **Don't do this:**
```
Synapse/
├── file1.js
├── file2.js
├── file3.js
├── spotify-thing.js
├── ai-stuff.js
├── another-file.js
└── ... (20+ files at root)
```

✅ **Do this instead:**
```
Synapse/
├── manifest.json
├── background.js
├── src/
│   ├── ai/
│   │   └── ai-stuff.js
│   └── spotify/
│       └── spotify-thing.js
└── docs/
    └── ...
```

### 🔄 When Adding New Features

**Step 1**: Decide the feature category
- Is it a new major feature? → Create `src/new-feature/`
- Is it a utility? → Add to `src/utils/`
- Is it UI? → Consider `popup/` or new UI folder
- Is it documentation? → Add to `docs/`

**Step 2**: Update file references
- Check `manifest.json` for content scripts, background scripts
- Check HTML files for `<script src="...">` tags
- Update relative paths to match new location

**Step 3**: Test
- Reload extension in `chrome://extensions`
- Verify all features work
- Check browser console for path errors

### 📝 File Naming Conventions

- **JavaScript**: `kebab-case.js` (e.g., `spotify-integration.js`)
- **TypeScript**: `kebab-case.ts` (if using TS)
- **HTML**: `kebab-case.html` (e.g., `ai-test.html`)
- **CSS**: `kebab-case.css`
- **Documentation**: `SCREAMING_SNAKE_CASE.md` (e.g., `SPOTIFY_SETUP.md`)
- **Config files**: Standard names (`manifest.json`, `.gitignore`)

### 🚀 TypeScript Projects (Future Consideration)

If you add TypeScript in the future:

```
Synapse/
├── src/
│   ├── background/
│   │   └── index.ts
│   ├── popup/
│   │   └── popup.ts
│   └── ...
├── dist/                     # Compiled output (gitignored)
├── tsconfig.json
├── package.json
└── ...
```

**Important for TS:**
1. Install types: `npm install --save-dev @types/chrome`
2. Configure `tsconfig.json` properly
3. Add build scripts to `package.json`
4. Update `manifest.json` to point to compiled files in `dist/`
5. Add `dist/` to `.gitignore`

### 🔧 Updating File References After Reorganization

When you reorganize files, update these locations:

1. **`manifest.json`**
   ```json
   {
     "background": {
       "service_worker": "background.js"  // ← Check this
     },
     "content_scripts": [{
       "js": ["src/ai/content-multi-ai.js"]  // ← Check this
     }]
   }
   ```

2. **HTML files** (`popup.html`, `settings.html`, etc.)
   ```html
   <script src="../src/ai/ai-insights.js"></script>  // ← Update paths
   ```

3. **JavaScript imports**
   ```javascript
   import { something } from '../utils/helper.js'  // ← Update paths
   ```

### ✅ Checklist for Clean Codebase

- [ ] No loose JavaScript files at root (except essential configs)
- [ ] Features organized in `src/[feature]/`
- [ ] Documentation in `docs/`
- [ ] Utilities in `src/utils/`
- [ ] UI components grouped together
- [ ] All file references updated
- [ ] Extension loads without errors
- [ ] `.gitignore` covers build artifacts

### 🎓 Benefits of Good Organization

1. **Easy Navigation**: Find files quickly by feature
2. **Maintainability**: Related code stays together
3. **Scalability**: Easy to add new features
4. **Collaboration**: Other developers understand structure
5. **Professional**: Shows attention to code quality

### 📚 Additional Resources

- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Project Structure Patterns](https://github.com/goldbergyoni/nodebestpractices)
- See `docs/FOLDER_STRUCTURE.md` for current Synapse structure

---

**Remember**: Good organization is not about perfection—it's about making your codebase easier to work with as it grows. Start with this structure and adapt as needed! 🚀
