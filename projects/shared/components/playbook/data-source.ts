import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {BehaviorSubject, merge, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {TopicNode} from "./node";
import {TopicTree} from "./tree";

export class PlaybookDataSource implements DataSource<TopicNode> {
  dataChange = new BehaviorSubject<TopicNode[]>([]);
  constructor(
    private topicTree: TopicTree,
    private childrenAccessor: (node: TopicNode) => TopicNode[],
  ) {
  }

  connect(collectionViewer: CollectionViewer): Observable<TopicNode[]> {
    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(): void {
  }

  toggleNode(node: TopicNode, expand: boolean) {
    const children = this.topicTree.getChildren(node.topic);

    const index = this.data.indexOf(node);
    if (!children || index < 0) return;
    node.isLoading.set(true);

    setTimeout(() => {
      if (expand) {
        const nodes: TopicNode[] = children.map(child => new TopicNode(
          child,
          node.level + 1,
          !!this.topicTree.getChildren(child)?.length
        ));
        this.data.splice(index + 1, 0, ...nodes);
      } else {
        const count = this.data.slice(index + 1).findIndex(n => n.level <= node.level);
        this.data.splice(index + 1, count === -1 ? this.data.length - (index + 1) : count);
      }

      this.dataChange.next(this.data);
      node.isLoading.set(false);
    }, 100);
  }

  refreshTree() {
    this.dataChange.next(this.data);
  }

  get data(): TopicNode[] {
    return this.dataChange.value;
  }

  set data(value: TopicNode[]) {
    this.dataChange.next(value);
  }
}
