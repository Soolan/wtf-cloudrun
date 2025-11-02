import {inject, Injectable, signal} from '@angular/core';
import {TeamService} from '@shared/services/team.service';
import {Ticket, TicketStats, TicketWithId, WtfQuery} from '@shared/interfaces';
import {Timestamp} from '@angular/fire/firestore';
import {DAY, TICKET_STATS_ID, TICKETS, WELCOME_TICKET} from '@shared/constants';
import {CrudService} from '@shared/services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private teamService = inject(TeamService);
  private crudService = inject(CrudService);

  ticket = signal<TicketWithId | null>(null);
  stats = signal<TicketStats | null>(null);
  path = signal('');

  constructor() { }

  getTicketNumber(ticket: Ticket | TicketWithId): string {
    if (!ticket.assignedTo) return '[TBD]';
    const department =
      this.teamService.getDepByMemberId(ticket.assignedTo?.role).toUpperCase() || 'BOARD';
    return `[${department.slice(0,3)}-${("0000" + ticket.serial).slice(-4)}]`;
  }

  async getStats(path: string): Promise<TicketStats> {
    return await this.crudService.getDoc(path, TICKET_STATS_ID);
  }

  alert(deadline: Timestamp): any {
    const time = deadline.toDate().getTime();
    return time < Date.now() ?
      { icon: 'priority_high', color: 'var(--color-error)' } :
      time < Date.now() + DAY ?
        { icon: 'alarm', color: 'var(--color-warn)' } :
        { icon: '', color: '' };
  }

  initKanbanBoard(path: string) {
    return this.crudService.add(`${path}/${TICKETS.path}`, WELCOME_TICKET);
  }

  async tasksOfTheDay(path: string): Promise<TicketWithId[]> {
    const query: WtfQuery = {...TICKETS, limit: 11, path};
    const tickets = await this.crudService.getDocs(query, true, true);
    if (!tickets?.length) return [];
    return tickets.filter(ticket => ticket.id !== TICKET_STATS_ID);
  }
}
