// Content script that runs on web pages to access window.ai
// This is the ONLY context where Gemini Nano API is available

console.log('[Synapse Content] Initializing Gemini Nano access layer');

// Only respond to messages from our extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Verify message is from our extension
  if (!sender.id || sender.id !== chrome.runtime.id) {
    return;
  }

  if (message.type === 'CHECK_GEMINI_AVAILABILITY') {
    checkGeminiAvailability()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ available: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'GENERATE_AI_INSIGHT') {
    generateInsightViaGemini(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message, useFallback: true }));
    return true; // Keep channel open for async response
  }
});

async function checkGeminiAvailability() {
  try {
    console.log('[Synapse Content] Checking window.ai availability');
    
    if (typeof window.ai === 'undefined' || typeof window.ai.languageModel === 'undefined') {
      console.log('[Synapse Content] window.ai not available');
      return { available: false, error: 'API not found in this context' };
    }

    const capabilities = await window.ai.languageModel.capabilities();
    console.log('[Synapse Content] Capabilities:', capabilities);
    
    const available = capabilities.available === 'readily' || capabilities.available === 'after-download';
    return { available, capabilities };
    
  } catch (error) {
    console.error('[Synapse Content] Error checking availability:', error);
    return { available: false, error: error.message };
  }
}

async function generateInsightViaGemini(analysisData) {
  try {
    console.log('[Synapse Content] Generating AI insight');

    if (typeof window.ai === 'undefined' || typeof window.ai.languageModel === 'undefined') {
      return { success: false, error: 'API not available', useFallback: true };
    }

    // Create session
    const session = await window.ai.languageModel.create({
      temperature: 0.7,
      topK: 3,
    });

    console.log('[Synapse Content] Session created, generating prompt');

    // Create prompt
    const prompt = createAnalysisPrompt(analysisData);

    // Generate response
    const response = await session.prompt(prompt);

    console.log('[Synapse Content] AI response received, sanitizing');

    // Sanitize
    const sanitized = sanitizeResponse(response);

    // Cleanup
    if (session.destroy) {
      session.destroy();
    }

    if (sanitized) {
      console.log('[Synapse Content] AI insight generated successfully');
      return { success: true, insight: sanitized };
    } else {
      console.warn('[Synapse Content] Response failed sanitization');
      return { success: false, error: 'Sanitization failed', useFallback: true };
    }

  } catch (error) {
    console.error('[Synapse Content] Error generating insight:', error);
    return { success: false, error: error.message, useFallback: true };
  }
}

function createAnalysisPrompt(analysisData) {
  const { work, unproductive, neutral, totalWorkTime, totalUnproductiveTime, totalNeutralTime } = analysisData;
  
  const workSites = Object.entries(work || {}).sort((a, b) => b[1] - a[1]);
  const unproductiveSites = Object.entries(unproductive || {}).sort((a, b) => b[1] - a[1]);
  
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

function sanitizeResponse(response) {
  if (!response || typeof response !== 'string') {
    return null;
  }

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

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(response)) {
      console.warn('[Synapse Content] Response contains forbidden term:', pattern);
      return null;
    }
  }

  if (response.length > 500) {
    return response.substring(0, 497) + '...';
  }

  return response;
}

console.log('[Synapse Content] AI access layer ready');
