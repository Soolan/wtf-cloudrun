import {Component, effect, inject, signal} from '@angular/core';
import {Entity, TicketStats, TicketWithId, WtfQuery} from '@shared/interfaces';
import {MEMBERS, NOW, TICKET_STATS, TICKET_STATS_ID, TICKETS} from '@shared/constants';
import {
  CompanyService,
  CrudService,
  LayoutVisibilityService,
  ProfileService,
  TeamService,
  TicketService
} from '@shared/services';
import {TicketStage} from '@shared/enums';
import {Subscription} from 'rxjs';
import {NgForOf, NgIf} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TicketStageComponent} from '@shared/components/ticket-stage/ticket-stage.component';

@Component({
  selector: 'lib-kanban',
  imports: [
    MatProgressSpinner,
    NgForOf,
    NgIf,
    TicketStageComponent,
  ],
  templateUrl: './kanban.component.html',
  standalone: true,
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent {
  private crud = inject(CrudService);
  private teamService = inject(TeamService);
  public ticketService = inject(TicketService);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  public layoutService = inject(LayoutVisibilityService);

  stats!: TicketStats;
  creator!: Entity;
  loading = true;
  stages = [TicketStage.Backlog, TicketStage.ToDo, TicketStage.Doing, TicketStage.Done];
  ticketsByStage!: Record<TicketStage, TicketWithId[]>;
  ticketSubscription?: Subscription;

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        const companyPath = `${this.companyService.path()}/${this.companyService.id()}`;
        this.ticketService.path.set(`${companyPath}/${TICKETS.path}`);
        const query: WtfQuery = {...TICKETS, path: this.ticketService.path()}; // Clone & override path
        this.ticketSubscription?.unsubscribe(); // Unsubscribe before re-subscribing
        this.ticketSubscription = this.crud.getStream(query, true)?.subscribe(tickets => {
          this.initLists(tickets)
        });
        await this.teamService.initMembers(`${companyPath}/${MEMBERS.path}`);
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    this.creator = {
      role: this.profileService.profileId(),
      name: this.profileService.displayName(),
      avatar: this.profileService.avatar()
    };
  }

  initLists(tickets: TicketWithId[]): void {
    this.loading = false;
    if (!tickets) return;
    this.resetLists();
    this.setStats(tickets);
    this.ticketsByStage = this.stages.reduce(
      (record: Record<TicketStage, TicketWithId[]>, stage: TicketStage): Record<TicketStage, TicketWithId[]> => {
        record[stage] = tickets.filter(t => t.stage === stage);
        return record;
      }, {} as Record<TicketStage, TicketWithId[]>
    );
  }

  private setStats(tickets: TicketWithId[]) {
    const index = tickets.findIndex(ticket => ticket.id === TICKET_STATS_ID);
    if (index === -1) {
      // We need the timestamps and deadline properties because tickets query rely on them
      this.stats = TICKET_STATS;
    } else {
      this.stats = tickets[index] as unknown as TicketStats;
      tickets.splice(index, 1);
    }
    this.ticketService.stats.set(this.stats);
  }

  resetLists(): void {
    this.ticketsByStage = {
      [TicketStage.Backlog]: [],
      [TicketStage.ToDo]: [],
      [TicketStage.Doing]: [],
      [TicketStage.Done]: [],
    };
  }

  ngOnDestroy() {
    this.ticketSubscription?.unsubscribe(); // Clean up when the component is destroyed
  }
}
