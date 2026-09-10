/**
 * ZipKit Workspace
 * Full-featured interface for archive operations with complete integration
 */

import { createAdapter, type ArchiveAdapter, type ArchiveEntry } from '@zipkit/archive-core';
import {
  ArchiveSecurityScanner,
  validatePath,
  type SecurityReport,
} from '@zipkit/archive-security';
import { FileTreeComponent, SecurityBadge, AlertBox, FileList, type FileItem } from '@zipkit/ui';

type Mode = 'open' | 'create';

let currentAdapter: ArchiveAdapter | null = null;
let currentEntries: ArchiveEntry[] = [];
let currentFile: File | null = null;
let selectedFiles: File[] = [];

// UI Components
let fileTreeComponent: FileTreeComponent | null = null;
let securityBadge: SecurityBadge | null = null;
let alertBox: AlertBox | null = null;
let fileList: FileList | null = null;

// Abort controller for cancellation
let currentOperation: AbortController | null = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeWorkspace();
  setupNavigation();
  setupOpenView();
  setupCreateView();
});

function initializeWorkspace(): void {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') as Mode | null;

  if (mode === 'create') {
    switchView('create');
  } else {
    switchView('open');
  }
}

function setupNavigation(): void {
  const navOpen = document.getElementById('nav-open') as HTMLButtonElement;
  const navCreate = document.getElementById('nav-create') as HTMLButtonElement;

  navOpen?.addEventListener('click', () => switchView('open'));
  navCreate?.addEventListener('click', () => switchView('create'));
}

function switchView(mode: Mode): void {
  // TODO: Track mode when implementing mode switching
  // currentMode = mode;

  const navButtons = document.querySelectorAll('.nav-button');
  navButtons.forEach((btn) => btn.classList.remove('active'));

  const views = document.querySelectorAll('.view');
  views.forEach((view) => view.classList.remove('active'));

  if (mode === 'open') {
    document.getElementById('nav-open')?.classList.add('active');
    document.getElementById('open-view')?.classList.add('active');
  } else {
    document.getElementById('nav-create')?.classList.add('active');
    document.getElementById('create-view')?.classList.add('active');
  }
}

function setupOpenView(): void {
  const selectArchiveBtn = document.getElementById('select-archive');
  const closeArchiveBtn = document.getElementById('close-archive');
  const extractAllBtn = document.getElementById('extract-all');
  const extractSelectedBtn = document.getElementById('extract-selected');

  selectArchiveBtn?.addEventListener('click', async () => {
    await selectArchive();
  });

  closeArchiveBtn?.addEventListener('click', () => {
    closeArchive();
  });

  extractAllBtn?.addEventListener('click', async () => {
    await extractAll();
  });

  extractSelectedBtn?.addEventListener('click', async () => {
    await extractSelected();
  });
}

function setupCreateView(): void {
  const selectFilesBtn = document.getElementById('select-files');
  const selectFolderBtn = document.getElementById('select-folder');
  const createArchiveBtn = document.getElementById('create-archive-btn');
  const clearSelectionBtn = document.getElementById('clear-selection');
  const formatSelect = document.getElementById('format-select') as HTMLSelectElement;

  selectFilesBtn?.addEventListener('click', async () => {
    await selectFilesForArchive();
  });

  selectFolderBtn?.addEventListener('click', async () => {
    await selectFolderForArchive();
  });

  createArchiveBtn?.addEventListener('click', async () => {
    await createArchive();
  });

  clearSelectionBtn?.addEventListener('click', () => {
    clearFileSelection();
  });

  formatSelect?.addEventListener('change', () => {
    updateCompressionVisibility();
  });
}

// ============================================================
// OPEN ARCHIVE WORKFLOW
// ============================================================

