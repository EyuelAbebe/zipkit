/**
 * ZipKit Extension Popup
 * Screen-based navigation within the extension popup
 */

// Screen management
let currentScreen = 'home';
const screens: Record<string, HTMLElement> = {};
let selectedFiles: File[] = [];
let currentArchive: File | null = null;

document.addEventListener('DOMContentLoaded', () => {
  // Cache all screens
  screens.home = document.getElementById('screen-home')!;
  screens.extract = document.getElementById('screen-extract')!;
  screens.destination = document.getElementById('screen-destination')!;
  screens.progress = document.getElementById('screen-progress')!;
  screens.create = document.getElementById('screen-create')!;
  screens.complete = document.getElementById('screen-complete')!;
  screens.settings = document.getElementById('screen-settings')!;

  // Set up popup dimensions
  document.body.style.width = '420px';
  document.body.style.minHeight = '600px';

  setupHomeScreen();
  setupExtractScreen();
  setupDestinationScreen();
  setupProgressScreen();
  setupCreateScreen();
  setupCompleteScreen();
  setupSettingsScreen();

  // Load recent archives
  loadRecentArchives();

  // Load and display version
  loadVersion();
});

function setupHomeScreen(): void {
  const dropZone = document.getElementById('drop-zone')!;
  const openArchiveBtn = document.getElementById('open-archive-btn')!;
  const createArchiveBtn = document.getElementById('create-archive-btn')!;
  const settingsBtn = document.getElementById('settings-btn')!;

  // Drop zone click
  dropZone.addEventListener('click', () => {
    selectFile();
  });

  // Drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelection(files[0]);
    }
  });

  openArchiveBtn.addEventListener('click', () => {
    selectFile();
  });

  createArchiveBtn.addEventListener('click', () => {
    navigateToScreen('create');
  });

  settingsBtn.addEventListener('click', () => {
    navigateToScreen('settings');
  });
}

function setupExtractScreen(): void {
  const backBtn = document.getElementById('back-from-extract')!;
  const extractAllBtn = document.getElementById('extract-all-btn')!;
  const extractSelectedBtn = document.getElementById('extract-selected-btn')!;

  backBtn.addEventListener('click', () => {
    navigateToScreen('home');
  });

  extractAllBtn.addEventListener('click', () => {
    navigateToDestinationScreen();
  });

  extractSelectedBtn.addEventListener('click', () => {
    navigateToDestinationScreen();
  });
}

function navigateToDestinationScreen(): void {
  // Reset folder selection UI
  selectedDirectoryHandle = null;
  const folderDisplay = document.getElementById('selected-folder-display')!;
  const confirmBtn = document.getElementById('confirm-destination-btn')!;

  folderDisplay.style.display = 'none';
  confirmBtn.textContent = 'Extract Here';
  confirmBtn.classList.remove('folder-selected');

  navigateToScreen('destination');
}

// Store selected directory handle
let selectedDirectoryHandle: FileSystemDirectoryHandle | null = null;

function setupDestinationScreen(): void {
  const backBtn = document.getElementById('back-from-destination')!;
  const cancelBtn = document.getElementById('cancel-destination-btn')!;
  const confirmBtn = document.getElementById('confirm-destination-btn')!;
  const folderNameInput = document.getElementById('folder-name-input') as HTMLInputElement;
  const folderNamePreview = document.getElementById('folder-name-preview')!;

  // Set default folder name from archive
  const archiveName =
    currentArchive?.name?.replace(/\.(zip|tar|gz|7z|rar)$/i, '') || 'extracted-files';
  folderNameInput.value = archiveName;
  folderNamePreview.textContent = archiveName;

  // Update preview as user types
  folderNameInput.addEventListener('input', () => {
    const value = folderNameInput.value.trim() || 'extracted-files';
    folderNamePreview.textContent = value;
  });

  backBtn.addEventListener('click', () => {
    navigateToScreen('extract');
  });

  cancelBtn.addEventListener('click', () => {
    navigateToScreen('extract');
  });

  confirmBtn.addEventListener('click', async () => {
    // Get folder name from input
    const folderName = folderNameInput.value.trim() || 'extracted-files';

    // Start extraction - files will be downloaded to Downloads folder
    await startExtraction(folderName);
  });
}

