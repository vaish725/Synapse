// Multi-API Chrome Built-in AI Integration
// Uses Summarizer, Writer, and Rewriter APIs
// Content script version - runs on web pages where APIs are available

console.log('[Synapse Multi-AI] Initializing Chrome Built-in AI access layer');

// Track which APIs are available
let apiAvailability = {
  summarizer: false,
  writer: false,
  rewriter: false,
  prompt: false // Keep Prompt API support too
};

// Check availability on load
(async () => {
  apiAvailability = await checkAllAPIsAvailability();
  console.log('[Synapse Multi-AI] API Availability:', apiAvailability);
})();

// Message handler for extension communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Verify message is from our extension
  if (!sender.id || sender.id !== chrome.runtime.id) {
    return;
  }

  if (message.type === 'CHECK_API_AVAILABILITY') {
    checkAllAPIsAvailability()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (message.type === 'SUMMARIZE_SESSION') {
    summarizeBrowsingSession(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'GENERATE_TIPS') {
    generateProductivityTips(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'REWRITE_INSIGHT') {
    rewriteInsight(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'GENERATE_AI_INSIGHT') {
    // Keep backward compatibility with Prompt API
    generateInsightViaPromptAPI(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Check availability of all Chrome Built-in AI APIs
 */
async function checkAllAPIsAvailability() {
  const availability = {
    summarizer: false,
    writer: false,
    rewriter: false,
    prompt: false
  };

  try {
    // Check Summarizer API (Chrome 138+, uses global Summarizer object)
    if (typeof self.Summarizer !== 'undefined') {
      try {
        const status = await self.Summarizer.availability();
        availability.summarizer = status === 'readily' || status === 'after-download';
        console.log('[Synapse Multi-AI] Summarizer status:', status);
      } catch (e) {
        console.log('[Synapse Multi-AI] Summarizer check failed:', e.message);
      }
    }

    // Check Writer API (Origin trial required)
    if (typeof self.Writer !== 'undefined') {
      try {
        const status = await self.Writer.availability();
        availability.writer = status === 'readily' || status === 'after-download';
        console.log('[Synapse Multi-AI] Writer status:', status);
      } catch (e) {
        console.log('[Synapse Multi-AI] Writer check failed:', e.message);
      }
    }

    // Check Rewriter API (Origin trial required)
    if (typeof self.Rewriter !== 'undefined') {
      try {
        const status = await self.Rewriter.availability();
        availability.rewriter = status === 'readily' || status === 'after-download';
        console.log('[Synapse Multi-AI] Rewriter status:', status);
      } catch (e) {
        console.log('[Synapse Multi-AI] Rewriter check failed:', e.message);
      }
    }

    // Check Prompt API (Extension context, uses window.ai)
    if (typeof window.ai?.languageModel !== 'undefined') {
      try {
        const caps = await window.ai.languageModel.capabilities();
        availability.prompt = caps.available === 'readily' || caps.available === 'after-download';
        console.log('[Synapse Multi-AI] Prompt API status:', caps.available);
      } catch (e) {
        console.log('[Synapse Multi-AI] Prompt API check failed:', e.message);
      }
    }

  } catch (error) {
    console.error('[Synapse Multi-AI] Error checking API availability:', error);
  }

  return availability;
}

/**
 * Summarizer API: Create concise summary of browsing session
 */
async function summarizeBrowsingSession(sessionData) {
  try {
    console.log('[Synapse Multi-AI] Generating session summary');

    if (typeof self.Summarizer === 'undefined') {
      return { success: false, error: 'Summarizer API not available', useFallback: true };
    }

    // Check availability first
    const status = await self.Summarizer.availability();
    if (status === 'no') {
      return { success: false, error: 'Summarizer not available', useFallback: true };
    }

    // Create summarizer
    const summarizer = await self.Summarizer.create({
      type: 'tldr',
      format: 'plain-text',
      length: 'short',
      outputLanguage: 'en'
    });

    // Prepare text to summarize
    const sessionText = formatSessionForSummarization(sessionData);

    // Generate summary
    const summary = await summarizer.summarize(sessionText);

    // Cleanup
    summarizer.destroy();

    console.log('[Synapse Multi-AI] Summary generated successfully');
    return { success: true, summary, api: 'Summarizer' };

  } catch (error) {
    console.error('[Synapse Multi-AI] Summarizer error:', error);
    return { success: false, error: error.message, useFallback: true };
  }
}

/**
 * Writer API: Generate productivity tips
 */
async function generateProductivityTips(behaviorData) {
  try {
    console.log('[Synapse Multi-AI] Generating productivity tips');

    if (typeof self.Writer === 'undefined') {
      return { success: false, error: 'Writer API not available', useFallback: true };
    }

    // Check availability first
    const status = await self.Writer.availability();
    if (status === 'no') {
      return { success: false, error: 'Writer not available', useFallback: true };
    }

    // Create writer
    const writer = await self.Writer.create({
      tone: 'professional',
      format: 'plain-text',
      length: 'short',
      outputLanguage: 'en'
    });

    // Prepare context
    const context = formatBehaviorForWriter(behaviorData);

    // Generate tips
    const tips = await writer.write(context);

    // Cleanup
    writer.destroy();

    console.log('[Synapse Multi-AI] Tips generated successfully');
    return { success: true, tips, api: 'Writer' };

  } catch (error) {
    console.error('[Synapse Multi-AI] Writer error:', error);
    return { success: false, error: error.message, useFallback: true };
  }
}

/**
 * Rewriter API: Rephrase insights in different tones
 */
async function rewriteInsight(rewriteData) {
  try {
    console.log('[Synapse Multi-AI] Rewriting content');

    if (typeof self.Rewriter === 'undefined') {
      return { success: false, error: 'Rewriter API not available', useFallback: true };
    }

    const { text, tone = 'casual' } = rewriteData;

    // Check availability first
    const status = await self.Rewriter.availability();
    if (status === 'no') {
      return { success: false, error: 'Rewriter not available', useFallback: true };
    }

    // Create rewriter
    const rewriter = await self.Rewriter.create({
      tone, // 'formal', 'casual', 'professional'
      format: 'plain-text',
      length: 'as-is',
      outputLanguage: 'en'
    });

    // Rewrite
    const rewritten = await rewriter.rewrite(text);

    // Cleanup
    rewriter.destroy();

    console.log('[Synapse Multi-AI] Content rewritten successfully');
    return { success: true, rewritten, tone, api: 'Rewriter' };

  } catch (error) {
    console.error('[Synapse Multi-AI] Rewriter error:', error);
    return { success: false, error: error.message, useFallback: true };
  }
}

/**
 * Prompt API: Generate AI insights (backward compatibility)
 */
async function generateInsightViaPromptAPI(analysisData) {
  try {
    if (typeof window.ai?.languageModel === 'undefined') {
      return { success: false, error: 'Prompt API not available', useFallback: true };
    }

    const session = await window.ai.languageModel.create({
      temperature: 0.7,
      topK: 3,
    });

    const prompt = createAnalysisPrompt(analysisData);
    const response = await session.prompt(prompt);
    const sanitized = sanitizeResponse(response);

    session.destroy();

    if (sanitized) {
      return { success: true, insight: sanitized, api: 'Prompt' };
    } else {
      return { success: false, error: 'Sanitization failed', useFallback: true };
    }

  } catch (error) {
    console.error('[Synapse Multi-AI] Prompt API error:', error);
    return { success: false, error: error.message, useFallback: true };
  }
}

// Helper functions

function formatSessionForSummarization(sessionData) {
  const { work, unproductive, neutral, totalWorkTime, totalUnproductiveTime } = sessionData;
  
  const formatTime = (seconds) => Math.round(seconds / 60) + ' minutes';
  
  let text = 'Today\'s browsing session:\n\n';
  
  text += `Work-related browsing: ${formatTime(totalWorkTime)}.\n`;
  if (Object.keys(work).length > 0) {
    text += 'Work sites: ' + Object.keys(work).slice(0, 3).join(', ') + '.\n';
  }
  
  text += `\nUnproductive browsing: ${formatTime(totalUnproductiveTime)}.\n`;
  if (Object.keys(unproductive).length > 0) {
    text += 'Distraction sites: ' + Object.keys(unproductive).slice(0, 3).join(', ') + '.\n';
  }
  
  return text;
}

function formatBehaviorForWriter(behaviorData) {
  const { work, unproductive, totalWorkTime, totalUnproductiveTime } = behaviorData;
  
  const totalTime = totalWorkTime + totalUnproductiveTime;
  const productivityRate = totalTime > 0 ? Math.round((totalWorkTime / totalTime) * 100) : 0;
  
  return `Write productivity tips for someone with ${productivityRate}% productive time. ` +
         `They spent ${Math.round(totalWorkTime/60)} minutes on work and ` +
         `${Math.round(totalUnproductiveTime/60)} minutes on distractions. ` +
         `Focus on actionable, specific advice.`;
}

function createAnalysisPrompt(analysisData) {
  const { work, unproductive, totalWorkTime, totalUnproductiveTime } = analysisData;
  
  const formatTime = (seconds) => `${Math.round(seconds / 60)}min`;
  const totalTime = totalWorkTime + totalUnproductiveTime;
  const productivityRate = totalTime > 0 ? Math.round((totalWorkTime / totalTime) * 100) : 0;
  
  return `You are a productivity assistant. Analyze this browsing session and provide brief feedback (max 80 words):

Work time: ${formatTime(totalWorkTime)} (${productivityRate}% of total)
Distractions: ${formatTime(totalUnproductiveTime)}

Top work sites: ${Object.keys(work).slice(0, 2).join(', ') || 'none'}
Top distractions: ${Object.keys(unproductive).slice(0, 2).join(', ') || 'none'}

Provide: 1) One key observation, 2) Main distraction if any, 3) One actionable tip. Be encouraging.`;
}

function sanitizeResponse(response) {
  if (!response || typeof response !== 'string') return null;
  
  const forbidden = [
    /\b(ADHD|ADD)\b/i, /\banxiety\b/i, /\bdepression\b/i,
    /\bOCD\b/i, /\bbipolar\b/i, /\bdisorder\b/i,
    /\bcondition\b/i, /\bsyndrome\b/i, /\btherapy\b/i
  ];
  
  for (const pattern of forbidden) {
    if (pattern.test(response)) return null;
  }
  
  return response.length > 500 ? response.substring(0, 497) + '...' : response;
}

console.log('[Synapse Multi-AI] Multi-API access layer ready');
