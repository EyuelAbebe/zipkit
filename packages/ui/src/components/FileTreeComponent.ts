/**
 * FileTreeComponent
 * Displays archive contents in a collapsible tree structure
 */

import type { ArchiveEntry } from '@zipkit/archive-core';

export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  children?: FileTreeNode[];
  entry?: ArchiveEntry;
}

export class FileTreeComponent {
  private container: HTMLElement;
  private root: FileTreeNode;
  private selectedPaths: Set<string> = new Set();
  private onSelectionChange?: (selectedPaths: string[]) => void;

  constructor(container: HTMLElement, entries: ArchiveEntry[]) {
    this.container = container;
    this.root = this.buildTree(entries);
  }

  private buildTree(entries: ArchiveEntry[]): FileTreeNode {
    const root: FileTreeNode = {
      name: 'root',
      path: '',
      isDirectory: true,
      children: [],
    };

    const nodeMap = new Map<string, FileTreeNode>();
    nodeMap.set('', root);

    // Sort entries so directories come first
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.path.localeCompare(b.path);
    });

    for (const entry of sortedEntries) {
      const parts = entry.path.split('/').filter((p) => p);
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]!;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const isLastPart = i === parts.length - 1;
          const isDir = isLastPart ? entry.isDirectory : true;
          const node: FileTreeNode = {
            name: part,
            path: currentPath,
            isDirectory: isDir,
            size: isLastPart && !entry.isDirectory ? entry.size : undefined,
            children: isDir ? [] : undefined,
            entry: isLastPart ? entry : undefined,
          };

          const parentNode = nodeMap.get(parentPath);
          if (parentNode?.children) {
            parentNode.children.push(node);
          }

          nodeMap.set(currentPath, node);
        }
      }
    }

    return root;
  }

  public render(): void {
    this.container.innerHTML = '';
    this.container.className = 'file-tree';

    if (this.root.children && this.root.children.length > 0) {
      const ul = this.renderNode(this.root, 0);
      this.container.appendChild(ul);
    } else {
      this.container.innerHTML = '<div class="empty-state">No files in archive</div>';
    }
  }

  private renderNode(node: FileTreeNode, depth: number): HTMLElement {
    const ul = document.createElement('ul');
    ul.className = 'tree-level';

    const children = node.children || [];
    for (const child of children) {
      const li = document.createElement('li');
      li.className = 'tree-node';
      li.dataset.path = child.path;

      const nodeContent = document.createElement('div');
      nodeContent.className = 'node-content';
      nodeContent.style.paddingLeft = `${depth * 16}px`;

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'node-checkbox';
      checkbox.checked = this.selectedPaths.has(child.path);
      checkbox.addEventListener('change', () => this.handleCheckboxChange(child.path, checkbox.checked));

      // Icon
      const icon = document.createElement('span');
      icon.className = 'node-icon';
      icon.textContent = child.isDirectory ? '📁' : '📄';

      // Name
      const name = document.createElement('span');
      name.className = 'node-name';
      name.textContent = child.name;

      // Size
      const size = document.createElement('span');
      size.className = 'node-size';
      if (child.size !== undefined) {
        size.textContent = this.formatBytes(child.size);
      }

      nodeContent.appendChild(checkbox);
      nodeContent.appendChild(icon);
      nodeContent.appendChild(name);
      nodeContent.appendChild(size);

      li.appendChild(nodeContent);

      // Recursively render children
      if (child.children && child.children.length > 0) {
        const childUl = this.renderNode(child, depth + 1);
        li.appendChild(childUl);

        // Toggle functionality
        nodeContent.addEventListener('click', (e) => {
          if (e.target !== checkbox) {
            li.classList.toggle('collapsed');
          }
        });
      }

      ul.appendChild(li);
    }

    return ul;
  }

  private handleCheckboxChange(path: string, checked: boolean): void {
    if (checked) {
      this.selectedPaths.add(path);
    } else {
      this.selectedPaths.delete(path);
    }

    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedPaths));
    }
  }

  public setSelectionChangeHandler(handler: (selectedPaths: string[]) => void): void {
    this.onSelectionChange = handler;
  }

  public getSelectedPaths(): string[] {
    return Array.from(this.selectedPaths);
  }

  public selectAll(): void {
    this.selectedPaths.clear();
    this.collectAllPaths(this.root);
    this.render();
    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedPaths));
    }
  }

  private collectAllPaths(node: FileTreeNode): void {
    if (node.path && !node.isDirectory) {
      this.selectedPaths.add(node.path);
    }
    if (node.children) {
      for (const child of node.children) {
        this.collectAllPaths(child);
      }
    }
  }

  public clearSelection(): void {
    this.selectedPaths.clear();
    this.render();
    if (this.onSelectionChange) {
      this.onSelectionChange([]);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
