/**
 * FileList
 * List files for creation workflow
 */

export interface FileItem {
  name: string;
  path: string;
  size: number;
}

export class FileList {
  private container: HTMLElement;
  private files: FileItem[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public setFiles(files: FileItem[]): void {
    this.files = files;
    this.render();
  }

  public addFiles(files: FileItem[]): void {
    this.files.push(...files);
    this.render();
  }

  public clear(): void {
    this.files = [];
    this.render();
  }

  public getFiles(): FileItem[] {
    return this.files;
  }

  public render(): void {
    this.container.innerHTML = '';

    if (this.files.length === 0) {
      this.container.innerHTML = '<div class="empty-state">No files selected</div>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'file-list';

    for (const file of this.files) {
      const item = document.createElement('div');
      item.className = 'file-list-item';

      const info = document.createElement('div');
      info.className = 'file-info';

      const name = document.createElement('div');
      name.className = 'file-name';
      name.textContent = file.path || file.name;

      const size = document.createElement('div');
      size.className = 'file-size';
      size.textContent = this.formatBytes(file.size);

      info.appendChild(name);
      info.appendChild(size);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'file-remove-btn';
      removeBtn.textContent = '×';
      removeBtn.title = 'Remove file';
      removeBtn.addEventListener('click', () => this.removeFile(file.path || file.name));

      item.appendChild(info);
      item.appendChild(removeBtn);

      list.appendChild(item);
    }

    this.container.appendChild(list);
  }

  private removeFile(path: string): void {
    this.files = this.files.filter((f) => (f.path || f.name) !== path);
    this.render();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