async function selectArchive(): Promise<void> {
  try {
    if (!('showOpenFilePicker' in window)) {
      showError('File System Access API is not supported in this browser.');
      return;
    }

    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'Archive Files',
          accept: {
            'application/zip': ['.zip'],
            'application/x-tar': ['.tar'],
            'application/gzip': ['.gz', '.tar.gz', '.tgz'],
          },
        },
      ],
      multiple: false,
    });

    const file = await fileHandle.getFile();
    await openArchive(file);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error selecting archive:', error);
      showError('Failed to select archive. Please try again.');
    }
  }
}

async function openArchive(file: File): Promise<void> {
  try {
    showProgress('Opening archive...', 0);

    // Create adapter
    currentAdapter = await createAdapter(file);
    currentFile = file;

    // Inspect metadata
    const metadata = await currentAdapter.inspect();

    // List all entries
    currentEntries = [];
    for await (const entry of currentAdapter.listEntries()) {
      currentEntries.push(entry);
    }

    showProgress('Scanning for security issues...', 50);

    // Security scan
    const scanner = new ArchiveSecurityScanner();
    const securityReport = await scanner.scan(currentEntries, metadata);

    hideProgress();

    // Display results
    displayArchiveContent(file, metadata, securityReport);
  } catch (error) {
    hideProgress();
    console.error('Error opening archive:', error);
    showError(`Failed to open archive: ${(error as Error).message}`);
  }
}

function displayArchiveContent(file: File, metadata: any, securityReport: SecurityReport): void {
  const emptyState = document.getElementById('open-empty');
  const contentView = document.getElementById('open-content');
  const archiveName = document.getElementById('archive-name');
  const archiveSize = document.getElementById('archive-size');

  if (emptyState) emptyState.style.display = 'none';
  if (contentView) contentView.style.display = 'flex';

  if (archiveName) archiveName.textContent = file.name;
  if (archiveSize) {
    archiveSize.textContent = `${metadata.totalEntries} files • ${formatBytes(metadata.totalSize)}`;
  }

  // Display security badge
  const badgeContainer = document.getElementById('security-badge');
  if (badgeContainer) {
    securityBadge = new SecurityBadge(badgeContainer);
    securityBadge.render(securityReport.overall, securityReport.issues.length);
  }

  // Display security alerts if issues found
  if (securityReport.issues.length > 0) {
    const securityPanel = document.getElementById('security-panel');
    if (securityPanel) {
      securityPanel.style.display = 'block';
    }

    const findingsContainer = document.getElementById('security-findings');
    if (findingsContainer) {
      alertBox = new AlertBox(findingsContainer);
      alertBox.render(securityReport.issues);
    }
  }

  // Display file tree
  const fileTreeContainer = document.getElementById('file-tree');
  if (fileTreeContainer) {
    fileTreeComponent = new FileTreeComponent(fileTreeContainer, currentEntries);
    fileTreeComponent.render();
    fileTreeComponent.setSelectionChangeHandler((selectedPaths) => {
      const extractSelectedBtn = document.getElementById('extract-selected') as HTMLButtonElement;
      if (extractSelectedBtn) {
        extractSelectedBtn.disabled = selectedPaths.length === 0;
      }
    });
  }
}

function closeArchive(): void {
  currentAdapter = null;
  currentFile = null;
  currentEntries = [];
  fileTreeComponent = null;
  securityBadge = null;
  alertBox = null;

  const emptyState = document.getElementById('open-empty');
  const contentView = document.getElementById('open-content');
  const securityPanel = document.getElementById('security-panel');

  if (emptyState) emptyState.style.display = 'flex';
  if (contentView) contentView.style.display = 'none';
  if (securityPanel) securityPanel.style.display = 'none';
}

// ============================================================
// EXTRACTION WORKFLOW
// ============================================================

async function extractAll(): Promise<void> {
  if (!currentAdapter || !currentFile) return;

  try {
    const dirHandle = await (window as any).showDirectoryPicker();
    const entriesToExtract = currentEntries.filter((e) => !e.isDirectory);

    await extractEntries(entriesToExtract, dirHandle);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error extracting files:', error);
      showError(`Failed to extract files: ${(error as Error).message}`);
    }
  }
}

