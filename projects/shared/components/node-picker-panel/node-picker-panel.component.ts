import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BpaNode, NodeCategory } from '@shared/interfaces';
import { BpaNodeType, ProcessNodeStatus } from '@shared/enums';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AVAILABLE_BPA_NODES } from '@shared/constants';

@Component({
  selector: 'lib-node-picker-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './node-picker-panel.component.html',
  styleUrls: ['./node-picker-panel.component.scss'],
})
export class NodePickerPanelComponent {
  @Output() closePanel = new EventEmitter<void>();
  @Output() nodeSelected = new EventEmitter<BpaNode>();

  categories: NodeCategory[] = [
    { name: 'AI', description: 'Automate tasks, generate files.', icon: 'smart_toy', tag: 'ai' },
    { name: 'App', description: 'Connect to apps and APIs.', icon: 'apps', tag: 'app' },
    { name: 'Data', description: 'Query, filter, or convert data.', icon: 'edit_note', tag: 'data' },
    { name: 'Flow', description: 'Manage the execution flow.', icon: 'alt_route', tag: 'flow' },
    { name: 'Core', description: 'Run code, HTTP requests, webhooks.', icon: 'code', tag: 'core' },
    { name: 'Notify', description: 'Notify & wait for human input.', icon: 'notifications', tag: 'notify' }
  ];

  triggerCategory: NodeCategory = {
    name: 'Trigger',
    description: 'Trigger the workflow using 2nd event.',
    icon: 'bolt',
    tag: 'trigger'
  };

  allNodes: BpaNode[] = AVAILABLE_BPA_NODES;

  view: 'categories' | 'nodes' = 'categories';
  searchTerm = '';
  selectedCategory: NodeCategory | null = null;
  filteredNodes: BpaNode[] = [];

  onClose(): void {
    this.closePanel.emit();
  }

  onCategoryClick(category: NodeCategory): void {
    this.selectedCategory = category;
    this.view = 'nodes';
    this.filterNodes();
  }

  onBack(): void {
    this.view = 'categories';
    this.selectedCategory = null;
    this.searchTerm = '';
  }

  onSearch(): void {
    this.view = 'nodes';
    this.selectedCategory = null; // search across all categories
    this.filterNodes();

    if (!this.searchTerm) {
      this.onBack();
    }
  }

  filterNodes(): void {
    let nodes = this.allNodes;

    if (this.selectedCategory) {
      nodes = nodes.filter(node => node.categoryTag === this.selectedCategory!.tag);
    }

    if (this.searchTerm) {
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      nodes = nodes.filter(node =>
        node.name.toLowerCase().includes(lowerCaseSearch) ||
        (node.description && node.description.toLowerCase().includes(lowerCaseSearch))
      );
    }

    this.filteredNodes = nodes;
  }

  onNodeSelect(node: BpaNode): void {
    this.nodeSelected.emit(node);
  }
}
