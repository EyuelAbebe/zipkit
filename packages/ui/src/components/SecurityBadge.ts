/**
 * SecurityBadge
 * Shows risk level with icon and color
 */

import type { RiskLevel } from '@zipkit/archive-security';

export class SecurityBadge {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(riskLevel: RiskLevel, issueCount: number): void {
    this.container.innerHTML = '';
    this.container.className = `security-badge risk-${riskLevel}`;

    const icon = document.createElement('span');
    icon.className = 'badge-icon';
    icon.textContent = this.getIconForRiskLevel(riskLevel);

    const label = document.createElement('span');
    label.className = 'badge-label';
    label.textContent = this.getLabelForRiskLevel(riskLevel, issueCount);

    this.container.appendChild(icon);
    this.container.appendChild(label);
  }

  private getIconForRiskLevel(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'danger':
        return '🛑';
      case 'warning':
        return '⚠️';
      case 'safe':
        return '✅';
      default:
        return '❓';
    }
  }

  private getLabelForRiskLevel(riskLevel: RiskLevel, issueCount: number): string {
    if (riskLevel === 'safe') {
      return 'Safe';
    }

    const levelText = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    const issueText = issueCount === 1 ? 'issue' : 'issues';
    return `${levelText} (${issueCount} ${issueText})`;
  }

  public clear(): void {
    this.container.innerHTML = '';
    this.container.className = 'security-badge';
  }
}
