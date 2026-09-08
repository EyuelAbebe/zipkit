/**
 * ProgressBar
 * Visual progress indicator with percentage and file name
 */

export interface ProgressBarOptions {
  showPercentage?: boolean;
  showFileName?: boolean;
  animated?: boolean;
}

export class ProgressBar {
  private container: HTMLElement;
  private progressBar: HTMLElement;
  private progressFill: HTMLElement;
  private percentageText: HTMLElement;
  private fileNameText: HTMLElement;
  private options: Required<ProgressBarOptions>;

  constructor(container: HTMLElement, options: ProgressBarOptions = {}) {
    this.container = container;
    this.options = {
      showPercentage: options.showPercentage ?? true,
      showFileName: options.showFileName ?? true,
      animated: options.animated ?? true,
    };

    this.progressBar = document.createElement('div');
    this.progressFill = document.createElement('div');
    this.percentageText = document.createElement('div');
    this.fileNameText = document.createElement('div');

    this.initialize();
  }

  private initialize(): void {
    this.container.innerHTML = '';
    this.container.className = 'progress-bar-container';

    // File name (optional)
    if (this.options.showFileName) {
      this.fileNameText.className = 'progress-filename';
      this.fileNameText.textContent = '';
      this.container.appendChild(this.fileNameText);
    }

    // Progress bar
    this.progressBar.className = 'progress-bar';
    this.progressFill.className = 'progress-fill';
    if (this.options.animated) {
      this.progressFill.classList.add('animated');
    }
    this.progressBar.appendChild(this.progressFill);
    this.container.appendChild(this.progressBar);

    // Percentage (optional)
    if (this.options.showPercentage) {
      this.percentageText.className = 'progress-percentage';
      this.percentageText.textContent = '0%';
      this.container.appendChild(this.percentageText);
    }
  }

  public update(progress: number, fileName?: string): void {
    const percentage = Math.min(100, Math.max(0, progress));

    this.progressFill.style.width = `${percentage}%`;

    if (this.options.showPercentage) {
      this.percentageText.textContent = `${Math.round(percentage)}%`;
    }

    if (this.options.showFileName && fileName) {
      this.fileNameText.textContent = fileName;
    }
  }

  public setFileName(fileName: string): void {
    if (this.options.showFileName) {
      this.fileNameText.textContent = fileName;
    }
  }

  public reset(): void {
    this.update(0);
    this.fileNameText.textContent = '';
  }

  public complete(): void {
    this.update(100);
    this.progressFill.classList.add('complete');
  }

  public error(): void {
    this.progressFill.classList.add('error');
  }

  public show(): void {
    this.container.style.display = 'block';
  }

  public hide(): void {
    this.container.style.display = 'none';
  }
}
