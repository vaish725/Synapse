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
 * Generate comprehensive AI insights using all available APIs
 */
async function generateAIInsights(analysisData) {
  try {
    console.log('[Synapse AI] Generating AI insights with multi-API approach');
    
    // Check availability first if not cached
    if (!apiAvailability) {
      apiAvailability = await checkAPIsAvailability();
    }

    const results = {
      summary: null,
      tips: null,
      insight: null,
      rewritten: null,
      fallback: null
    };

    // Get active tab
    const tab = await getActiveTab();
    if (!tab?.id) {
      console.warn('[Synapse AI] No active tab - using fallback');
      return generateEnhancedFallbackInsight(analysisData);
    }

    let anySuccess = false;

    // Try Summarizer API for session summary
    if (apiAvailability.summarizer) {
      try {
        const summaryResult = await chrome.tabs.sendMessage(tab.id, {
          type: 'SUMMARIZE_SESSION',
          data: analysisData
        });
        
        if (summaryResult.success) {
          results.summary = summaryResult.summary;
          anySuccess = true;
          console.log('[Synapse AI] ✓ Summary generated via Summarizer API');
        }
      } catch (error) {
        console.error('[Synapse AI] Summarizer failed:', error);
      }
    }

    // Try Writer API for productivity tips
    if (apiAvailability.writer) {
      try {
        const tipsResult = await chrome.tabs.sendMessage(tab.id, {
          type: 'GENERATE_TIPS',
          data: analysisData
        });
        
        if (tipsResult.success) {
          results.tips = tipsResult.tips;
          anySuccess = true;
          console.log('[Synapse AI] ✓ Tips generated via Writer API');
        }
      } catch (error) {
        console.error('[Synapse AI] Writer failed:', error);
      }
    }

    // Try Prompt API for detailed insight (if available)
    if (apiAvailability.prompt) {
      try {
        const insightResult = await chrome.tabs.sendMessage(tab.id, {
          type: 'GENERATE_AI_INSIGHT',
          data: analysisData
        });
        
        if (insightResult.success) {
          results.insight = insightResult.insight;
          anySuccess = true;
          console.log('[Synapse AI] ✓ Insight generated via Prompt API');
        }
      } catch (error) {
        console.error('[Synapse AI] Prompt API failed:', error);
      }
    }

    // Format combined result
    if (anySuccess) {
      return formatCombinedInsights(results);
    }

    // All APIs failed - use fallback
    console.log('[Synapse AI] All APIs unavailable - using enhanced fallback');
    return generateEnhancedFallbackInsight(analysisData);

  } catch (error) {
    console.error('[Synapse AI] Error generating insights:', error);
    return generateEnhancedFallbackInsight(analysisData);
  }
}

/**
 * Format combined insights from multiple APIs
 */
function formatCombinedInsights(results) {
  let combined = '🤖 **AI-Powered Insights**\n\n';
  
  if (results.summary) {
    combined += `📊 **Session Summary**\n${results.summary}\n\n`;
  }
  
  if (results.tips) {
    combined += `💡 **Productivity Tips**\n${results.tips}\n\n`;
  }
  
  if (results.insight) {
    combined += `🎯 **Focus Analysis**\n${results.insight}\n\n`;
  }
  
  combined += '_Generated using Chrome Built-in AI_';
  
  return combined;
}

/**
 * Rewrite text in different tones using Rewriter API
 */
async function rewriteInTone(text, tone = 'casual') {
  try {
    if (!apiAvailability) {
      apiAvailability = await checkAPIsAvailability();
    }

    if (!apiAvailability.rewriter) {
      console.log('[Synapse AI] Rewriter API not available');
      return text;
    }

    const tab = await getActiveTab();
    if (!tab?.id) {
      return text;
    }

    const result = await chrome.tabs.sendMessage(tab.id, {
      type: 'REWRITE_INSIGHT',
      data: { text, tone }
    });

    if (result.success) {
      return result.rewritten;
    }

    return text;

  } catch (error) {
    console.error('[Synapse AI] Rewriter error:', error);
    return text;
  }
}

/**
 * Enhanced fallback insight generator (no AI APIs needed)
 */
function generateEnhancedFallbackInsight(analysisData) {
  const { work, unproductive, neutral, totalWorkTime, totalUnproductiveTime } = analysisData;
  
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const totalTime = totalWorkTime + totalUnproductiveTime;
  const productivityRate = totalTime > 0 ? Math.round((totalWorkTime / totalTime) * 100) : 0;

  let insight = '📊 **Today\'s Focus Analysis**\n\n';

  // Main observation
  if (totalTime === 0) {
    insight += 'No activity tracked yet. Start browsing and categorize sites to get personalized insights!';
    return insight;
  }

  if (productivityRate >= 70) {
    insight += `🎯 **Excellent focus today!** You maintained ${productivityRate}% productivity with ${formatTime(totalWorkTime)} of focused work.\n\n`;
  } else if (productivityRate >= 50) {
    insight += `✨ **Good balance today.** You spent ${formatTime(totalWorkTime)} on productive work (${productivityRate}% of total time).\n\n`;
  } else if (productivityRate >= 30) {
    insight += `💡 **Mixed session.** ${formatTime(totalWorkTime)} of work, but ${formatTime(totalUnproductiveTime)} on distractions.\n\n`;
  } else {
    insight += `⚠️ **Lots of distractions today.** Only ${formatTime(totalWorkTime)} focused work out of ${formatTime(totalTime)} total.\n\n`;
  }

  // Add specific distraction note if significant
  if (totalUnproductiveTime > 600) {
    const topDistraction = Object.entries(unproductive)
      .sort((a, b) => b[1] - a[1])[0];
    if (topDistraction) {
      insight += `⚠️ **Main distraction:** ${topDistraction[0]} (${formatTime(topDistraction[1])})\n\n`;
    }
  }

  // Add actionable tip
  if (productivityRate < 50 && totalUnproductiveTime > 1800) {
    insight += '💪 **Tip:** Try enabling Focus Mode to reduce interruptions.';
  } else if (totalWorkTime > 3600 * 2) {
    insight += '🎯 **Great work!** Remember to take breaks.';
  } else if (productivityRate >= 70) {
    insight += '🚀 **Keep up the momentum!**';
  }

  return insight;
}

// Backward compatibility - expose function with old name
const checkGeminiNanoAvailability = checkAPIsAvailability;

console.log('[Synapse AI] Multi-API module ready');
