/**
 * ZipKit Workspace
 * Full-featured interface for archive operations
 */

type Mode = 'open' | 'create';

let currentMode: Mode = 'open';

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
  currentMode = mode;

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

  extractAllBtn?.addEventListener('click', () => {
    showNotImplemented('Extract All');
  });

  extractSelectedBtn?.addEventListener('click', () => {
    showNotImplemented('Extract Selected');
  });
}

function setupCreateView(): void {
  const selectFilesBtn = document.getElementById('select-files');
  const selectFolderBtn = document.getElementById('select-folder');
  const createArchiveBtn = document.getElementById('create-archive-btn');
  const clearSelectionBtn = document.getElementById('clear-selection');
  const formatSelect = document.getElementById('format-select') as HTMLSelectElement;

  selectFilesBtn?.addEventListener('click', async () => {
    await selectFiles();
  });

  selectFolderBtn?.addEventListener('click', async () => {
    await selectFolder();
  });

  createArchiveBtn?.addEventListener('click', () => {
    showNotImplemented('Create Archive');
  });

  clearSelectionBtn?.addEventListener('click', () => {
    clearFileSelection();
  });

  formatSelect?.addEventListener('change', () => {
    updateCompressionVisibility();
  });
}

async function selectArchive(): Promise<void> {
  try {
    if (!('showOpenFilePicker' in window)) {
      alert('File System Access API is not supported in this browser.');
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
    displayArchiveContent(file);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error selecting archive:', error);
      alert('Failed to select archive. Please try again.');
    }
  }
}

function displayArchiveContent(file: File): void {
  const emptyState = document.getElementById('open-empty');
  const contentView = document.getElementById('open-content');
  const archiveName = document.getElementById('archive-name');
  const archiveSize = document.getElementById('archive-size');

  if (emptyState) emptyState.style.display = 'none';
  if (contentView) contentView.style.display = 'flex';

  if (archiveName) archiveName.textContent = file.name;
  if (archiveSize) archiveSize.textContent = formatBytes(file.size);

  showPlaceholderMessage('Archive inspection will be implemented in Issue #13');
}

function closeArchive(): void {
  const emptyState = document.getElementById('open-empty');
  const contentView = document.getElementById('open-content');

  if (emptyState) emptyState.style.display = 'flex';
  if (contentView) contentView.style.display = 'none';
}

async function selectFiles(): Promise<void> {
  try {
    if (!('showOpenFilePicker' in window)) {
      alert('File System Access API is not supported in this browser.');
      return;
    }

    const fileHandles = await (window as any).showOpenFilePicker({
      multiple: true,
    });

    const files = await Promise.all(fileHandles.map((handle: any) => handle.getFile()));
    displaySelectedFiles(files);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error selecting files:', error);
      alert('Failed to select files. Please try again.');
    }
  }
}

async function selectFolder(): Promise<void> {
  try {
    if (!('showDirectoryPicker' in window)) {
      alert('File System Access API is not supported in this browser.');
      return;
    }

    const dirHandle = await (window as any).showDirectoryPicker();
    const files = await getAllFilesFromDirectory(dirHandle);
    displaySelectedFiles(files);
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error selecting folder:', error);
      alert('Failed to select folder. Please try again.');
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

function displaySelectedFiles(files: File[]): void {
  const emptyState = document.getElementById('create-empty');
  const contentView = document.getElementById('create-content');
  const filesCount = document.getElementById('files-count');
  const fileList = document.getElementById('file-list');

  if (emptyState) emptyState.style.display = 'none';
  if (contentView) contentView.style.display = 'flex';

  if (filesCount) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    filesCount.textContent = `${files.length} files (${formatBytes(totalSize)})`;
  }

  if (fileList) {
    fileList.innerHTML = '';
    files.forEach((file) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.style.cssText =
        'padding: 8px 12px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;';

      const info = document.createElement('div');
      info.innerHTML = `
        <div style="font-size: 14px; font-weight: 500;">${file.webkitRelativePath || file.name}</div>
        <div style="font-size: 12px; color: #6b7280;">${formatBytes(file.size)}</div>
      `;

      item.appendChild(info);
      fileList.appendChild(item);
    });
  }
}

function clearFileSelection(): void {
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function showPlaceholderMessage(message: string): void {
  const fileTree = document.getElementById('file-tree');
  if (fileTree) {
    fileTree.innerHTML = `
      <div style="padding: 24px; text-align: center; color: #6b7280;">
        ${message}
      </div>
    `;
  }
}

function showNotImplemented(feature: string): void {
  alert(`${feature} will be implemented in upcoming issues.`);
}
