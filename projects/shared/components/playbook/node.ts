// Represents topics as (nested) nodes inside the Material Tree
import {signal} from "@angular/core";
import {TopicWithId} from '@shared/interfaces';

export class TopicNode {
  expanded = false;
  confirmDelete = signal(false);

  constructor(
    public topic: TopicWithId,
    public level = 1,
    public expandable = false,
    public isLoading = signal(false),
    public children: TopicNode[] = [] // ✅ Add children
  ) {}

  isExpanded() {
    return this.expanded;
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  showConfirm() {
    this.confirmDelete.set(true);
  }

  hideConfirm() {
    this.confirmDelete.set(false);
  }
}


