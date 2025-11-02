import {Component, effect, inject, OnInit} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ReactiveFormsModule} from '@angular/forms';
import {Entity, Topic, TopicWithId} from '@shared/interfaces';
import {
  CompanyService,
  CrudService,
  FunctionsService, LayoutVisibilityService, PlaybookService, ProfileService,
  TeamService
} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {KNOWLEDGE_BASES, MEMBERS, NEW_TOPIC, PLAYBOOK_TOPICS, TOPIC} from '@shared/constants';
import {TopicStatus} from '@shared/enums';
import {TopicFormService} from '@shared/forms';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatInput} from '@angular/material/input';
import {MatChipGrid, MatChipInput, MatChipRemove, MatChipRow} from '@angular/material/chips';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {StorageUrlPipe} from '@shared/pipes';

@Component({
  selector: 'lib-topic',
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatHint,
    MatSelect,
    MatOption,
    NgForOf,
    MatIcon,
    MatTooltip,
    MatButton,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatInput,
    MatChipGrid,
    CdkDropList,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
    DatePipe,
    CdkDrag,
    RouterLink,
    DatePipe,
    StorageUrlPipe,
    AsyncPipe
  ],
  templateUrl: './topic.component.html',
  standalone: true,
  styleUrl: './topic.component.scss'
})
export class TopicComponent implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  topic!: TopicWithId | null;
  id!: string;
  tags: string[] = [];
  generating = false;
  playbookPath!: string;
  kbPath!: string;
  membersPath!: string;
  rules: any = {
    generate: 'Knowledge base is the AI friendly version of this topic. Provide contents (min 100 chars) to activate the generate-topic button.',
    regenerate: 'Make changes to title or contents to activate the regenerate button.',
  };
  team!: Entity[];

  private layoutService = inject(LayoutVisibilityService);
  private topicFormService = inject(TopicFormService);
  protected playbookService = inject(PlaybookService);
  private companyService = inject(CompanyService);
  private profileService = inject(ProfileService);
  private functions = inject(FunctionsService);
  private teamService = inject(TeamService);
  private route = inject(ActivatedRoute);
  private snackbar = inject(MatSnackBar);
  private crud = inject(CrudService);

  // Convert queryParams Observable to a signal (Angular 19+)
  queryParams = toSignal(this.route.queryParams);

  order = this.queryParams()?.['order'];
  department = this.queryParams()?.['department'];
  parentId = this.queryParams()?.['parentId'];

  constructor() {
    this.id = this.route.snapshot.paramMap.get('topicId') || '';
    if (!this.id) return;
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        const path = `${this.companyService.path()}/${this.companyService.id()}`
        this.playbookPath = `${path}/${PLAYBOOK_TOPICS.path}`;
        this.kbPath = `${path}/${KNOWLEDGE_BASES.path}`;
        this.membersPath = `${path}/${MEMBERS.path}`;
        await this.initTopic();
        this.initTeam();
      }
    });
  }

  ngOnInit() {
  }

  async initTopic() {
    this.topicForm.reset();
    this.topic = (this.id === NEW_TOPIC) ?
      this.newTopic:
      this.playbookService.topic() ?? await this.fetchTopic();
    this.topicForm.patchValue(this.topic);
    this.tags = this.topicForm.get('tags')?.value;
  }

  initTeam() {
    this.teamService.initMembers(this.membersPath).then(_ => {
      this.team = this.teamService.everyOne().map(member => member.persona);
      if (!this.playbookService.department()) {
        const id = this.topic?.creator?.role;
        const department = id ? this.teamService.getDepByMemberId(id) : 'To be decided';
        this.playbookService.department.set(department);
      }

      console.log(this.team);
    })
  }

  async fetchTopic(): Promise<TopicWithId> {
    return await this.crud.getDoc(this.playbookPath, this.id);
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
      this.topicForm.get('tags')?.setValue(this.tags);
    }
    event.chipInput!.clear(); // Clear the input value
  }

  deleteTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) this.tags.splice(index, 1);
    this.topicForm.get('tags')?.setValue(this.tags);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tags, event.previousIndex, event.currentIndex);
  }

  async save() {
    const data: Topic = this.topicForm.value;
    let action = '';
    data.timestamps.updated_at = Date.now();
    if (this.id == NEW_TOPIC) {
      data.order = this.order;
      data.parentId = this.parentId || '';
      console.log(this.playbookPath, data);
      const doc = await this.crud.add(this.playbookPath, data);
      console.log(doc, doc?.id)
      action = 'added';
    } else {
      await this.crud.update(this.playbookPath, this.id, data);
      action = 'updated';
    }
    this.snackbar.open(`Topic ${action} successfully!`, 'X', {duration: 2000});
  }

  setCreator(id: string): void {
    const creator = this.team.find(member => member.role === id);
    console.log(creator);
    this.topicForm.get('creator')?.setValue(creator);
  }

  generateKb(regenerate: boolean = false) {
    this.snackbar.open('Calling kb generator...', 'X', {duration: 4000});
    const data = {
      kbId: regenerate ? this.topic?.kbId : '',
      kbPath: this.kbPath,
      topicId: this.id,
      topicPath: this.playbookPath
    };
    this.save().then(_ => {
      this.generating = true;
      this.functions.call('genKbFlow', data).then((response: any) => {
        this.generating = false;
        const message = (response.success && response.id)?
          'Knowledge base generated successfully.':
          'Please try again.';
        this.snackbar.open(message, 'X', {duration: 3500});
      }).catch((error: any) => {
        this.generating = false;
        this.snackbar.open(error, 'X', {duration: 4000});
      });
    })
  }

  get hasKbId(): boolean {
    return this.id !== NEW_TOPIC && !!this.topic?.kbId;
  }

  get canGenerateKb(): boolean {
    return this.topicForm.get('fullText')?.value !== '' &&
      this.topicForm.get('fullText')?.value?.length > 100;
  }

  get newTopic(): TopicWithId {
    const data: TopicWithId = {id: '', ...TOPIC};
    data.creator = {
      role: this.profileService.profileId(),
      name: this.profileService.displayName(),
      avatar: this.profileService.avatar()
    }
    return data;
  }

  get topicForm() {
    return this.topicFormService.form;
  }

  protected readonly TopicStatus = TopicStatus;
}
