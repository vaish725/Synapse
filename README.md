# Synapse — Chrome Extension (MVP)



**AI-Powered Focus & Time Management Chrome Extension**This repository contains the Synapse Chrome extension (MVP) — a local-first productivity tracker that uses on-device AI (Gemini Nano) to generate personalized insights.



Synapse helps students, developers, and remote workers maximize focus and improve time management by converting browsing activity into actionable, personalized behavioral insights using on-device AI (Gemini Nano).This scaffold was generated to speed up development. It includes a minimal Manifest V3, a service worker stub, a React + Vite popup, storage helpers, and an AI client mock for offline development.



How to run



## 🚀 Features1. Install dependencies:



### ✅ Core Features (MVP)```bash

- **Active Time Tracking**: Automatically tracks time spent on each domain with idle detection# in project root

- **Site Categorization**: Tag sites as Work, Neutral, or Unproductivenpm install

- **Pomodoro Timer**: Customizable focus sessions with break reminders```

- **Focus Mode**: Soft-block unproductive sites during work sessions

- **Privacy-First**: All data stored locally, no external servers2. Start the dev build:

- **Real-time Dashboard**: View today's Work vs Unproductive time at a glance

```bash

### 🤖 AI-Powered Featuresnpm run dev

- **On-Device Analysis**: Uses Gemini Nano Prompt API for local behavioral insights```

- **Personalized Suggestions**: Get actionable recommendations based on your patterns

- **Zero Data Sharing**: All analysis happens on your device3. Load the extension in Chrome (developer mode):

- Open chrome://extensions

---- Enable Developer mode

- Load unpacked and point to the `dist/` folder (or the folder Vite outputs build files to)

## 📦 Installation

Notes

### Development Mode- This scaffold assumes a TypeScript + React stack. If you'd rather use vanilla JS, we can switch and simplify the setup.

- The AI client includes a mocked responder; replace with real Gemini Nano integration when credentials are available.

1. Clone this repository:
   ```bash
   git clone https://github.com/vaish725/Synapse.git
   cd Synapse
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked" and select the `Synapse` folder

5. The extension icon should appear in your toolbar!

### Production (Coming Soon)
Will be available on the Chrome Web Store after initial release.

---

## 🛠️ Project Structure

```
Synapse/
├── manifest.json           # Chrome extension manifest (V3)
├── background.js          # Service worker (time tracking, idle detection)
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic (Pomodoro, stats, AI)
├── icons/                 # Extension icons (16, 32, 48, 128)
├── prd.md                 # Product Requirements Document
└── README.md              # This file
```

---

## 🎯 Usage

### 1. **Track Your Time**
- Simply browse as usual - Synapse automatically tracks active time per domain
- Only counts time when you're actively using the browser (pauses on idle)

### 2. **Categorize Sites**
- Open the popup and select the current site's category:
  - **Work**: Productive sites (e.g., GitHub, documentation)
  - **Neutral**: Neither productive nor distracting
  - **Unproductive**: Distracting sites (e.g., social media)

### 3. **Use Pomodoro Timer**
- Click "Start" to begin a 25-minute focus session
- Enable "Focus Mode" to get warnings when visiting unproductive sites
- Take breaks when the timer completes

### 4. **Get AI Insights**
- Click "Generate" in the AI Insights section
- Receive personalized behavioral analysis:
  - Most time-consuming unproductive site
  - Least productive time slots
  - Actionable suggestions for improvement

---

## 🔐 Privacy & Ethics

### Privacy Guarantees
- ✅ All data stored locally (`chrome.storage.local`)
- ✅ No external servers or data transmission
- ✅ User can delete all data at any time
- ✅ On-device AI processing only (Gemini Nano)

### Ethical Constraints
- ❌ No medical diagnosis language (e.g., ADHD, depression)
- ✅ Behavioral observations only
- ✅ Clear disclaimer: insights are for productivity improvement, not medical advice
- ✅ Full user control over data

---

## 🧪 Testing

### Manual Testing
1. Load extension in Chrome
2. Visit different websites and verify time tracking
3. Categorize sites and check stats update
4. Test Pomodoro timer and Focus Mode
5. Generate insights and verify output

### Automated Testing (Coming Soon)
- Unit tests for time aggregation logic
- Integration tests for storage operations
- CI/CD pipeline with GitHub Actions

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- [x] Time tracking engine
- [x] Site categorization
- [x] Pomodoro timer
- [x] Focus Mode
- [x] Basic dashboard
- [x] Gemini Nano integration
- [x] Privacy & ethics compliance

### Phase 2: Enhancements
- [ ] Advanced analytics & charts
- [ ] Weekly/monthly reports
- [ ] Export/import data
- [ ] Custom Pomodoro durations
- [ ] Dark mode

### Phase 3: Integrations
- [ ] Spotify music control
- [ ] Calendar integration
- [ ] Mobile companion app

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Authors

- **Vaishnavi Kamdi** - [@vaish725](https://github.com/vaish725)

---

## 🙏 Acknowledgments

- Built for the Chrome Extension Hackathon 2025
- Powered by Google's Gemini Nano API
- Inspired by the need for privacy-preserving productivity tools

---

## 📞 Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/vaish725/Synapse/issues)
- 💡 Request features: [GitHub Discussions](https://github.com/vaish725/Synapse/discussions)
- 📧 Contact: [Your Email]

---

**Made with ❤️ and ☕ by developers, for developers**
