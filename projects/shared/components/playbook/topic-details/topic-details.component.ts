import {Component, inject, Input, OnInit} from '@angular/core';
import {AsyncPipe, DatePipe, NgStyle} from "@angular/common";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIconButton} from "@angular/material/button";
import {StorageUrlPipe} from '@shared/pipes';
import {DiscussionWithId, Entity, Resource, TopicWithId} from '@shared/interfaces';
import {TopicStatus} from '@shared/enums';
import {CrudService} from '@shared/services';
import {DISCUSSIONS} from '@shared/constants';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {PlaybookBpmnComponent} from '@shared/dialogs/playbook-bpmn/playbook-bpmn.component';
import {
  PlaybookKbComponent
} from '@shared/dialogs/playbook-kb/playbook-kb.component';

@Component({
  selector: 'lib-topic-details',
  imports: [
    MatTabsModule,
    DatePipe,
    AsyncPipe,
    StorageUrlPipe,
    NgStyle,
    MatIcon,
    MatTooltip,
    MatIconButton
],
  templateUrl: './topic-details.component.html',
  standalone: true,
  styleUrl: './topic-details.component.scss'
})
export class TopicDetailsComponent implements OnInit {
  @Input() topic!: TopicWithId;
  @Input() path!: string;

  private crud = inject(CrudService);
  private dialog = inject(MatDialog);

  discussions: DiscussionWithId[] | null = null;
  dialogConfig: MatDialogConfig = {};

  async ngOnInit() {
  }

  async openDiscussions(): Promise<void> {
    const q = {...DISCUSSIONS};
    q.path = `${this.path}/${this.topic.id}/${DISCUSSIONS.path}/`;
    this.discussions = await this.crud.getDocs(q, true, true);
  }

  bpmn(): void {
    this.dialog.open(PlaybookBpmnComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '100vw',
      panelClass: 'fullscreen-dialog',
      backdropClass: 'fullscreen-backdrop',
      data: {
        bpmn: this.topic.bpmn,
        topicId: this.topic.id,
        path: this.path
      }
    });
  }

  kb(): void {
    this.dialogConfig.data = {
      regenerate: this.topic.kbId !== undefined,
      id: this.topic.id, // kbId and topicId are the same
    };
    this.dialog.open(PlaybookKbComponent, this.dialogConfig);
  }

  protected readonly TopicStatus = TopicStatus;
}
