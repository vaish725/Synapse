// Run this in the browser console to clear Spotify tokens
chrome.storage.local.remove(['spotifyAccessToken', 'spotifyRefreshToken', 'spotifyTokenExpiry'], () => {
  console.log('✅ Spotify tokens cleared!');
  console.log('Now reload the extension and try connecting again.');
});
