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
 * Enhanced fallback insight generator with detailed metrics and trend analysis
 */
function generateEnhancedFallbackInsight(analysisData) {
  const { work, unproductive, neutral, totalWorkTime, totalUnproductiveTime, totalNeutralTime,
          historicalData, bestFocusTimes, weeklyComparison } = analysisData;
  
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const totalTime = totalWorkTime + totalUnproductiveTime + (totalNeutralTime || 0);
  const productivityRate = totalTime > 0 ? Math.round((totalWorkTime / totalTime) * 100) : 0;
  const distractionRate = totalTime > 0 ? Math.round((totalUnproductiveTime / totalTime) * 100) : 0;

  let insight = '';

  // Handle no activity case
  if (totalTime === 0) {
    insight += '🔍 **No activity tracked yet**\n\n';
    insight += 'Start browsing and categorize sites to get personalized insights!\n\n';
    insight += '💡 **Tip:** Visit Settings to categorize your most-used websites as Work, Neutral, or Unproductive.';
    return insight;
  }

  // Calculate entries once
  const unproductiveEntries = Object.entries(unproductive || {}).sort((a, b) => b[1] - a[1]);
  const workEntries = Object.entries(work || {}).sort((a, b) => b[1] - a[1]);

  // === QUICK SUMMARY (Key Metrics at a Glance) ===
  insight += '━━━━━━━━━━━━━━━━━━━━━━\n';
  insight += '**⚡ QUICK SUMMARY**\n';
  insight += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  let scoreEmoji = productivityRate >= 70 ? '🎯' : productivityRate >= 50 ? '✨' : productivityRate >= 30 ? '💡' : '⚠️';
  let scoreLabel = productivityRate >= 70 ? 'Excellent' : productivityRate >= 50 ? 'Good' : productivityRate >= 30 ? 'Fair' : 'Needs Focus';
  
  insight += `${scoreEmoji} **Productivity: ${productivityRate}%** (${scoreLabel})\n`;
  
  // Top distraction (if any)
  if (unproductiveEntries.length > 0) {
    const [topSite, topTime] = unproductiveEntries[0];
    insight += `🔴 **Top Distraction:** ${topSite} (${formatTime(topTime)})\n`;
  } else {
    insight += `✅ **Top Distraction:** None - Great focus!\n`;
  }
  
  // One actionable tip based on current state
  if (productivityRate < 50 && totalUnproductiveTime > 1800) {
    insight += `💡 **Quick Tip:** Enable Focus Mode to block distracting sites\n`;
  } else if (totalWorkTime > 5400) {
    insight += `💡 **Quick Tip:** Take a break! You've earned it after 90+ min\n`;
  } else if (productivityRate >= 70) {
    insight += `💡 **Quick Tip:** Keep the momentum with a Pomodoro session\n`;
  } else {
    insight += `💡 **Quick Tip:** Try a 25-minute focused work session\n`;
  }
  
  insight += '\n';
  
  // === FULL ANALYSIS BELOW ===
  insight += '━━━━━━━━━━━━━━━━━━━━━━\n';
  insight += '**📊 DETAILED ANALYSIS**\n';
  insight += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  // === TIME BREAKDOWN ===
  insight += '**⏱️ Time Distribution**\n';
  insight += `Work: ${formatTime(totalWorkTime)} | Distractions: ${formatTime(totalUnproductiveTime)} | Neutral: ${formatTime(totalNeutralTime || 0)}\n\n`;

  // === DETAILED BREAKDOWN ===
  insight += '**📈 Site Breakdown**\n';
  
  // Work sites breakdown
  if (workEntries.length > 0) {
    insight += `✅ **Work Sites (${workEntries.length}):** `;
    const topWork = workEntries.slice(0, 3).map(([site, sec]) => `${site} (${formatTime(sec)})`).join(', ');
    insight += topWork;
    if (workEntries.length > 3) insight += `, +${workEntries.length - 3} more`;
    insight += '\n';
  } else {
    insight += '✅ **Work Sites:** None tracked yet\n';
  }
  
  // Unproductive sites breakdown
  if (unproductiveEntries.length > 0) {
    insight += `🔴 **Distractions (${unproductiveEntries.length}):** `;
    const topDistract = unproductiveEntries.slice(0, 3).map(([site, sec]) => `${site} (${formatTime(sec)})`).join(', ');
    insight += topDistract;
    if (unproductiveEntries.length > 3) insight += `, +${unproductiveEntries.length - 3} more`;
    insight += '\n';
  }
  
  insight += '\n';

  // === KEY OBSERVATIONS ===
  insight += '**🔍 Key Observations**\n';
  
  if (productivityRate >= 70) {
    insight += '• 🏆 **Excellent focus!** You\'re in the top tier of productivity.\n';
    if (totalWorkTime > 7200) {
      insight += '• ⏰ **Long session detected.** Remember to take regular breaks!\n';
    }
  } else if (productivityRate >= 50) {
    insight += '• ✨ **Good balance** between work and breaks.\n';
    if (distractionRate > 30) {
      insight += `• ⚠️ **Distraction rate at ${distractionRate}%** - could be improved.\n`;
    }
  } else if (productivityRate >= 30) {
    insight += '• 💭 **Mixed session** - significant time on distractions.\n';
    if (unproductiveEntries.length > 0) {
      const [topSite, topTime] = unproductiveEntries[0];
      insight += `• 🔴 **Biggest time sink:** ${topSite} (${formatTime(topTime)})\n`;
    }
  } else {
    insight += '• 🚨 **High distraction alert!** Focus is being heavily interrupted.\n';
    if (unproductiveEntries.length > 0) {
      const [topSite, topTime] = unproductiveEntries[0];
      insight += `• 🔴 **Major distraction:** ${topSite} consumed ${formatTime(topTime)}\n`;
    }
  }
  
  // Session count
  const sessionCount = workEntries.length + unproductiveEntries.length + Object.keys(neutral || {}).length;
  insight += `• 🌐 **${sessionCount} different sites** visited today\n`;
  
  insight += '\n';

  // === TREND ANALYSIS (if available) ===
  if (historicalData && historicalData.length > 1) {
    insight += '**📊 Weekly Trends**\n';
    
    // Weekly comparison
    if (weeklyComparison && weeklyComparison.message) {
      insight += `• ${weeklyComparison.message}\n`;
    }
    
    // Best day performance
    if (bestFocusTimes && bestFocusTimes.bestDay !== 'N/A') {
      insight += `• 🌟 **Best day this week:** ${bestFocusTimes.bestDay} (${bestFocusTimes.bestDayRate}% productive)\n`;
      insight += `• 📈 **Weekly average:** ${bestFocusTimes.avgProductivity}% productivity\n`;
    }
    
    // Streak detection
    let currentStreak = 0;
    for (let i = historicalData.length - 1; i >= 0; i--) {
      if (historicalData[i].productivityRate >= 50) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    if (currentStreak >= 3) {
      insight += `• 🔥 **${currentStreak}-day productivity streak!** Keep it going!\n`;
    } else if (currentStreak === 0 && productivityRate >= 50) {
      insight += `• 🎯 **New streak started!** Let's build momentum!\n`;
    }
    
    insight += '\n';
  }

  // === ACTIONABLE RECOMMENDATIONS ===
  insight += '**💡 Actionable Tips**\n';
  
  if (productivityRate < 50 && totalUnproductiveTime > 1800) {
    insight += '• �️ **Enable Focus Mode** to block distracting sites\n';
    insight += '• ⏱️ **Start a Pomodoro session** (25min work / 5min break)\n';
  } else if (totalWorkTime > 5400) {
    insight += '• 🧘 **Take a break!** You\'ve been focused for over 90 minutes\n';
    insight += '• 💧 **Hydrate and stretch** to maintain peak performance\n';
  } else if (productivityRate >= 70) {
    insight += '• 🚀 **Keep the momentum!** You\'re in a great flow state\n';
    insight += '• 📊 **Check your stats** to see your productivity trends\n';
  } else {
    insight += '• 🎯 **Set a focus goal** - aim for 30min of uninterrupted work\n';
    insight += '• 📱 **Categorize sites** in Settings to improve tracking accuracy\n';
  }

  return insight;
}

// Backward compatibility - expose function with old name
const checkGeminiNanoAvailability = checkAPIsAvailability;

console.log('[Synapse AI] Multi-API module ready');
