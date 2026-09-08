/**
 * ZipKit Background Service Worker
 * Handles extension lifecycle and background tasks
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ZipKit extension installed');
  } else if (details.reason === 'update') {
    console.log('ZipKit extension updated');
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('ZipKit extension started');
});
