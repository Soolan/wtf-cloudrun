import {effect, inject, Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {PlaybookStats, TopicWithId, WtfQuery} from '@shared/interfaces';
import {CompanyService, CrudService, LayoutVisibilityService, PlaybookService} from '@shared/services';
import {PLAYBOOK_TOPICS, STATS_DOC} from '@shared/constants';

@Injectable({providedIn: 'root'})
export class TopicTree {
  private crud = inject(CrudService);
  private companyService = inject(CompanyService);
  private playbookService = inject(PlaybookService);

  dataMap = new Map<TopicWithId, TopicWithId[]>();
  chapters: TopicWithId[] = [];
  chaptersChange = new BehaviorSubject<TopicWithId[]>([]); // Notify changes to chapters

  constructor(private layoutService: LayoutVisibilityService) {
    effect(() => {
      if (this.layoutService.headerIsReady()) this.initializeTree();
    });
  }

  initializeTree(): void {
    const q: WtfQuery = { ...PLAYBOOK_TOPICS };
    q.path = `${this.companyService.path()}/${this.companyService.id()}/${PLAYBOOK_TOPICS.path}`;

    this.crud.getStream(q, true)?.subscribe((docs: any) => {
      const index = docs.findIndex((doc: any) => doc.id === STATS_DOC);
      if (index !== -1) {
        this.playbookService.stats.set(docs[index]);
        docs.splice(index, 1); // remove from the array
      }

      this.buildTree(docs);
      this.chaptersChange.next(this.chapters); // Emit updated chapters
    });
  }

  buildTree(docs: TopicWithId[]) {
    // Temporary map to group topics by their parentId
    const groupedByParent = new Map<string | "", TopicWithId[]>();

    // Populate the grouping map
    docs.forEach(doc => {
      const parentId = doc.parentId || "";
      if (!groupedByParent.has(parentId)) {
        groupedByParent.set(parentId, []);
      }
      groupedByParent.get(parentId)!.push(doc);
    });

    // Sort topics within each group by the `order` field
    groupedByParent.forEach((group) => {
      group.sort((a, b) => a.order - b.order);
    });

    // Build the dataMap and chapters
    docs.forEach(doc => {
      // Set children in the dataMap
      this.dataMap.set(doc, groupedByParent.get(doc.id) || []);
    });

    // Identify top-level chapters
    this.chapters = groupedByParent.get("") || [];
  }

  getChildren(topic: TopicWithId): TopicWithId[] | undefined {
    // return this.dataMap.get(topic);
    const children = this.dataMap.get(topic);
    // console.log(`[getChildren] ${topic?.title}:`, children);
    return children;
  }

  isExpandable(topic: TopicWithId): boolean {
    const children = this.dataMap.get(topic);
    return Array.isArray(children) && children.length > 0;
  }

  getParent(topic: TopicWithId): TopicWithId | null {
    for (const [parent, children] of this.dataMap.entries()) {
      if (children.some(child => child.id === topic.id)) return parent;
    }
    return null;
  }

  private calculateOrder(index: number, siblings: TopicWithId[]): number {
    if (index === 0) {
      return siblings[1]?.order ? Math.floor(siblings[1].order / 2) : 1000;
    } else if (index === siblings.length) {
      return siblings[index - 1].order + 1000;
    }
    return Math.floor((siblings[index - 1].order + siblings[index].order) / 2);
  }
}
