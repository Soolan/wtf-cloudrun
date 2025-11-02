import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {TicketWithId} from '@shared/interfaces';
import {DAY, NEW_TICKET_ID, RELEASE_ENTRIES, TICKET} from '@shared/constants';
import {ReleaseEntry, TicketStage} from '@shared/enums';
import {MatProgressBar} from '@angular/material/progress-bar';
import {AsyncPipe} from '@angular/common';
import {ProfileService, TeamService, TicketService} from '@shared/services';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {Timestamp} from '@angular/fire/firestore';
import {StorageUrlPipe} from '@shared/pipes';

@Component({
  selector: 'lib-subtasks',
  imports: [
    MatProgressBar,
    MatButton,
    MatIcon,
    RouterLink,
    AsyncPipe,
    StorageUrlPipe
  ],
  templateUrl: './subtasks.component.html',
  standalone: true,
  styleUrl: './subtasks.component.scss'
})
export class SubtasksComponent {
  @Input() subtasks: TicketWithId[] = [];
  @Output() added = new EventEmitter<boolean>();

  protected teamService = inject(TeamService);
  protected ticketService = inject(TicketService);
  protected profileService = inject(ProfileService);

  getProgress(stage: TicketStage, createdAt: number): number {
    const blocks = this.get4HourBlocks(createdAt);
    switch (stage) {
      case TicketStage.ToDo:
        return (20 + blocks) < 50 ? 20 + blocks : 50;
      case TicketStage.Doing:
        return (50 + blocks) < 90 ? 50 + blocks : 90;
      case TicketStage.Done:
        return 100;
      default:
        return 13;
    }
  }

  get4HourBlocks(created_at: number): number {
    const now = Date.now();                  // current timestamp in ms
    const diffMs = now - created_at;         // elapsed time in ms
    const diffHours = diffMs / (1000 * 60 * 60); // convert ms → hours
    return Math.floor(diffHours / 4);        // number of full 8-hour blocks
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

  setTicketSignals() {
    const ticket = {id: NEW_TICKET_ID, ...TICKET};
    ticket.stage = TicketStage.ToDo;
    ticket.deadline = Timestamp.fromDate(new Date(Date.now() + 3 * DAY));
    ticket.creator = {
      role: this.profileService.profileId(),
      name: this.profileService.displayName(),
      avatar: this.profileService.avatar()
    };
    ticket.parentId = this.ticketService.ticket()?.id;
    this.ticketService.ticket.set(ticket);
    const stats = this.ticketService.stats();
    if (!stats) return;
    stats.serials['board']++;
    this.ticketService.stats.set(stats);
    this.added.emit(true);
  }

  protected readonly RELEASE_ENTRIES = RELEASE_ENTRIES;
  protected readonly ReleaseEntry = ReleaseEntry;
  protected readonly NEW_TICKET_ID = NEW_TICKET_ID;
}
