/**
 * AlertBox
 * Displays security warnings with details
 */

import type { SecurityIssue, RiskLevel } from '@zipkit/archive-security';

export class AlertBox {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(issues: SecurityIssue[]): void {
    this.container.innerHTML = '';

    if (issues.length === 0) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';
    this.container.className = 'alert-box';

    // Group issues by risk level
    const groupedIssues = this.groupIssuesByRisk(issues);

    for (const [riskLevel, riskIssues] of groupedIssues) {
      const alert = this.createAlert(riskLevel, riskIssues);
      this.container.appendChild(alert);
    }
  }

  private groupIssuesByRisk(issues: SecurityIssue[]): Map<RiskLevel, SecurityIssue[]> {
    const grouped = new Map<RiskLevel, SecurityIssue[]>();
    const riskOrder: RiskLevel[] = ['danger', 'warning', 'safe'];

    for (const riskLevel of riskOrder) {
      const filtered = issues.filter((issue) => issue.severity === riskLevel);
      if (filtered.length > 0) {
        grouped.set(riskLevel, filtered);
      }
    }

    return grouped;
  }

  private createAlert(riskLevel: RiskLevel, issues: SecurityIssue[]): HTMLElement {
    const alert = document.createElement('div');
    alert.className = `alert alert-${riskLevel}`;

    const header = document.createElement('div');
    header.className = 'alert-header';

    const icon = document.createElement('span');
    icon.className = 'alert-icon';
    icon.textContent = this.getIconForRiskLevel(riskLevel);

    const title = document.createElement('span');
    title.className = 'alert-title';
    title.textContent = `${this.getRiskLevelText(riskLevel)} (${issues.length})`;

    header.appendChild(icon);
    header.appendChild(title);
    alert.appendChild(header);

    // Issue list
    const list = document.createElement('ul');
    list.className = 'alert-list';

    for (const issue of issues) {
      const item = document.createElement('li');
      item.className = 'alert-item';

      const itemTitle = document.createElement('div');
      itemTitle.className = 'alert-item-title';
      itemTitle.textContent = issue.message;

      item.appendChild(itemTitle);

      if (issue.details) {
        const details = document.createElement('div');
        details.className = 'alert-item-details';
        details.textContent = JSON.stringify(issue.details);
        item.appendChild(details);
      }

      // Show affected entry
      const entryDiv = document.createElement('div');
      entryDiv.className = 'alert-item-files';
      entryDiv.textContent = `File: ${issue.entry}`;
      item.appendChild(entryDiv);

      list.appendChild(item);
    }

    alert.appendChild(list);

    return alert;
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

  private getRiskLevelText(riskLevel: RiskLevel): string {
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) + ' Issues';
  }

  public clear(): void {
    this.container.innerHTML = '';
    this.container.style.display = 'none';
  }
}