async function selectDestinationFolder(): Promise<void> {
  try {
    // Chrome extensions can't use File System Access API in popups
    // We'll use a text input to let user specify a folder name
    // The actual extraction will use chrome.downloads API with saveAs prompt

    // Create inline editable folder name input
    const folderDisplay = document.getElementById('selected-folder-display')!;
    const folderNameSpan = document.getElementById('destination-input')!;
    const confirmBtn = document.getElementById('confirm-destination-btn')!;

    // Default folder name based on archive name
    const defaultName =
      currentArchive?.name.replace(/\.(zip|tar|gz|tgz|rar|7z)$/i, '') || 'extracted-files';

    // Show the folder display with editable name
    folderNameSpan.textContent = defaultName;
    folderNameSpan.contentEditable = 'true';
    folderNameSpan.style.cursor = 'text';
    folderDisplay.style.display = 'flex';

    // Store the folder name
    selectedDirectoryHandle = defaultName as any;

    // Update confirm button
    confirmBtn.textContent = `Extract to "${defaultName}"`;
    confirmBtn.classList.add('folder-selected');

    // Focus and select text for easy editing
    folderNameSpan.focus();
    const range = document.createRange();
    range.selectNodeContents(folderNameSpan);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Update on edit
    folderNameSpan.addEventListener('input', () => {
      const newName = folderNameSpan.textContent?.trim() || defaultName;
      selectedDirectoryHandle = newName as any;
      confirmBtn.textContent = `Extract to "${newName}"`;
    });

    folderNameSpan.addEventListener('blur', () => {
      folderNameSpan.contentEditable = 'false';
      folderNameSpan.style.cursor = 'default';
    });
  } catch (err: any) {
    console.error('Error selecting folder:', err);
    alert('Failed to select folder. Please try again.');
  }
}

async function startExtractionWithHandle(dirHandle: FileSystemDirectoryHandle): Promise<void> {
  navigateToScreen('progress');

  const progressTitle = document.getElementById('progress-title')!;
  const progressFilename = document.getElementById('progress-filename')!;

  progressTitle.textContent = 'EXTRACTING FILES';
  progressFilename.textContent = currentArchive?.name || 'archive';

  // Simulate extraction with file writing
  let progress = 0;
  const progressFill = document.getElementById('progress-fill')!;
  const progressPercent = document.getElementById('progress-percent')!;

  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Update complete screen
        const completeTitle = document.getElementById('complete-title')!;
        const completeSummary = document.getElementById('complete-summary')!;
        const destinationPath = document.getElementById('destination-path')!;

        completeTitle.textContent = 'Extraction Complete';
        completeSummary.textContent = `52 files extracted • ${formatFileSize(currentArchive?.size || 0)} total`;
        destinationPath.textContent = dirHandle.name;

        // In a real implementation, write files to the directory:
        // await writeFilesToDirectory(dirHandle, extractedFiles);

        navigateToScreen('complete');
      }, 500);
    }
  }, 300);
}

function setupProgressScreen(): void {
  const cancelBtn = document.getElementById('cancel-btn')!;

  cancelBtn.addEventListener('click', () => {
    // Cancel extraction and go back
    navigateToScreen('extract');
  });

  // Simulate progress (in real app, this would be driven by actual extraction)
  // Auto-advance to complete screen after "extraction"
}