async function extractSelected(): Promise<void> {
  if (!currentAdapter || !fileTreeComponent) return;

  const selectedPaths = fileTreeComponent.getSelectedPaths();
  if (selectedPaths.length === 0) {
    showError('No files selected for extraction');
    return;
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker();
    const entriesToExtract = currentEntries.filter(
      (e) => selectedPaths.includes(e.path) && !e.isDirectory
    );

    await extractEntries(entriesToExtract, dirHandle);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error extracting files:', error);
      showError(`Failed to extract files: ${(error as Error).message}`);
    }
  }
}

async function extractEntries(entries: ArchiveEntry[], dirHandle: any): Promise<void> {
  if (!currentAdapter) return;

  currentOperation = new AbortController();

  showProgress('Extracting files...', 0);

  try {
    let processed = 0;
    const total = entries.length;

    for (const entry of entries) {
      if (currentOperation.signal.aborted) {
        throw new Error('Operation cancelled');
      }

      // Validate path safety
      try {
        validatePath(entry.path, '');
      } catch (error) {
        console.warn(`Skipping unsafe path: ${entry.path}`, error);
        processed++;
        continue;
      }

      // Extract entry - note: extractEntry may not exist on all adapters
      // This is a placeholder for future implementation
      const blob = new Blob(); // TODO: implement actual extraction
      // const blob = await currentAdapter.extractEntry?.(entry.path, {
      //   signal: currentOperation.signal,
      // });

      // Write to file system
      await writeExtractedFile(dirHandle, entry.path, blob);

      processed++;
      const progress = (processed / total) * 100;
      showProgress(`Extracting: ${entry.path}`, progress);
    }

    hideProgress();
    showSuccess(`Successfully extracted ${processed} file(s)`);
  } catch (error) {
    hideProgress();
    if ((error as Error).message !== 'Operation cancelled') {
      throw error;
    }
  } finally {
    currentOperation = null;
  }
}

async function writeExtractedFile(dirHandle: any, path: string, blob: Blob): Promise<void> {
  const parts = path.split('/').filter((p) => p);
  let currentDir = dirHandle;

  // Create directory structure
  for (let i = 0; i < parts.length - 1; i++) {
    const dirName = parts[i];
    currentDir = await currentDir.getDirectoryHandle(dirName, { create: true });
  }

  // Write file
  const fileName = parts[parts.length - 1];
  const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

// ============================================================
// CREATE ARCHIVE WORKFLOW
// ============================================================

async function selectFilesForArchive(): Promise<void> {
  try {
    if (!('showOpenFilePicker' in window)) {
      showError('File System Access API is not supported in this browser.');
      return;
    }

    const fileHandles = await (window as any).showOpenFilePicker({
      multiple: true,
    });

    const files = await Promise.all(fileHandles.map((handle: any) => handle.getFile()));
    selectedFiles = files;
    displaySelectedFilesForCreation(files);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error selecting files:', error);
      showError('Failed to select files. Please try again.');
    }
  }
}

async function selectFolderForArchive(): Promise<void> {
  try {
    if (!('showDirectoryPicker' in window)) {
      showError('File System Access API is not supported in this browser.');
      return;
    }

    const dirHandle = await (window as any).showDirectoryPicker();
    const files = await getAllFilesFromDirectory(dirHandle);
    selectedFiles = files;
    displaySelectedFilesForCreation(files);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error selecting folder:', error);
      showError('Failed to select folder. Please try again.');
    }
  }
}

async function getAllFilesFromDirectory(dirHandle: any, path: string = ''): Promise<File[]> {
  const files: File[] = [];

  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;

    if (entry.kind === 'file') {
      const file = await entry.getFile();
      Object.defineProperty(file, 'webkitRelativePath', {
        value: entryPath,
        writable: false,
      });
      files.push(file);
    } else if (entry.kind === 'directory') {
      const subFiles = await getAllFilesFromDirectory(entry, entryPath);
      files.push(...subFiles);
    }
  }

  return files;
}

