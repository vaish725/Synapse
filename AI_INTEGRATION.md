# Gemini Nano AI Integration - Documentation

## Overview

Synapse uses **Gemini Nano**, Chrome's built-in on-device AI model, to generate personalized productivity insights. All AI processing happens locally on your device - no data is ever sent to external servers.

---

## Features

### ✨ AI-Powered Analysis
- **Behavioral Pattern Recognition**: Analyzes your browsing habits to identify productivity patterns
- **Contextual Insights**: Provides personalized suggestions based on your work/unproductive time ratio
- **Distraction Detection**: Identifies your biggest time sinks and suggests improvements
- **Actionable Tips**: Generates specific, practical recommendations

### 🔒 Privacy-First Design
- **100% On-Device Processing**: All AI runs locally using Chrome's built-in Gemini Nano
- **No External API Calls**: Zero data transmission to external servers
- **Ethical Safeguards**: Filters out any medical/diagnostic language
- **User Control**: Data can be deleted anytime from settings

---

## How It Works

### 1. **Data Aggregation**
When you click "Generate Insights":
- Retrieves today's browsing data from local storage
- Aggregates time spent per site category (Work/Neutral/Unproductive)
- Calculates productivity ratios and patterns

### 2. **AI Analysis**
Two modes depending on availability:

#### **Mode A: Gemini Nano (Preferred)**
- Checks if `window.ai.languageModel` API is available
- Creates an AI session with controlled parameters
- Sends sanitized data to on-device model
- Receives and validates AI-generated insights

#### **Mode B: Enhanced Fallback**
- Used when Gemini Nano is unavailable
- Rule-based analysis with contextual logic
- Provides structured insights based on productivity metrics
- Still delivers valuable, actionable feedback

### 3. **Safety & Sanitization**
Before displaying any AI output:
- **Medical Term Filtering**: Blocks ADHD, anxiety, depression, OCD, etc.
- **Length Validation**: Ensures response isn't too verbose
- **Content Review**: Checks for diagnostic language
- **Fallback Trigger**: If unsafe content detected, uses rule-based output

---

## Enabling Gemini Nano in Chrome

### Requirements
- **Chrome Version**: 127+ (Dev/Canary channels recommended)
- **Operating System**: Windows, macOS, Linux, ChromeOS
- **Minimum RAM**: 4GB (8GB+ recommended)

### Setup Steps

