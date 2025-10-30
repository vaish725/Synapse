// Multi-API Chrome Built-in AI Integration Module
// Uses Summarizer, Writer, and Rewriter APIs via content script

console.log('[Synapse AI] Multi-API integration module loaded');

let apiAvailability = null;

/**
 * Get active tab to send messages to content script
 */
async function getActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  } catch (error) {
    console.error('[Synapse AI] Error getting active tab:', error);
    return null;
  }
}

/**
 * Check which Chrome Built-in AI APIs are available
 */
async function checkAPIsAvailability() {
  try {
    const tab = await getActiveTab();
    
    if (!tab || !tab.id || tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
      console.log('[Synapse AI] Cannot check APIs: not on a regular web page');
      return { summarizer: false, writer: false, rewriter: false, prompt: false };
    }
    
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_API_AVAILABILITY' });
    
    if (result && !result.error) {
      apiAvailability = result;
      console.log('[Synapse AI] API availability:', apiAvailability);
      return result;
    }
    
    console.warn('[Synapse AI] Could not check API availability:', result?.error);
    return { summarizer: false, writer: false, rewriter: false, prompt: false };
    
  } catch (error) {
    console.error('[Synapse AI] Error checking API availability:', error);
    return { summarizer: false, writer: false, rewriter: false, prompt: false };
  }
}

/**
 * Create a safe prompt template for behavioral analysis
 * @param {Object} analysisData - Aggregated time data
 * @returns {string} Formatted prompt
 */
function createAnalysisPrompt(analysisData) {
  const { work, unproductive, neutral, totalWorkTime, totalUnproductiveTime, totalNeutralTime } = analysisData;
  
  // Sort sites by time spent
  const workSites = Object.entries(work).sort((a, b) => b[1] - a[1]);
  const unproductiveSites = Object.entries(unproductive).sort((a, b) => b[1] - a[1]);
  
  const prompt = `You are a productivity assistant analyzing browsing behavior data. Provide a brief, actionable insight.

IMPORTANT GUIDELINES:
- Focus ONLY on time management and productivity patterns
- Do NOT mention or suggest any medical conditions (ADHD, anxiety, depression, etc.)
- Keep response under 100 words
- Be encouraging and constructive
- Provide ONE specific, actionable suggestion

BROWSING DATA (today):
Work sites (productive): ${workSites.map(([site, seconds]) => `${site} (${Math.floor(seconds / 60)}min)`).join(', ') || 'None'}
Total work time: ${Math.floor(totalWorkTime / 60)} minutes

Unproductive sites: ${unproductiveSites.map(([site, seconds]) => `${site} (${Math.floor(seconds / 60)}min)`).join(', ') || 'None'}
Total unproductive time: ${Math.floor(totalUnproductiveTime / 60)} minutes

Neutral sites: ${Math.floor(totalNeutralTime / 60)} minutes

Analyze the pattern and provide:
1. One key observation about focus patterns
2. The most time-consuming distraction (if any)
3. One specific, actionable tip to improve productivity

Keep it brief, positive, and actionable.`;

  return prompt;
}

/**
 * Sanitize AI response to ensure ethical compliance
 * @param {string} response - AI generated response
 * @returns {string} Sanitized response
 */
function sanitizeAIResponse(response) {
  // List of medical/diagnostic terms to filter out
  const forbiddenTerms = [
    /\b(adhd|add)\b/gi,
    /\b(anxiety|anxious)\b/gi,
    /\b(depression|depressed)\b/gi,
    /\b(ocd|obsessive)\b/gi,
    /\b(bipolar|manic)\b/gi,
    /\b(disorder|condition|syndrome)\b/gi,
    /\b(diagnosis|diagnose|diagnosed)\b/gi,
    /\b(therapy|therapist|counselor)\b/gi,
    /\b(medication|prescri)\b/gi,
  ];
  
  let sanitized = response;
  
  // Check for forbidden terms
  for (const term of forbiddenTerms) {
    if (term.test(sanitized)) {
      console.warn('AI response contained forbidden medical terminology, using fallback');
      return null; // Return null to trigger fallback
    }
  }
  
  // Ensure response isn't too long
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + '...';
  }
  
  return sanitized;
}

/**
 * Generate AI-powered insights using Gemini Nano
 * @param {Object} analysisData - Aggregated browsing data
 * @returns {Promise<string>} Generated insight
 */
