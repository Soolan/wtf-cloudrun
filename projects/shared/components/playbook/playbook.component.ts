import {Component, effect, inject, signal} from '@angular/core';
import {Entity, MemberWithId, PlaybookStats, TopicWithId} from '@shared/interfaces';
import {
  CompanyService,
  CrudService,
  DialogConfigService,
  LayoutVisibilityService,
  PlaybookService, ProfileService
} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TopicNode} from '@shared/components/playbook/node';
import {PlaybookDataSource} from '@shared/components/playbook/data-source';
import {TopicTree} from '@shared/components/playbook/tree';
import {ProgressType, TopicAction, TopicStatus} from '@shared/enums';
import {KNOWLEDGE_BASES, NEW_TOPIC, PLAYBOOK_TOPICS} from '@shared/constants';
import {CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTreeModule} from '@angular/material/tree';
import {LoadingComponent} from '@shared/components';
import {TopicDetailsComponent} from '@shared/components/playbook/topic-details/topic-details.component';
import {RouterLink} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {GenerateTopicComponent} from '@shared/dialogs/generate-topic/generate-topic.component';
import {PlaybookMaintainerComponent} from '@shared/dialogs/playbook-maintainer/playbook-maintainer.component';

@Component({
  selector: 'lib-playbook',
  imports: [
    CdkDrag,
    CdkDropList,
    LoadingComponent,
    MatButton,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatTreeModule,
    TopicDetailsComponent,
    CdkDragPlaceholder,
    MatMenuTrigger,
    RouterLink
  ],
  templateUrl: './playbook.component.html',
  standalone: true,
  styleUrl: './playbook.component.scss'
})
export class PlaybookComponent {
  childrenAccessor = (node: TopicNode) => node.children ?? [];
  dataSource!: PlaybookDataSource;
  topicTree = inject(TopicTree);
  getLevel = (node: TopicNode) => node.level;
  isExpandable = (node: TopicNode) => node.expandable;
  selectedNode!: TopicWithId; // To track the right-clicked node
  selectedIndex: number = 0;
  selectedDepartment = '';
  isUpdating: boolean = false; // Add this property to your component
  order = 0;
  parentId: string = '';
  hasChild = (_: number, node: TopicNode) => node.expandable;
  path!: string;
  confirm = false; // Array to track confirmation states
  generateDialogConfig: MatDialogConfig = {};

  private dialog = inject(MatDialog);
  private crud = inject(CrudService);
  private snackbar = inject(MatSnackBar);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  protected playbookService = inject(PlaybookService);
  private configService = inject(DialogConfigService);
  public layoutService = inject(LayoutVisibilityService);

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        this.path = `${this.companyService.path()}/${this.companyService.id()}/${PLAYBOOK_TOPICS.path}`;
        this.dataSource = new PlaybookDataSource(this.topicTree, this.childrenAccessor);
        this.generateDialogConfig = {...this.configService.getConfig()};