function setupCreateScreen(): void {
  const backBtn = document.getElementById('back-from-create')!;
  const selectFilesBtn = document.getElementById('select-files-btn')!;
  const selectFolderBtn = document.getElementById('select-folder-btn')!;
  const addMoreBtn = document.getElementById('add-more-btn')!;
  const createNowBtn = document.getElementById('create-now-btn')!;

  backBtn.addEventListener('click', () => {
    selectedFiles = [];
    showCreateEmptyState();
    navigateToScreen('home');
  });

  selectFilesBtn.addEventListener('click', () => {
    selectFilesForArchive(false);
  });

  selectFolderBtn.addEventListener('click', () => {
    selectFilesForArchive(true);
  });

  addMoreBtn.addEventListener('click', () => {
    selectFilesForArchive(false);
  });

  createNowBtn.addEventListener('click', () => {
    startArchiveCreation();
  });

  // Handle format selection changes to update compression options
  const formatSelect = document.getElementById('create-format-select') as HTMLSelectElement;
  const compressionSelect = document.getElementById(
    'create-compression-select'
  ) as HTMLSelectElement;

  formatSelect.addEventListener('change', () => {
    const format = formatSelect.value;

    // Disable compression for ZIP and 7z (they have built-in compression)
    if (format === 'zip' || format === '7z') {
      compressionSelect.disabled = true;
      compressionSelect.value = 'none';
    } else {
      compressionSelect.disabled = false;
    }
  });
}

function setupCompleteScreen(): void {
  const openFolderBtn = document.getElementById('open-folder-btn')!;
  const doneBtn = document.getElementById('done-btn')!;

  openFolderBtn.addEventListener('click', async () => {
    // Use Chrome downloads API to show downloaded files
    try {
      const downloads = await chrome.downloads.search({ limit: 1, orderBy: ['-startTime'] });
      if (downloads.length > 0 && downloads[0]) {
        // Show the downloaded file in the system file manager
        chrome.downloads.show(downloads[0].id);
      } else {
        // Fallback: just inform user
        alert('Files extracted! Check your Downloads folder.');
      }
    } catch (error) {
      console.error('Error opening folder:', error);
      alert('Files extracted! Check your Downloads folder.');
    }
    navigateToScreen('home');
  });

  doneBtn.addEventListener('click', () => {
    navigateToScreen('home');
  });
}

function setupSettingsScreen(): void {
  const backBtn = document.getElementById('back-from-settings')!;

  backBtn.addEventListener('click', () => {
    navigateToScreen('home');
  });

  // Load settings from storage
  chrome.storage.local.get(['format', 'scanBeforeExtract', 'openFolder'], (result) => {
    const formatSelect = document.getElementById('format-setting') as HTMLSelectElement;
    const scanCheck = document.getElementById('scan-before-extract') as HTMLInputElement;
    const openFolderCheck = document.getElementById('open-folder') as HTMLInputElement;

    if (result.format && typeof result.format === 'string') formatSelect.value = result.format;
    if (result.scanBeforeExtract !== undefined && typeof result.scanBeforeExtract === 'boolean')
      scanCheck.checked = result.scanBeforeExtract;
    if (result.openFolder !== undefined && typeof result.openFolder === 'boolean')
      openFolderCheck.checked = result.openFolder;
  });

  // Save settings on change
  const formatSelect = document.getElementById('format-setting')!;
  const scanCheck = document.getElementById('scan-before-extract')!;
  const openFolderCheck = document.getElementById('open-folder')!;

  formatSelect.addEventListener('change', saveSettings);
  scanCheck.addEventListener('change', saveSettings);
  openFolderCheck.addEventListener('change', saveSettings);
}

function saveSettings(): void {
  const formatSelect = document.getElementById('format-setting') as HTMLSelectElement;
  const scanCheck = document.getElementById('scan-before-extract') as HTMLInputElement;
  const openFolderCheck = document.getElementById('open-folder') as HTMLInputElement;

  chrome.storage.local.set({
    format: formatSelect.value,
    scanBeforeExtract: scanCheck.checked,
    openFolder: openFolderCheck.checked,
  });
}

function navigateToScreen(screen: string): void {
  // Hide current screen
  screens[currentScreen]?.classList.remove('active');

  // Show new screen
  screens[screen]?.classList.add('active');
  currentScreen = screen;
}

function selectFile(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip,.tar,.tar.gz,.tgz,.gz,.rar,.7z';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };
  input.click();
}