async function generateAIInsights(analysisData) {
  try {
    // Check availability
    const isAvailable = await checkGeminiNanoAvailability();
    
    if (!isAvailable) {
      console.log('Gemini Nano not available, using enhanced fallback');
      return generateEnhancedFallbackInsight(analysisData);
    }
    
    console.log('Gemini Nano available, generating AI insights via content script');
    
    // Get active tab
    const tab = await getActiveTab();
    
    if (!tab || !tab.id) {
      console.log('No active tab, using fallback');
      return generateEnhancedFallbackInsight(analysisData);
    }
    
    // Send generation request to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'GENERATE_AI_INSIGHT',
      data: analysisData
    });
    
    if (response.success && response.insight) {
      console.log('AI insight generated successfully');
      return response.insight;
    } else if (response.useFallback) {
      console.log('Content script requested fallback:', response.error);
      return generateEnhancedFallbackInsight(analysisData);
    } else {
      console.log('AI generation failed, using fallback');
      return generateEnhancedFallbackInsight(analysisData);
    }
    
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateEnhancedFallbackInsight(analysisData);
  }
}

/**
 * Enhanced fallback insight generator (used when Gemini Nano unavailable)
 * @param {Object} analysisData - Aggregated browsing data
 * @returns {string} Generated insight
 */
function generateEnhancedFallbackInsight(analysisData) {
  const { work, unproductive, neutral, totalWorkTime, totalUnproductiveTime } = analysisData;
  
  // Find most time-consuming unproductive site
  let maxUnproductive = { domain: null, time: 0 };
  for (const [domain, seconds] of Object.entries(unproductive)) {
    if (seconds > maxUnproductive.time) {
      maxUnproductive = { domain, time: seconds };
    }
  }
  
  // Find most time-consuming work site
  let maxWork = { domain: null, time: 0 };
  for (const [domain, seconds] of Object.entries(work)) {
    if (seconds > maxWork.time) {
      maxWork = { domain, time: seconds };
    }
  }
  
  // Generate contextual insight
  let insight = "📊 **Today's Focus Analysis**\n\n";
  
  // Calculate work ratio
  const totalActiveTime = totalWorkTime + totalUnproductiveTime;
  const workRatio = totalActiveTime > 0 ? (totalWorkTime / totalActiveTime) * 100 : 0;
  
  if (totalActiveTime === 0) {
    insight += "No significant activity tracked yet. Start browsing and categorize sites to get personalized insights!";
    return insight;
  }
  
  // Main observation
  if (workRatio >= 70) {
    insight += `🎯 **Excellent focus today!** You maintained ${Math.floor(workRatio)}% productive time (${formatTime(totalWorkTime)}).\n\n`;
    if (maxWork.domain) {
      insight += `Your most productive work was on **${maxWork.domain}** (${formatTime(maxWork.time)}).\n\n`;
    }
    insight += "💡 **Keep it up!** Consider using Focus Mode during your next work session to maintain this momentum.";
  } else if (workRatio >= 40) {
    insight += `⚖️ **Balanced session.** ${Math.floor(workRatio)}% productive time (${formatTime(totalWorkTime)}) vs ${Math.floor(100 - workRatio)}% unproductive (${formatTime(totalUnproductiveTime)}).\n\n`;
    if (maxUnproductive.domain) {
      insight += `⚠️ **Top distraction:** ${maxUnproductive.domain} (${formatTime(maxUnproductive.time)})\n\n`;
    }
    insight += "💡 **Tip:** Try using the Pomodoro timer (25min focus / 5min break) to boost your productive time ratio.";
  } else {
    insight += `⚠️ **Distraction alert!** Only ${Math.floor(workRatio)}% productive time today (${formatTime(totalWorkTime)}).\n\n`;
    if (maxUnproductive.domain) {
      insight += `🔴 **Biggest time sink:** ${maxUnproductive.domain} took ${formatTime(maxUnproductive.time)} of your time.\n\n`;
    }
    insight += "💡 **Action step:** Enable Focus Mode and start a Pomodoro session. Consider categorizing more sites as 'Unproductive' for better tracking.";
  }
  
  return insight;
}

/**
 * Format seconds to human-readable time
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
}

// Export functions for use in popup
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateAIInsights,
    checkGeminiNanoAvailability,
  };
}
