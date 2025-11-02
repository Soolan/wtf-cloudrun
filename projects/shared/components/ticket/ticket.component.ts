import {Component, effect, inject, OnInit, signal, ViewChild} from '@angular/core';
import {AttachmentsComponent, DiscussionsComponent, ProcessComponent, SubtasksComponent} from '@shared/components';
import {AsyncPipe, DatePipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAnchor, MatButton, MatIconButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {
  CompanyService,
  CrudService,
  LayoutVisibilityService,
  ProfileService,
  TeamService,
  TicketService
} from '@shared/services';
import {TicketFormService} from '@shared/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  DISCUSSIONS, NEW_TICKET_ID,
  RELEASE_ENTRIES_SELECT, TICKET,
  TICKET_PRIORITY_SELECT,
  TICKET_STATS,
  TICKET_STATS_ID, TICKETS
} from '@shared/constants';
import {Resource, Entity, MemberWithId, TicketStats, TicketWithId, Ticket} from '@shared/interfaces';
import {Timestamp} from '@angular/fire/firestore';
import {TicketStage} from '@shared/enums';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';
import {UrlNamePipe} from '@shared/pipes/url-name.pipe';
import {StorageUrlPipe} from '@shared/pipes';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Component({
  selector: 'app-ticket',
  imports: [
    AttachmentsComponent,
    DatePipe,
    DiscussionsComponent,
    FormsModule,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatHint,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
    MatTooltip,
    NgForOf,
    NgIf,
    ProcessComponent,
    ReactiveFormsModule,
    NgStyle,
    RouterLink,
    StorageUrlPipe,
    AsyncPipe,
    SubtasksComponent,
  ],
  templateUrl: './ticket.component.html',
  standalone: true,
  styleUrl: './ticket.component.scss'
})
export class TicketComponent {
  @ViewChild(ProcessComponent) processComponent!: ProcessComponent;