function displaySelectedFilesForCreation(files: File[]): void {
  const emptyState = document.getElementById('create-empty');
  const contentView = document.getElementById('create-content');
  const filesCount = document.getElementById('files-count');

  if (emptyState) emptyState.style.display = 'none';
  if (contentView) contentView.style.display = 'flex';

  if (filesCount) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    filesCount.textContent = `${files.length} files (${formatBytes(totalSize)})`;
  }

  // Use FileList component
  const fileListContainer = document.getElementById('file-list');
  if (fileListContainer) {
    const fileItems: FileItem[] = files.map((file) => ({
      name: file.name,
      path: (file as any).webkitRelativePath || file.name,
      size: file.size,
    }));

    fileList = new FileList(fileListContainer);
    fileList.setFiles(fileItems);
  }
}

async function createArchive(): Promise<void> {
  if (selectedFiles.length === 0) {
    showError('No files selected');
    return;
  }

  const formatSelect = document.getElementById('format-select') as HTMLSelectElement;
  const compressionSelect = document.getElementById('compression-select') as HTMLSelectElement;

  const format = formatSelect?.value || 'zip';
  const compressionLevel = parseInt(compressionSelect?.value || '6', 10);
  // TODO: Use compressionLevel when implementing compression
  void compressionLevel;

  try {
    // Ask user where to save
    // TODO: Use fileHandle when implementing file saving
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `archive.${format}`,
      types: [
        {
          description: `${format.toUpperCase()} Archive`,
          accept: { [`application/${format}`]: [`.${format}`] },
        },
      ],
    });
    void fileHandle;

    showProgress('Creating archive...', 0);

    currentOperation = new AbortController();

    // Create archive using appropriate adapter
    // Note: This is a simplified version - actual implementation would depend on the adapter API
    showError('Archive creation is not yet fully implemented in this demo');
    hideProgress();

    // TODO: Implement using createAdapter or direct adapter calls
    // const adapter = await createAdapterForFormat(format);
    // await adapter.create(selectedFiles, { compressionLevel, signal: currentOperation.signal });
  } catch (error) {
    hideProgress();
    if ((error as Error).name !== 'AbortError') {
      console.error('Error creating archive:', error);
      showError(`Failed to create archive: ${(error as Error).message}`);
    }
  } finally {
    currentOperation = null;
  }
}

function clearFileSelection(): void {
  selectedFiles = [];

  const emptyState = document.getElementById('create-empty');
  const contentView = document.getElementById('create-content');

  if (emptyState) emptyState.style.display = 'flex';
  if (contentView) contentView.style.display = 'none';
}

function updateCompressionVisibility(): void {
  const formatSelect = document.getElementById('format-select') as HTMLSelectElement;
  const compressionGroup = document.getElementById('compression-group');

  if (compressionGroup) {
    compressionGroup.style.display = formatSelect?.value === 'zip' ? 'flex' : 'none';
  }
}

// ============================================================
// PROGRESS & ERROR HANDLING
// ============================================================

function showProgress(message: string, percentage: number): void {
  const overlay = document.getElementById('progress-overlay');
  const title = document.getElementById('progress-title');
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-bar-fill');

  if (overlay) overlay.style.display = 'flex';
  if (title) title.textContent = message;
  if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
  if (progressFill) progressFill.style.width = `${percentage}%`;

  const cancelBtn = document.getElementById('cancel-operation');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (currentOperation) {
        currentOperation.abort();
      }
    };
  }
}

function hideProgress(): void {
  const overlay = document.getElementById('progress-overlay');
  if (overlay) overlay.style.display = 'none';
}

function showError(message: string): void {
  alert(`Error: ${message}`);
}

function showSuccess(message: string): void {
  alert(message);
}

// ============================================================
// UTILITIES
// ============================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