        this.topicTree.chaptersChange.subscribe((chapters) => {
          this.dataSource.data = chapters.map(chapter => new TopicNode(
            chapter,
            0,
            this.topicTree.isExpandable(chapter),
            signal(false),
            [] // Empty init; we’ll load children later
          ));
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<TopicNode[]>) {
    this.isUpdating = true;
    const draggedNode = event.item.data as TopicNode; // Dragged node
    const siblings = event.container.data as TopicNode[]; // Nodes in the same parent
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    const isHigher = event.previousIndex < event.currentIndex;

    // Early return if the item is dropped in the same position or not valid
    if (previousIndex === currentIndex || !draggedNode || !siblings || currentIndex === undefined) {
      this.isUpdating = false;
      return;
    }

    // Calculate new order
    const newOrder = this.getOrder(currentIndex, siblings, isHigher);

    // Update Firestore with the new order
    this.updateOrderInFirestore(draggedNode.topic.id, newOrder)
      .then(_ => {
        // Reorder the siblings array
        moveItemInArray(siblings, previousIndex, currentIndex);
        this.snackbar.open(`Topic order updated`, 'X', {duration: 2000});
        this.isUpdating = false;
      });
  }

  private getOrder(currentIndex: number, siblings: TopicNode[], isHigher: boolean) {
    let newOrder: number;
    if (currentIndex === 0) {
      // If it's the first item, give it an order less than the second item
      newOrder = siblings[currentIndex]?.topic.order
        ? Math.floor(siblings[currentIndex].topic.order / 2)
        : 1000; // Default to 1000 if no siblings
    } else if (currentIndex === siblings.length - 1) {
      // If it's the last item, give it an order greater than the second-to-last item
      newOrder = siblings[currentIndex].topic.order + 1000;
    } else {
      // Otherwise, place it between the previous and next items
      newOrder = isHigher ?
        Math.floor((siblings[currentIndex].topic.order + siblings[currentIndex + 1].topic.order) / 2) :
        Math.floor((siblings[currentIndex - 1].topic.order + siblings[currentIndex].topic.order) / 2);
    }
    return newOrder;
  }

  setDepartment(topic: TopicWithId): void {
    this.selectedNode = topic;
    this.selectedDepartment = topic.title;
    this.playbookService.department.set(topic.title);
  }

  updateOrderInFirestore(topicId: string, newOrder: number): Promise<void> {
    const path = `${this.companyService.path()}/${this.companyService.id()}/${PLAYBOOK_TOPICS.path}`;
    return this.crud.update(path, topicId, {order: newOrder});
  }

  delete(id: string, kbId?: string) {
    const topicPath = `${this.companyService.path()}/${this.companyService.id()}/${PLAYBOOK_TOPICS.path}`;
    const kbPath = `${this.companyService.path()}/${this.companyService.id()}/${KNOWLEDGE_BASES.path}`;
    this.crud.delete(topicPath, id);
    if (kbId) this.crud.delete(kbPath, kbId);
    this.confirm = false;
  }

  generate() {
    const children = this.topicTree.getChildren(this.selectedNode);
    console.log(children);
    this.order = children?.length ? children[children.length-1]?.order + 1000: 2000;
    // this.getOrder()
    this.generateDialogConfig.data = {
      creator: {
        id: this.profileService.profileId(),
        name: this.profileService.displayName(),
        avatar: this.profileService.avatar()
      },
      order: this.order,
      parentId: this.selectedNode? this.selectedNode?.id: '',
      path: this.path,
    };
    this.dialog.open(GenerateTopicComponent, this.generateDialogConfig).afterClosed()
            .subscribe(response => {
        if (response.success) {
          // ToDo: open the topic in the UI using response.docId
        }
      });
  }

  toggleNode(node: TopicNode): void {
    node.toggle(); // flips internal expanded state
    this.dataSource.toggleNode(node, node.isExpanded());
  }

  get hasChildren(): boolean {
    const children = this.topicTree.getChildren(this.selectedNode);
    return !!children && children?.length > 0;
  }

  getParams(isChapter = false): any{
    if (isChapter) {
      const chapters = this.topicTree.chapters;
      this.selectedIndex = chapters.length;
      this.order = (this.selectedIndex == 0) ? 1000 : chapters[this.selectedIndex - 1].order + 1000;
    } else {
      const children = this.topicTree.getChildren(this.selectedNode as TopicWithId) || [];
      this.selectedIndex = children.length;
      this.order = (this.selectedIndex == 0) ? 1000 : children[this.selectedIndex - 1].order + 1000;
    }
    return {
      order: this.order,
      department: isChapter? '': this.selectedDepartment,
      parentId: isChapter? '': this.selectedNode?.id
    };
  }

  setMaintainer() {
    const config = {...this.configService.getConfig()};

    this.dialog.open(PlaybookMaintainerComponent, config)
      .afterClosed()
      .subscribe(async (result: MemberWithId) => {
        if (result) {
          const stats = this.updateStats(result.persona);
          await this.playbookService.updateStats(this.path, stats);
          this.snackbar.open(`${stats.maintainer.name} is our new maintainer!`, "X", {duration: 3000})
        }
      });
  }

  updateStats(persona: Entity): PlaybookStats {
    return  {
      maintainer: persona,
      timestamps: {
        created_at: this.playbookService.stats()?.timestamps.created_at || 0,
        updated_at: Date.now(),
        deleted_at: 0
      },
      total: this.playbookService.stats()?.total || 0
    }
  }

  get maintainer(): Entity | undefined {
    return this.playbookService.stats()?.maintainer;
  }

  protected readonly ProgressType = ProgressType;
  protected readonly TopicStatus = TopicStatus;
  protected readonly TopicAction = TopicAction;
  protected readonly NEW_TOPIC = NEW_TOPIC;
}
