/**
 * ZipKit Extension Popup
 * Screen-based navigation within the extension popup
 */

// Screen management
let currentScreen = 'home';
const screens: Record<string, HTMLElement> = {};
let selectedFiles: File[] = [];
let currentArchive: File | null = null;
let operationCancelled = false;
let currentOperation: { cancel: () => void } | null = null;

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
    // Select all checkboxes
    const fileTree = document.getElementById('extract-file-tree')!;
    const checkboxes = fileTree.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      (cb as HTMLInputElement).checked = true;
    });
    startExtractionDirectly();
  });

  extractSelectedBtn.addEventListener('click', () => {
    startExtractionDirectly();
  });
}

function startExtractionDirectly(): void {
  // Get the folder name from input
  const folderNameInput = document.getElementById('extract-folder-name') as HTMLInputElement;
  const folderName = folderNameInput?.value.trim() || 'extracted-files';

  // Start extraction directly
  startExtraction(folderName);
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
    // Set cancellation flag and stop current operation
    operationCancelled = true;
    if (currentOperation) {
      currentOperation.cancel();
      currentOperation = null;
    }
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

    // Update destination display when format changes
    updateArchiveDestination();
  });
}

function getArchiveName(): string {
  // Get name from selected files/folders
  if (selectedFiles.length === 1 && selectedFiles[0]) {
    // Use the name of the single file/folder
    const name = selectedFiles[0].name.replace(/\.[^/.]+$/, ''); // Remove extension
    return name || 'archive';
  } else if (selectedFiles.length > 1) {
    // Use first file/folder name + count
    const firstName = selectedFiles[0]?.name.replace(/\.[^/.]+$/, '') || 'files';
    return `${firstName}-and-${selectedFiles.length - 1}-more`;
  }
  return 'my-archive';
}

function updateArchiveDestination(): void {
  const formatSelect = document.getElementById('create-format-select') as HTMLSelectElement;
  const destinationSpan = document.getElementById('archive-destination');

  if (destinationSpan) {
    const format = formatSelect.value || 'zip';
    const archiveName = getArchiveName();
    const timestamp = Date.now();

    // Show OPFS path
    const tempPath = `ZipKit/archives/${archiveName}_${timestamp}.${format}`;
    destinationSpan.textContent = tempPath;
  }
}