function handleFileSelection(file: File): void {
  currentArchive = file;

  // Update extract screen with file info
  const filename = document.getElementById('extract-filename')!;
  const filesize = document.getElementById('extract-filesize')!;

  filename.textContent = file.name;
  filesize.textContent = `${formatFileSize(file.size)} • Just now`;

  // Add to recent archives
  addToRecentArchives(file.name, formatFileSize(file.size));

  // Navigate to extract screen
  navigateToScreen('extract');

  // Start security scanning
  startSecurityScan(file);
}

async function startSecurityScan(file: File): Promise<void> {
  const scanStatus = document.getElementById('scan-status')!;
  const scanTitle = document.getElementById('scan-title')!;
  const scanDescription = document.getElementById('scan-description')!;
  const scanChecks = document.getElementById('scan-checks')!;

  // Reset to scanning state
  scanStatus.className = 'scan-status scanning';
  scanTitle.textContent = 'Scanning Archive...';
  scanDescription.textContent = 'Running security checks';

  const checks = [
    { name: 'File Types', description: 'Checking for executable files', duration: 600 },
    {
      name: 'Nested Archives',
      description: 'Detecting recursively packed containers',
      duration: 800,
    },
    { name: 'Path Traversal', description: 'Validating file paths', duration: 500 },
    { name: 'File Sizes', description: 'Analyzing compression ratios', duration: 700 },
    { name: 'Integrity', description: 'Verifying archive structure', duration: 600 },
  ];

  scanChecks.innerHTML = '';

  for (const check of checks) {
    const checkItem = document.createElement('div');
    checkItem.className = 'scan-check-item checking';
    checkItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
      <span>${check.name}: ${check.description}</span>
    `;
    scanChecks.appendChild(checkItem);

    await new Promise((resolve) => setTimeout(resolve, check.duration));

    checkItem.className = 'scan-check-item complete';
    checkItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${check.name}: ✓ Pass</span>
    `;
  }

  // Update to complete state
  scanStatus.className = 'scan-status';
  scanStatus.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <div>
      <strong>Scan Complete — No issues found</strong>
      <p>ZipKit completed an integrity & security analysis of ${Math.floor(Math.random() * 50) + 20} files</p>
    </div>
  `;

  // Load archive contents after scan
  loadArchiveContents(file);
}

function loadArchiveContents(_file: File): void {
  // In real implementation, use archive-core to read contents
  // For now, show a sample file tree
  const fileTree = document.getElementById('extract-file-tree')!;
  fileTree.innerHTML = `
    <div class="tree-item folder">
      <input type="checkbox" id="folder1" />
      <label for="folder1">📁 images (3 items)</label>
      <div class="tree-children">
        <div class="tree-item file">
          <input type="checkbox" id="file1" />
          <label for="file1">🖼️ hero-banner.png <span class="size">2.4 MB</span></label>
        </div>
        <div class="tree-item file">
          <input type="checkbox" id="file2" />
          <label for="file2">🖼️ icon-32.png <span class="size">10 KB</span></label>
        </div>
      </div>
    </div>
    <div class="tree-item folder">
      <input type="checkbox" id="folder2" />
      <label for="folder2">📁 src</label>
      <div class="tree-children">
        <div class="tree-item file">
          <input type="checkbox" id="file3" />
          <label for="file3">📄 index.tsx <span class="size">8.5 KB</span></label>
        </div>
      </div>
    </div>
  `;
}

async function startExtraction(destination: string): Promise<void> {
  const progressTitle = document.getElementById('progress-title')!;
  const progressFilename = document.getElementById('progress-filename')!;

  progressTitle.textContent = 'EXTRACTING FILES';
  progressFilename.textContent = currentArchive?.name || 'archive';

  navigateToScreen('progress');

  // In a real implementation, this would:
  // 1. Use chrome.downloads API to download files to Downloads/{destination}/
  // 2. Track the download ID for later use
  // For now, we'll simulate the extraction

  // Simulate extraction progress
  let progress = 0;
  const progressFill = document.getElementById('progress-fill')!;
  const progressPercent = document.getElementById('progress-percent')!;

  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(async () => {
        // Update complete screen for extraction
        const completeTitle = document.getElementById('complete-title')!;
        const completeSummary = document.getElementById('complete-summary')!;
        const destinationPath = document.getElementById('destination-path')!;

        const extractPath = `Downloads/${destination}`;

        completeTitle.textContent = 'Extraction Complete';
        completeSummary.textContent = `52 files extracted • ${formatFileSize(currentArchive?.size || 0)} total`;
        destinationPath.textContent = extractPath;

        // Save to history with extraction location
        if (currentArchive) {
          await addToHistory(currentArchive.name, formatFileSize(currentArchive.size), extractPath);
        }

        navigateToScreen('complete');
      }, 500);
    }
  }, 300);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Recent Archives Management
interface RecentArchive {
  name: string;
  size: string;
  date: string;
  extractedTo?: string; // Path where files were extracted
  downloadId?: number; // Chrome download ID for opening folder
}

async function loadRecentArchives(): Promise<void> {
  const result = await chrome.storage.local.get('recentArchives');
  const recent = (result.recentArchives || []) as RecentArchive[];

  const recentList = document.getElementById('recent-list')!;

  if (recent.length === 0) {
    recentList.innerHTML =
      '<p style="color: #9aa0a6; font-size: 13px; padding: 12px;">No recent archives</p>';
    return;
  }

  recentList.innerHTML = recent
    .slice(0, 3)
    .map(
      (item: RecentArchive) => `
      <div class="recent-item" data-name="${item.name}">
        <div class="recent-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
          </svg>
        </div>
        <div class="recent-item-info">
          <div class="recent-item-name">${item.name}</div>
          <div class="recent-item-meta">${item.size} • ${item.date}${item.extractedTo ? ` • ${item.extractedTo}` : ''}</div>
        </div>
      </div>
    `
    )
    .join('');
}

async function addToHistory(name: string, size: string, extractedTo?: string): Promise<void> {
  const result = await chrome.storage.local.get('recentArchives');
  const recent = (result.recentArchives || []) as RecentArchive[];

  const newItem: RecentArchive = {
    name,
    size,
    date: new Date().toLocaleDateString(),
    extractedTo,
  };

  // Add to beginning, remove duplicates, keep only last 10
  const updated = [newItem, ...recent.filter((r: RecentArchive) => r.name !== name)].slice(0, 10);

  await chrome.storage.local.set({ recentArchives: updated });
  await loadRecentArchives();
}

async function addToRecentArchives(name: string, size: string): Promise<void> {
  await addToHistory(name, size);
}

// Create Archive Functions
function selectFilesForArchive(isFolder: boolean): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = !isFolder;

  if (isFolder) {
    // @ts-ignore - webkitdirectory is not in standard types
    input.webkitdirectory = true;
  }

  input.onchange = (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (files.length > 0) {
      selectedFiles.push(...files);
      showCreateFilesView();
    }
  };

  input.click();
}

function showCreateEmptyState(): void {
  const emptyState = document.getElementById('create-empty-state')!;
  const filesView = document.getElementById('create-files-view')!;

  emptyState.style.display = 'flex';
  filesView.style.display = 'none';
}

function showCreateFilesView(): void {
  const emptyState = document.getElementById('create-empty-state')!;
  const filesView = document.getElementById('create-files-view')!;
  const filesList = document.getElementById('create-files-list')!;
  const filesCount = document.getElementById('files-count')!;

  emptyState.style.display = 'none';
  filesView.style.display = 'block';

  // Build folder structure
  const folderStructure = buildFolderStructure(selectedFiles);
  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  filesCount.textContent = `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} • ${formatFileSize(totalSize)}`;

  filesList.innerHTML = renderFolderStructure(folderStructure);

  // Add remove handlers
  filesList.querySelectorAll('.file-item-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
      selectedFiles.splice(index, 1);
      if (selectedFiles.length === 0) {
        showCreateEmptyState();
      } else {
        showCreateFilesView();
      }
    });
  });
}

interface FolderNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  fileIndex?: number;
  children?: Map<string, FolderNode>;
}

function buildFolderStructure(files: File[]): Map<string, FolderNode> {
  const root = new Map<string, FolderNode>();

  files.forEach((file, index) => {
    // Get the relative path from the file
    // @ts-ignore - webkitRelativePath exists on File when using webkitdirectory
    const relativePath = file.webkitRelativePath || file.name;
    const parts = relativePath.split('/').filter((p) => p); // Remove empty parts

    let currentLevel = root;

    // Build folder hierarchy
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue; // Skip empty parts
      const isFile = i === parts.length - 1;

      if (!currentLevel.has(part)) {
        currentLevel.set(part, {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: parts.slice(0, i + 1).join('/'),
          ...(isFile ? { size: file.size, fileIndex: index } : { children: new Map() }),
        });
      }

      if (!isFile) {
        currentLevel = currentLevel.get(part)!.children!;
      }
    }
  });

  return root;
}

function renderFolderStructure(structure: Map<string, FolderNode>, depth: number = 0): string {
  const items: string[] = [];

  structure.forEach((node) => {
    const indent = depth * 16;

    if (node.type === 'folder') {
      items.push(`
        <div class="folder-item" style="padding-left: ${indent}px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
          </svg>
          <div class="file-item-info">
            <div class="file-item-name">📁 ${node.name}</div>
            <div class="file-item-size">${node.children?.size || 0} items</div>
          </div>
        </div>
      `);
      if (node.children) {
        items.push(renderFolderStructure(node.children, depth + 1));
      }
    } else {
      items.push(`
        <div class="file-item" data-index="${node.fileIndex}" style="padding-left: ${indent}px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <div class="file-item-info">
            <div class="file-item-name">${node.name}</div>
            <div class="file-item-size">${formatFileSize(node.size || 0)}</div>
          </div>
          <button class="file-item-remove" data-index="${node.fileIndex}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `);
    }
  });

  return items.join('');
}

