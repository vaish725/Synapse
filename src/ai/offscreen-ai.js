// Offscreen document for accessing Gemini Nano API
// Chrome extensions can't access window.ai directly in popup/background
// This offscreen document provides a bridge to the API

console.log('[Offscreen] Initializing Gemini Nano bridge');

// Check if API is available in this context
let isGeminiAvailable = false;

(async () => {
  try {
    if ('ai' in self && 'languageModel' in self.ai) {
      const capabilities = await self.ai.languageModel.capabilities();
      isGeminiAvailable = capabilities.available === 'readily' || capabilities.available === 'after-download';
      console.log('[Offscreen] Gemini Nano available:', isGeminiAvailable, capabilities);
    } else {
      console.log('[Offscreen] window.ai not found');
    }
  } catch (error) {
    console.error('[Offscreen] Error checking Gemini availability:', error);
  }
})();

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Offscreen] Received message:', message);

  if (message.type === 'CHECK_GEMINI_AVAILABILITY') {
    handleCheckAvailability(sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.type === 'GENERATE_AI_INSIGHT') {
    handleGenerateInsight(message.data, sendResponse);
    return true; // Keep channel open for async response
  }

  return false;
});

async function handleCheckAvailability(sendResponse) {
  try {
    if ('ai' in self && 'languageModel' in self.ai) {
      const capabilities = await self.ai.languageModel.capabilities();
      const available = capabilities.available === 'readily' || capabilities.available === 'after-download';
      sendResponse({ available, capabilities });
    } else {
      sendResponse({ available: false, error: 'API not found' });
    }
  } catch (error) {
    console.error('[Offscreen] Error checking availability:', error);
    sendResponse({ available: false, error: error.message });
  }
}

async function handleGenerateInsight(analysisData, sendResponse) {
  try {
    if (!('ai' in self && 'languageModel' in self.ai)) {
      sendResponse({ success: false, error: 'Gemini Nano not available', useFallback: true });
      return;
    }

    // Create session
    const session = await self.ai.languageModel.create({
      temperature: 0.7,
      topK: 3,
    });

    // Create prompt
    const prompt = createAnalysisPrompt(analysisData);

    // Generate response
    const response = await session.prompt(prompt);

    // Sanitize response
    const sanitized = sanitizeAIResponse(response);

    // Clean up
    session.destroy();

    if (sanitized) {
      sendResponse({ success: true, insight: sanitized });
    } else {
      sendResponse({ success: false, error: 'Response failed sanitization', useFallback: true });
    }

  } catch (error) {
    console.error('[Offscreen] Error generating insight:', error);
    sendResponse({ success: false, error: error.message, useFallback: true });
  }
}

function createAnalysisPrompt(analysisData) {
  const { work, unproductive, neutral, totalWorkTime, totalUnproductiveTime, totalNeutralTime } = analysisData;
  
  // Sort sites by time spent
  const workSites = Object.entries(work).sort((a, b) => b[1] - a[1]);
  const unproductiveSites = Object.entries(unproductive).sort((a, b) => b[1] - a[1]);
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.round(seconds / 60);
    return `${mins}min`;
  };
  
  const totalTime = totalWorkTime + totalUnproductiveTime + totalNeutralTime;
  const productivityRate = totalTime > 0 ? Math.round((totalWorkTime / totalTime) * 100) : 0;
  
  let prompt = `You are a productivity assistant analyzing browsing behavior data.

IMPORTANT GUIDELINES:
- Focus ONLY on time management and productivity patterns
- Do NOT mention medical conditions (ADHD, anxiety, depression, OCD, bipolar, etc.)
- Do NOT use diagnostic language (disorder, condition, syndrome, symptoms)
- Keep response under 100 words
- Be encouraging and constructive
- Provide ONE specific, actionable suggestion

BROWSING DATA:
Total time tracked: ${formatTime(totalTime)}
Productivity rate: ${productivityRate}%

Work time: ${formatTime(totalWorkTime)}`;

  if (workSites.length > 0) {
    prompt += `\nTop work sites: ${workSites.slice(0, 3).map(([site, time]) => `${site} (${formatTime(time)})`).join(', ')}`;
  }

  prompt += `\n\nUnproductive time: ${formatTime(totalUnproductiveTime)}`;

  if (unproductiveSites.length > 0) {
    prompt += `\nTop distractions: ${unproductiveSites.slice(0, 3).map(([site, time]) => `${site} (${formatTime(time)})`).join(', ')}`;
  }

  prompt += `\n\nProvide a brief analysis with:
1. One key observation about their productivity today
2. The biggest distraction (if any)
3. One actionable tip to improve focus

Keep it encouraging and under 100 words.`;

  return prompt;
}

function sanitizeAIResponse(response) {
  if (!response || typeof response !== 'string') {
    return null;
  }

  // Forbidden medical/diagnostic terms
  const forbiddenPatterns = [
    /\b(ADHD|ADD)\b/i,
    /\banxiety\b/i,
    /\bdepression\b/i,
    /\bOCD\b/i,
    /\bbipolar\b/i,
    /\bdisorder\b/i,
    /\bcondition\b/i,
    /\bsyndrome\b/i,
    /\btherapy\b/i,
    /\bcounselor\b/i,
    /\bmedication\b/i,
    /\bdiagnos(is|e|ed)\b/i
  ];

  // Check for forbidden content
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(response)) {
      console.warn('[Offscreen] Response contains forbidden term:', pattern);
      return null;
    }
  }

  // Check length
  if (response.length > 500) {
    console.warn('[Offscreen] Response too long, truncating');
    return response.substring(0, 497) + '...';
  }

  return response;
}

console.log('[Offscreen] AI bridge ready');