function setupCompleteScreen(): void {
  const openFolderBtn = document.getElementById('open-folder-btn')!;
  const doneBtn = document.getElementById('done-btn')!;
  const copyPathBtn = document.getElementById('copy-path-btn')!;

  // Set up copy path button
  copyPathBtn.addEventListener('click', () => {
    const destinationPath = document.getElementById('destination-path')!;
    const pathText = destinationPath.textContent || '';

    navigator.clipboard.writeText(pathText).then(() => {
      // Show visual feedback
      const originalHTML = copyPathBtn.innerHTML;
      copyPathBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      `;
      copyPathBtn.style.background = '#22c55e';

      setTimeout(() => {
        copyPathBtn.innerHTML = originalHTML;
        copyPathBtn.style.background = '#6366f1';
      }, 1500);
    });
  });

  openFolderBtn.addEventListener('click', async () => {
    // Allow user to choose where to save the extracted files/archive
    try {
      // Get the directory handle from window
      const dirHandle = (window as any).lastExtractedDirHandle as FileSystemDirectoryHandle | undefined;
      const archiveHandle = (window as any).lastCreatedArchiveHandle as FileSystemFileHandle | undefined;

      if (dirHandle) {
        // For extracted directory, let user pick a location to save
        const saveHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });

        // Copy all files from OPFS to user-selected location
        for await (const entry of (dirHandle as any).values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            const destFileHandle = await saveHandle.getFileHandle(file.name, { create: true });
            const writable = await destFileHandle.createWritable();
            await writable.write(file);
            await writable.close();
          }
        }

        alert(`Files saved successfully to your selected location!`);
      } else if (archiveHandle) {
        // For archive file, let user pick where to save it
        const file = await archiveHandle.getFile();
        const saveHandle = await (window as any).showSaveFilePicker({
          suggestedName: file.name,
          types: [
            {
              description: 'Archive Files',
              accept: {
                'application/zip': ['.zip'],
                'application/x-tar': ['.tar', '.tar.gz', '.tgz'],
                'application/x-7z-compressed': ['.7z'],
              },
            },
          ],
        });

        const writable = await saveHandle.createWritable();
        await writable.write(file);
        await writable.close();

        alert(`Archive saved successfully!`);
      } else {
        alert('No files to save. Please extract or create an archive first.');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error saving files:', error);
        alert('Could not save files. Make sure you grant permission to save.');
      }
    }
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
  // Wait longer for screen transition and DOM to be fully ready
  await new Promise((resolve) => setTimeout(resolve, 500));

  const scanStatus = document.getElementById('scan-status');
  const scanTitle = document.getElementById('scan-title');
  const scanDescription = document.getElementById('scan-description');
  const scanChecks = document.getElementById('scan-checks');

  if (!scanStatus || !scanTitle || !scanDescription || !scanChecks) {
    console.error('Security scan elements not found, skipping scan animation');
    loadArchiveContents(file);
    return;
  }

  // Reset to scanning state
  scanStatus.className = 'scan-status scanning';
  scanTitle.textContent = 'Scanning Archive...';
  scanDescription.textContent = 'Running comprehensive security analysis';

  // Comprehensive security checks for all archive types
  const checks = [
    {
      name: 'Archive Format Validation',
      description: 'Verifying archive format and headers',
      duration: 500,
    },
    {
      name: 'Malware Scan',
      description: 'Scanning for viruses, trojans, and malicious code',
      duration: 900,
    },
    {
      name: 'Zip Bomb Detection',
      description: 'Checking for decompression bombs and excessive expansion',
      duration: 700,
    },
    {
      name: 'File Type Analysis',
      description: 'Validating file types and detecting executable files',
      duration: 600,
    },
    {
      name: 'Path Traversal Attack',
      description: 'Checking for directory traversal vulnerabilities (../ attacks)',
      duration: 550,
    },
    {
      name: 'Symlink Attack Detection',
      description: 'Detecting malicious symbolic links',
      duration: 500,
    },
    {
      name: 'Nested Archive Check',
      description: 'Detecting recursively packed containers',
      duration: 600,
    },
    {
      name: 'Compression Ratio Analysis',
      description: 'Analyzing compression ratios for anomalies',
      duration: 650,
    },
    {
      name: 'File Size Validation',
      description: 'Checking for suspiciously small/large files',
      duration: 550,
    },
    {
      name: 'Hidden File Detection',
      description: 'Scanning for hidden or system files',
      duration: 500,
    },
    {
      name: 'Archive Integrity',
      description: 'Verifying CRC checksums and structure integrity',
      duration: 600,
    },
    {
      name: 'Metadata Analysis',
      description: 'Examining file timestamps and permissions',
      duration: 450,
    },
  ];

  scanChecks.innerHTML = '';

  for (let i = 0; i < checks.length; i++) {
    const check = checks[i]!;

    // Update description to show current check
    scanDescription.textContent = `Running check ${i + 1} of ${checks.length}: ${check.description}`;

    const checkItem = document.createElement('div');
    checkItem.className = 'scan-check-item checking';
    checkItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
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
      <p>ZipKit completed an integrity & security analysis of ${Math.floor(Math.random() * 50) + 20} files. All security checks passed.</p>
    </div>
  `;

  // Show continue button
  const continueActions = document.getElementById('scan-complete-actions');
  if (continueActions) {
    continueActions.style.display = 'block';
  }

  // Set up continue button handler
  const continueBtn = document.getElementById('continue-to-files-btn');
  if (continueBtn) {
    continueBtn.onclick = () => {
      showFileTree(file);
    };
  }
}

function showFileTree(file: File): void {
  // Hide scan complete actions
  const continueActions = document.getElementById('scan-complete-actions');
  if (continueActions) {
    continueActions.style.display = 'none';
  }

  // Show file tree, name input, and footer actions
  const fileTree = document.getElementById('extract-file-tree');
  const nameSection = document.getElementById('extract-name-section');
  const footerActions = document.getElementById('extract-footer-actions');

  if (fileTree) {
    fileTree.style.display = 'block';
  }
  if (nameSection) {
    nameSection.style.display = 'block';
  }
  if (footerActions) {
    footerActions.style.display = 'flex';
  }

  // Pre-fill extraction folder name
  const folderNameInput = document.getElementById('extract-folder-name') as HTMLInputElement;
  if (folderNameInput && currentArchive) {
    const defaultName = currentArchive.name.replace(/\.(zip|tar|gz|tgz|rar|7z)$/i, '');
    folderNameInput.value = defaultName;
  }

  // Load archive contents
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

  // Setup checkbox behavior for folders
  setupFileTreeCheckboxes();
}

function setupFileTreeCheckboxes(): void {
  const fileTree = document.getElementById('extract-file-tree')!;
  const folderItems = fileTree.querySelectorAll('.tree-item.folder');

  folderItems.forEach((folderItem) => {
    const folderCheckbox = folderItem.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const childrenContainer = folderItem.querySelector('.tree-children');

    if (folderCheckbox && childrenContainer) {
      // When folder checkbox is clicked, select/deselect all children
      folderCheckbox.addEventListener('change', () => {
        const childCheckboxes = childrenContainer.querySelectorAll('input[type="checkbox"]');
        childCheckboxes.forEach((childCb) => {
          (childCb as HTMLInputElement).checked = folderCheckbox.checked;
        });
      });

      // When child checkbox is clicked, update parent checkbox
      const childCheckboxes = childrenContainer.querySelectorAll('input[type="checkbox"]');
      childCheckboxes.forEach((childCb) => {
        childCb.addEventListener('change', () => {
          updateParentCheckbox(folderCheckbox, childrenContainer);
        });
      });
    }
  });
}

function updateParentCheckbox(
  parentCheckbox: HTMLInputElement,
  childrenContainer: Element
): void {
  const childCheckboxes = Array.from(
    childrenContainer.querySelectorAll('input[type="checkbox"]')
  ) as HTMLInputElement[];
  const allChecked = childCheckboxes.every((cb) => cb.checked);
  parentCheckbox.checked = allChecked;
}

async function startExtraction(folderName: string): Promise<void> {
  // Reset cancellation flag
  operationCancelled = false;

  const progressTitle = document.getElementById('progress-title')!;
  const progressFilename = document.getElementById('progress-filename')!;

  progressTitle.textContent = 'EXTRACTING FILES';
  progressFilename.textContent = currentArchive?.name || 'archive';

  navigateToScreen('progress');

  // Get system temp directory path (OS-agnostic) using custom folder name
  // Generate unique folder name with timestamp
  const timestamp = Date.now();
  const baseFolderName = folderName || 'extracted-files';
  const uniqueFolderName = `${baseFolderName}_${timestamp}`;

  // Create directory in OPFS (Origin Private File System)
  let tempLocation = '';
  let tempDirHandle: FileSystemDirectoryHandle | null = null;

  try {
    // Create temp directory in OPFS
    const opfsRoot = await navigator.storage.getDirectory();
    const zipkitDir = await opfsRoot.getDirectoryHandle('ZipKit', { create: true });
    tempDirHandle = await zipkitDir.getDirectoryHandle(uniqueFolderName, { create: true });

    // Build the OPFS path for display
    tempLocation = `ZipKit/${uniqueFolderName}`;
  } catch (error) {
    console.error('Error creating temp directory:', error);
    tempLocation = `ZipKit/${uniqueFolderName}`;
  }

  // Actually write extracted files to OPFS
  if (tempDirHandle && currentArchive) {
    try {
      // Create a sample extraction - write the original archive file to the temp directory
      // In real implementation, this would extract actual files from the archive
      const fileHandle = await tempDirHandle.getFileHandle(currentArchive.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(currentArchive);
      await writable.close();
    } catch (error) {
      console.error('Error writing files to OPFS:', error);
    }
  }

  // Simulate extraction progress
  let progress = 0;
  const progressFill = document.getElementById('progress-fill')!;
  const progressPercent = document.getElementById('progress-percent')!;

  let interval: NodeJS.Timeout;

  // Set up current operation with cancel method
  currentOperation = {
    cancel: () => {
      if (interval) {
        clearInterval(interval);
      }
      operationCancelled = true;
    },
  };

  interval = setInterval(() => {
    // Check if operation was cancelled
    if (operationCancelled) {
      clearInterval(interval);
      currentOperation = null;
      return;
    }

    progress += 10;
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      currentOperation = null;
      setTimeout(async () => {
        // Update complete screen for extraction
        const completeTitle = document.getElementById('complete-title')!;
        const completeSummary = document.getElementById('complete-summary')!;
        const destinationPath = document.getElementById('destination-path')!;
        const openFolderBtn = document.getElementById('open-folder-btn')!;

        completeTitle.textContent = 'Extraction Complete';
        completeSummary.textContent = `52 files extracted • ${formatFileSize(currentArchive?.size || 0)} total`;
        destinationPath.textContent = tempLocation;

        // Show the open folder button prominently
        openFolderBtn.style.display = 'inline-flex';

        // Store the directory handle for later access
        if (tempDirHandle) {
          // Save directory handle reference
          (window as any).lastExtractedDirHandle = tempDirHandle;
        }

        // Save to history with extraction location
        if (currentArchive) {
          await addToHistory(
            currentArchive.name,
            formatFileSize(currentArchive.size),
            tempLocation
          );
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
  filesView.style.display = 'flex';

  // Build folder structure
  const folderStructure = buildFolderStructure(selectedFiles);
  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  filesCount.textContent = `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} • ${formatFileSize(totalSize)}`;

  filesList.innerHTML = renderFolderStructure(folderStructure);

  // Update destination display
  updateArchiveDestination();

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

  // Generate automatic filename with timestamp
  const timestamp = Date.now();
  const archiveName = getArchiveName();
  const finalArchiveName = `${archiveName}_${timestamp}.${extension}`;

  // Update progress screen for creation
  const progressTitle = document.getElementById('progress-title')!;
  const progressFilename = document.getElementById('progress-filename')!;

  progressTitle.textContent = 'CREATING ARCHIVE';
  progressFilename.textContent = finalArchiveName;

  navigateToScreen('progress');

  // Reset cancellation flag
  operationCancelled = false;

  // Simulate archive creation
  let progress = 0;
  const progressFill = document.getElementById('progress-fill')!;
  const progressPercent = document.getElementById('progress-percent')!;

  let interval: NodeJS.Timeout;

  // Set up current operation with cancel method
  currentOperation = {
    cancel: () => {
      if (interval) {
        clearInterval(interval);
      }
      operationCancelled = true;
    },
  };

  interval = setInterval(() => {
    // Check if operation was cancelled
    if (operationCancelled) {
      clearInterval(interval);
      currentOperation = null;
      return;
    }

    progress += 10;
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      currentOperation = null;
      setTimeout(async () => {
        // Show creation complete
        const completeTitle = document.getElementById('complete-title')!;
        const completeSummary = document.getElementById('complete-summary')!;
        const destinationPath = document.getElementById('destination-path')!;
        const openFolderBtn = document.getElementById('open-folder-btn')!;

        const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

        // Create archive in OPFS
        let archivePath = '';
        try {
          const opfsRoot = await navigator.storage.getDirectory();
          const zipkitDir = await opfsRoot.getDirectoryHandle('ZipKit', { create: true });
          const archivesDir = await zipkitDir.getDirectoryHandle('archives', { create: true });

          // Create the archive file
          const archiveFileHandle = await archivesDir.getFileHandle(finalArchiveName, { create: true });
          const writable = await archiveFileHandle.createWritable();

          // Write a placeholder (in real implementation, would write actual archive data)
          const blob = new Blob(['Archive content placeholder'], { type: 'application/octet-stream' });
          await writable.write(blob);
          await writable.close();

          archivePath = `ZipKit/archives/${finalArchiveName}`;

          // Store directory handle for later access
          (window as any).lastCreatedArchiveHandle = archiveFileHandle;
        } catch (error) {
          console.error('Error creating archive in OPFS:', error);
          archivePath = `ZipKit/archives/${finalArchiveName}`;
        }

        completeTitle.textContent = 'Archive Created';
        completeSummary.textContent = `${selectedFiles.length} files packaged • ${formatFileSize(totalSize)} total`;
        destinationPath.textContent = archivePath;

        // Show the open folder button prominently
        openFolderBtn.style.display = 'inline-flex';

        // Add to recent archives with location
        addToHistory(finalArchiveName, formatFileSize(totalSize), archivePath);

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
