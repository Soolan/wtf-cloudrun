import {Component, inject, Input} from '@angular/core';
import {Button, Entity, Ticket, TicketStats, TicketWithId} from '@shared/interfaces';
import {TicketStage} from '@shared/enums';
import {AsyncPipe, DatePipe, TitleCasePipe} from '@angular/common';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';
import {DAY, NEW_TICKET_ID, RELEASE_ENTRIES_ICONS, TICKET} from '@shared/constants';
import {MatButton} from '@angular/material/button';
import {CrudService, TeamService, TicketService} from '@shared/services';
import {Timestamp} from '@angular/fire/firestore';
import {StorageUrlPipe} from '@shared/pipes';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {CropImageComponent} from '@shared/dialogs';
import {ConfirmComponent} from '@shared/dialogs/confirm/confirm.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'lib-ticket-stage',
  imports: [
    CdkDropList,
    CdkDrag,
    DatePipe,
    MatIcon,
    RouterLink,
    MatTooltip,
    MatButton,
    TitleCasePipe,
    AsyncPipe,
    StorageUrlPipe
  ],
  templateUrl: './ticket-stage.component.html',
  standalone: true,
  styleUrl: './ticket-stage.component.scss'
})
export class TicketStageComponent {
  @Input({required: true}) stage!: TicketStage;
  @Input({required: true}) stats!: TicketStats;
  @Input({required: true}) tickets: TicketWithId[] = [];
  @Input({required: true}) creator!: Entity;
  @Input({required: true}) connectedTo: TicketStage[] = [];

  public ticketService = inject(TicketService);
  private teamService = inject(TeamService);
  private snackBar = inject(MatSnackBar);
  private crud = inject(CrudService);
  private dialog = inject(MatDialog);

  dialogConfig: MatDialogConfig = {};

  setTicketSignals(ticket: TicketWithId, duplicate = false, stage = TicketStage.Backlog) {
    if (duplicate) {
      ticket.title = `[copy] ${ticket.title}`;
      ticket.id = NEW_TICKET_ID;
    }
    if (stage) {
      ticket.stage = stage;
      const deadline = stage === TicketStage.Done ?
        DAY : TicketStage.Doing ?
          2 * DAY : TicketStage.ToDo ?
            3 * DAY : 30 * DAY;
      ticket.deadline = Timestamp.fromDate(new Date(Date.now() + deadline));
    }
    this.ticketService.ticket.set(ticket);
    this.setStats(ticket);
  }

  setStats(ticket: TicketWithId) {
    const id = ticket.assignedTo?.role || ticket.creator?.role;
    if (id) {
      const department = this.teamService.getDepByMemberId(id);
      this.stats.serials[department]++;
    } else {
      this.stats.serials['board']++;
    }
    this.ticketService.stats.set(this.stats);
  }

  async drop(event: CdkDragDrop<any[]>, stage: TicketStage) {
    const assigneeId = event.previousContainer.data[event.previousIndex].assignedTo.id;
    const ticketId = event.previousContainer.data[event.previousIndex].id;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      await this.crud.update(
        this.ticketService.path(),
        event.previousContainer.data[event.previousIndex].id,
        {stage}
      )
      if (stage === TicketStage.ToDo) this.notify(assigneeId, ticketId);
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  notify(assigneeId: string, ticketId: string) {
  }

  delete(ticket: TicketWithId): void {
    this.setDialogData(ticket);
    this.dialog.open(ConfirmComponent, this.dialogConfig)
      .afterClosed()
      .subscribe(async confirm => {
        if (confirm) {
          if (!!ticket.parentId) await this.removeFromParent(ticket.parentId, ticket.id);
          this.crud.delete(this.ticketService.path(), ticket.id);
        }
      });
  }

  private setDialogData(ticket: TicketWithId) {
    const hasParent = !!ticket.parentId;
    const hasChildren = (ticket.dependencies?.length ?? 0) > 0;
    const heading: string = hasChildren ? "Parent ticket!" : "Please confirm";
    const subheading: string = hasChildren ? "Sorry, can not continue." : "This ticket will be Deleted."
    const content =
      hasParent ? `This is a subtask (parent id: ${ticket.parentId})` :
        hasChildren ? `This ticket has subtasks. Please delete them first!` : "";
    const actions: Button[] = [
      {
        label: hasChildren ? "Back" : "Proceed",
        icon: hasChildren ? "arrow_back" : "arrow_forward"
      }
    ]
    this.dialogConfig.data = {heading, subheading, content, actions};
  }

  async removeFromParent(parentId: string, childId: string) {
    if (!parentId || !childId) return;
    const path = this.ticketService.path();
    console.log(path, parentId, childId)
    const parent = await this.crud.getDoc(path, parentId) as Ticket;
    const children = parent.dependencies;
    console.log(children)
    if (children) {
      const dependencies = children.filter(id => id !== childId);
      console.log(dependencies);
      await this.crud.update(path, parentId, {dependencies});
      this.snackBar.open('Parent ticket updated!', 'X', {duration: 2500})
    }
  }

  get newTicket(): TicketWithId {
    const ticket: Ticket = {...TICKET};
    ticket.creator = this.creator;
    ticket.assignedTo = this.creator;
    return {id: NEW_TICKET_ID, ...ticket};
  }

  hasAvatar(ticket: TicketWithId): boolean {
    return !!ticket?.assignedTo?.avatar;
  }

  protected readonly NEW_TICKET_ID = NEW_TICKET_ID;
  protected readonly RELEASE_ENTRIES_ICONS = RELEASE_ENTRIES_ICONS;
  protected readonly TicketStage = TicketStage;
}