  public layoutService = inject(LayoutVisibilityService);
  protected breakpoint = inject(BreakpointObserver);
  protected formService = inject(TicketFormService);
  private companyService = inject(CompanyService);
  public profileService = inject(ProfileService);
  public ticketService = inject(TicketService);
  protected teamService = inject(TeamService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private crud = inject(CrudService);
  private router = inject(Router);

  loading = true;
  releaseEntries = RELEASE_ENTRIES_SELECT;
  priorities = TICKET_PRIORITY_SELECT;
  serial!: string;
  ticketView = new FormControl('details');
  team!: MemberWithId[];
  selectedMember!: Entity;
  currentDepartment!: string;
  maximized = false;
  stats!: TicketStats;
  deletingAttachments!: boolean[];
  parentId!: string;
  ticketId!: string;
  parentTicket!: Ticket;

  readonly subtasks = signal<TicketWithId[]>([]);
  // readonly ticketId = toSignal(this.route.paramMap.pipe(
  //   map(params => params.get('ticketId'))
  // ));

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        this.route.queryParamMap.subscribe(async params => {
          this.parentId = params.get('parentId') || '';
          if (this.parentId)
            this.parentTicket = await this.crud.getDoc(this.ticketService.path(), this.parentId);
        });

        this.route.paramMap.subscribe(async params => {
          this.ticketId = params.get('ticketId') || '';
          this.team = this.teamService.everyOne();
          this.reset();
          if (!this.ticketService.ticket()) await this.initTicket();
          this.stats = <TicketStats>this.ticketService.stats();
          if (!this.stats) await this.initStats();
          const ticket = this.ticketService.ticket();
          if (!ticket) return;
          this.patch(ticket);
          this.getSubtasks(ticket);
          this.loading = false;
        });
      }
    });
  }

  getSubtasks(ticket: TicketWithId) {
    if (!ticket.dependencies?.length) return; // no subtasks
    Promise.all(
      ticket.dependencies.map(async id => {
        const data = await this.crud.getDoc(this.ticketService.path(), id) as Ticket;
        return {id, ...data} satisfies TicketWithId;
      })
    ).then(subtasks => this.subtasks.set(subtasks));
  }

  private patch(ticket: TicketWithId) {
    this.form.patchValue(ticket);
    this.formService.patchAttachment(ticket.attachments || []);
    this.initFields(ticket);
  }

  private reset() {
    this.form.reset();
    this.formService.resetAttachment();
    this.subtasks.set([]);
  }

  private async initTicket() {
    const companyPath = `${this.companyService.path()}/${this.companyService.id()}`;
    this.ticketService.path.set(`${companyPath}/${TICKETS.path}`);
    // const id = this.route.snapshot.paramMap.get('ticketId');
    if (!this.ticketId) return;
    const ticket = (this.ticketId === NEW_TICKET_ID) ?
      {id: NEW_TICKET_ID, ...TICKET} :
      await this.crud.getDoc(this.ticketService.path(), this.ticketId, true);
    this.ticketService.ticket.set(ticket);
  }

  private async initStats() {
    const stats = await this.crud.getDoc(this.ticketService.path(), TICKET_STATS_ID);
    this.stats = stats ?? TICKET_STATS;
  }

  private initFields(ticket: TicketWithId) {
    this.selectedMember = ticket.assignedTo || ticket.creator || <Entity>{};
    this.currentDepartment =
      this.teamService.getDepByMemberId(this.selectedMember.role).toLowerCase() || 'Board';
    const t: Timestamp = this.form.get('deadline')?.value as Timestamp;
    this.form.get('deadline')?.setValue(t.toDate());
    this.serial = ticket ? this.ticketService.getTicketNumber(ticket) : 'TBD';
  }

  async update(): Promise<void> {
    this.snackBar.open('Saving ticket...', 'X', {duration: 2000});
    if (this.processComponent && this.processComponent.diagramModified) {
      await this.processComponent.saveXML();
    }
    const ticket = this.form.value;
    const path = this.ticketService.path();
    // const id = this.ticketService.ticket()?.id;
    ticket.timestamps.updated_at = Date.now();
    ticket.creator = {
      id: this.profileService.profileId(),
      avatar: this.profileService.avatar(),
      name: this.profileService.displayName()
    }
    ticket.parentId = this.parentId;

    if (this.ticketId === NEW_TICKET_ID) {
      console.log(ticket);

      const newTicket = await this.crud.add(path, ticket);
      if (!newTicket) return;
      if (this.parentId) {
        const dependencies = this.parentTicket.dependencies || [];
        dependencies.push(newTicket?.id);
        await this.crud.update(path, this.parentId, {dependencies});
      }
    } else if (this.ticketId) {
      console.log(ticket);
      await this.crud.update(path, this.ticketId, ticket);
    }

    this.stats.timestamps.updated_at = Date.now();
    await this.crud.set(path, TICKET_STATS_ID, this.stats);
    this.router.navigate(['..'], {relativeTo: this.route}).then(() => {
      this.snackBar.open('Ticket saved.', 'X', {duration: 2000});
    });
  }

  async saveProcess($event: string) {
    this.form.get('process')?.setValue($event);
    await this.update();
  }

  updateStats(personaId: string): void {
    setTimeout(async () => {
      const department = this.teamService.getDepByMemberId(personaId).toLowerCase();
      if (this.stats.serials[this.currentDepartment]) this.stats.serials[this.currentDepartment]--;
      this.stats.serials[department] = this.stats.serials[department] + 1 || 1;
      this.serial =
        `[${department.slice(0, 3).toUpperCase()}-${("0000" + this.stats.serials[department]).slice(-4)}]`;
      this.form.get('serial')?.setValue(this.stats.serials[department]);
      this.currentDepartment = department;
    }, 150);
  }

  setAssignee(id: string): void {
    const member = this.team.find(member => member.persona.role === id);
    this.form.get('assignedTo')?.setValue(member?.persona);
    this.updateStats(id);
  }

  getColor(stage: TicketStage): string {
    switch (stage) {
      case TicketStage.ToDo:
        return 'warn';
      case TicketStage.Doing:
        return 'accent';
      case TicketStage.Done:
        return 'primary';
      default:
        return 'warn';
    }
  }

  getSubtaskSerial(id: string): string {
    const ticket = this.subtasks().find(ticket => ticket.id === id);
    if (!ticket) return id;
    return this.ticketService.getTicketNumber(ticket);
  }

  setView($event: any) {
    if ($event) {
      this.reset();
      this.ticketView.setValue('details');
    }
  }

  get form() {
    return this.formService.form;
  }

  get discussionsPath(): string {
    const id = this.ticketService.ticket()?.id;
    return id ?
      `${this.ticketService.path()}/${id}/${DISCUSSIONS.path}` : '';
  }

  protected readonly NEW_TICKET_ID = NEW_TICKET_ID;
}
