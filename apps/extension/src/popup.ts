/**
 * ZipKit Extension Popup
 * Provides quick access to archive operations
 */

document.addEventListener('DOMContentLoaded', () => {
  const openArchiveBtn = document.getElementById('open-archive') as HTMLButtonElement;
  const createArchiveBtn = document.getElementById('create-archive') as HTMLButtonElement;

  openArchiveBtn?.addEventListener('click', () => {
    openWorkspace('open');
  });

  createArchiveBtn?.addEventListener('click', () => {
    openWorkspace('create');
  });
});

function openWorkspace(mode: 'open' | 'create'): void {
  chrome.tabs.create({
    url: chrome.runtime.getURL(`workspace.html?mode=${mode}`),
  });
}