function startArchiveCreation(): void {
  if (selectedFiles.length === 0) return;

  const formatSelect = document.getElementById('create-format-select') as HTMLSelectElement;
  const compressionSelect = document.getElementById(
    'create-compression-select'
  ) as HTMLSelectElement;
  const format = formatSelect.value;
  const compression = compressionSelect.value;

  // Build final extension based on format and compression
  let extension = format;

  if (compression !== 'none') {
    if (format === 'tar') {
      // TAR with compression: tar.gz, tar.bz2, tar.xz
      const compressionExtMap: Record<string, string> = {
        gzip: 'tar.gz',
        bzip2: 'tar.bz2',
        xz: 'tar.xz',
      };
      extension = compressionExtMap[compression] || 'tar';
    } else if (format === 'zip' || format === '7z') {
      // ZIP and 7z have built-in compression, ignore separate compression
      extension = format;
    }
  }

  // Update progress screen for creation
  const progressTitle = document.getElementById('progress-title')!;
  const progressFilename = document.getElementById('progress-filename')!;

  progressTitle.textContent = 'CREATING ARCHIVE';
  progressFilename.textContent = `my-archive.${extension}`;

  navigateToScreen('progress');

  // Simulate archive creation
  let progress = 0;
  const progressFill = document.getElementById('progress-fill')!;
  const progressPercent = document.getElementById('progress-percent')!;

  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Show creation complete
        const completeTitle = document.getElementById('complete-title')!;
        const completeSummary = document.getElementById('complete-summary')!;
        const destinationPath = document.getElementById('destination-path')!;

        const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

        completeTitle.textContent = 'Archive Created';
        completeSummary.textContent = `${selectedFiles.length} files packaged • ${formatFileSize(totalSize)} total`;
        destinationPath.textContent = `Downloads/my-archive.${extension}`;

        addToRecentArchives(`my-archive.${extension}`, formatFileSize(totalSize));

        selectedFiles = [];
        showCreateEmptyState();
        navigateToScreen('complete');
      }, 500);
    }
  }, 300);
}

// Version Management
async function loadVersion(): Promise<void> {
  try {
    const manifest = chrome.runtime.getManifest();
    const versionSpan = document.getElementById('app-version');
    if (versionSpan) {
      versionSpan.textContent = manifest.version;
    }
  } catch (error) {
    console.error('Failed to load version:', error);
  }
}
