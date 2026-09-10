/**
 * Button
 * Styled button component with loading and disabled states
 */

export interface ButtonOptions {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

export class Button {
  private element: HTMLButtonElement;
  private options: ButtonOptions;
  private isLoading = false;

  constructor(options: ButtonOptions) {
    this.options = options;
    this.element = document.createElement('button');
    this.initialize();
  }

  private initialize(): void {
    this.element.className = `button button-${this.options.variant || 'primary'}`;
    this.element.textContent = this.options.text;
    this.element.disabled = this.options.disabled || false;

    if (this.options.onClick) {
      this.element.addEventListener('click', async () => {
        if (this.isLoading || this.element.disabled) return;

        try {
          this.setLoading(true);
          await this.options.onClick!();
        } catch (error) {
          console.error('Button click error:', error);
        } finally {
          this.setLoading(false);
        }
      });
    }
  }

  public setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.element.disabled = loading || this.options.disabled || false;

    if (loading) {
      this.element.classList.add('loading');
      this.element.textContent = 'Loading...';
    } else {
      this.element.classList.remove('loading');
      this.element.textContent = this.options.text;
    }
  }

  public setDisabled(disabled: boolean): void {
    this.options.disabled = disabled;
    this.element.disabled = disabled;
  }

  public setText(text: string): void {
    this.options.text = text;
    if (!this.isLoading) {
      this.element.textContent = text;
    }
  }

  public getElement(): HTMLButtonElement {
    return this.element;
  }
}