#### Option 1: Chrome Dev/Canary (Recommended)
1. Download [Chrome Dev](https://www.google.com/chrome/dev/) or [Chrome Canary](https://www.google.com/chrome/canary/)
2. Navigate to `chrome://flags`
3. Enable these flags:
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
   - `#prompt-api-for-gemini-nano` → **Enabled**
4. Restart Chrome
5. Verify at `chrome://components` → "Optimization Guide On Device Model" should download

#### Option 2: Chrome Stable (Limited Availability)
1. Check `chrome://flags`
2. Look for `#prompt-api-for-gemini-nano`
3. If available, enable it
4. Restart and check `chrome://components`

### Verification
Open browser console and run:
```javascript
await ai.languageModel.capabilities()
// Expected: { available: "readily" } or { available: "after-download" }
```

---

## API Usage

### Check Availability
```javascript
const isAvailable = await checkGeminiNanoAvailability();
console.log('Gemini Nano ready:', isAvailable);
```

### Generate Insights
```javascript
const analysisData = {
  work: { 'github.com': 1800, 'docs.google.com': 900 },
  unproductive: { 'twitter.com': 600, 'reddit.com': 300 },
  neutral: { 'gmail.com': 200 },
  totalWorkTime: 2700,
  totalUnproductiveTime: 900,
  totalNeutralTime: 200
};

const insight = await generateAIInsights(analysisData);
console.log(insight);
```

---

## Prompt Engineering

### Prompt Structure
Our AI prompt includes:
1. **Role Definition**: "You are a productivity assistant"
2. **Ethical Guidelines**: Strict rules against medical terminology
3. **Data Context**: Formatted browsing statistics
4. **Output Requirements**: Format, length, and content specifications

### Example Prompt
```
You are a productivity assistant analyzing browsing behavior data.

IMPORTANT GUIDELINES:
- Focus ONLY on time management and productivity patterns
- Do NOT mention medical conditions (ADHD, anxiety, etc.)
- Keep response under 100 words
- Be encouraging and constructive
- Provide ONE specific, actionable suggestion

BROWSING DATA:
Work sites: github.com (30min), docs.google.com (15min)
Total work time: 45 minutes

Unproductive sites: twitter.com (10min), reddit.com (5min)
Total unproductive time: 15 minutes

Provide:
1. One key observation
2. Most time-consuming distraction
3. One actionable tip
```

### Response Sanitization
Forbidden patterns:
- Medical diagnoses (ADHD, anxiety, depression, OCD, bipolar)
- Diagnostic language (disorder, condition, syndrome)
- Medical recommendations (therapy, medication, counselor)

If detected → Automatically use enhanced fallback

---

## Fallback Strategy

### When Fallback is Used
- Gemini Nano unavailable in browser
- AI initialization fails
- Session creation errors
- Unsafe content detected in AI response

### Fallback Quality
Our enhanced fallback provides:
- **Contextual Analysis**: Based on work/unproductive ratio
- **Pattern Recognition**: Identifies top distractions
- **Tiered Feedback**: Different insights for different productivity levels
- **Actionable Tips**: Specific suggestions tied to Synapse features

Example outputs:
- **High productivity (70%+)**: Encouragement + momentum tips
- **Balanced (40-70%)**: Balanced feedback + Pomodoro suggestion
- **Low productivity (<40%)**: Alert + Focus Mode recommendation

---

## Privacy Guarantees

### What We Track
- Domain names (e.g., "github.com", not full URLs)
- Time spent per domain (in seconds)
- User-assigned categories (Work/Neutral/Unproductive)
- Daily aggregates only

### What We DON'T Track
- ❌ Page titles or content
- ❌ Form inputs or passwords
- ❌ Personal information
- ❌ Search queries
- ❌ Full URLs with parameters
- ❌ Cross-site activity

### AI Processing
- ✅ 100% on-device (Chrome's built-in Gemini Nano)
- ✅ No external API calls
- ✅ No data transmission
- ✅ No cloud processing
- ✅ Sessions destroyed after use

---

## Error Handling

### Common Issues

#### "Gemini Nano not available"
**Cause**: Chrome version doesn't support the API or model not downloaded
**Solution**: 
1. Update to Chrome 127+ (Dev/Canary)
2. Enable flags in `chrome://flags`
3. Download model in `chrome://components`
4. Extension will use enhanced fallback in the meantime

#### "Could not initialize session"
**Cause**: Model downloading or system resources low
**Solution**: Wait a few minutes and try again. Fallback will work immediately.

#### "Error generating insights"
**Cause**: Network issue, storage corruption, or unexpected error
**Solution**: Refresh extension, check browser console for details

---

## Performance

### Resource Usage
- **AI Session**: ~50-200MB RAM (temporary)
- **Processing Time**: 1-3 seconds typical
- **Model Size**: ~1.5GB one-time download
- **Battery Impact**: Minimal (on-device = efficient)

### Optimization
- Sessions created on-demand
- Destroyed immediately after use
- No persistent background processing
- Lazy loading of AI module

---

## Future Enhancements

### Planned Features
- **Historical Trends**: Multi-day pattern analysis
- **Time-of-Day Insights**: When are you most productive?
- **Weekly Reports**: Automated summary generation
- **Custom Prompts**: User-defined analysis questions
- **Advanced Categorization**: Auto-suggest categories based on patterns

---

## Compliance & Ethics

### Ethical AI Principles
1. **Transparency**: Users know when AI is active
2. **Consent**: Explicit user action required (click "Generate")
3. **Privacy**: All processing local, no data sharing
4. **Safety**: Medical language filtering
5. **Fairness**: No discriminatory language or bias
6. **Accountability**: Clear disclaimers on all outputs

### Legal Compliance
- GDPR-compliant (local processing, user control)
- CCPA-compliant (no data selling or sharing)
- No PII collection or processing
- User rights: view, export, delete data anytime

---

## Testing

### Manual Testing
1. Generate insights with various data patterns
2. Check console for "Gemini Nano available: true/false"
3. Verify disclaimer appears below insights
4. Test fallback by using without Gemini Nano

### Automated Tests (Coming Soon)
- Unit tests for sanitization logic
- Integration tests for API calls
- Edge case handling (empty data, extreme values)

---

## Support

### Troubleshooting
- Check browser console (`F12`) for detailed logs
- Verify Chrome version: `chrome://version`
- Check flags: `chrome://flags`
- Review components: `chrome://components`

### Resources
- [Chrome AI Documentation](https://developer.chrome.com/docs/ai)
- [Gemini Nano Overview](https://developers.googleblog.com/gemini-nano)
- [GitHub Issues](https://github.com/vaish725/Synapse/issues)

---

## Credits

Built with ❤️ using:
- **Gemini Nano** - Google's on-device AI model
- **Chrome Built-in AI** - Prompt API for extensions
- **Privacy-First Design** - Inspired by modern privacy standards

