import {Component, inject, OnInit, signal} from '@angular/core';
import {FlowService, FunctionsService, PlaybookService} from '@shared/services';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {ProcessComponent} from '@shared/components';
import {NgStyle} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {BpmnEligibility, Entity, Flow, FlowState, Resource} from '@shared/interfaces';
import {FlowStatus} from '@shared/enums';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

@Component({
  selector: 'lib-playbook-bpmn',
  imports: [
    ProcessComponent,
    NgStyle,
    MatDialogClose,
    MatButton,
    MatIcon,
    MatIconButton,
    MatProgressBar,
    MatProgressSpinnerModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
  ],
  templateUrl: './playbook-bpmn.component.html',
  standalone: true,
  styleUrl: './playbook-bpmn.component.scss'
})
export class PlaybookBpmnComponent implements OnInit {
  private snackbar = inject(MatSnackBar);
  private flowService = inject(FlowService);
  private functions = inject(FunctionsService);
  protected playbookService = inject(PlaybookService);
  private dialogRef = inject(MatDialogRef<PlaybookBpmnComponent>);
  protected data = inject(MAT_DIALOG_DATA) as {
    topicId: string,
    bpmn?: Resource,
    path: string
  };

  manual= signal<boolean>(false);
  checking= signal<boolean>(false);
  generating= signal<boolean>(false);
  flowMessages = signal<string[]>([]);
  flowProgress = signal<number>(0);
  flowStatus = signal<FlowStatus | null>(null);
  assessment = signal<BpmnEligibility|undefined>(undefined);
  private flowSubscription: Subscription | undefined;
  payload = {
    flowId: '',
    topicId: '',
    path: '', // Firestore path to topic
    creator: {},
  }

  ngOnInit() {
    console.log(this.data)
    this.payload = {
      flowId: '',
      topicId: this.data.topicId,
      path: this.data.path, // Firestore path to topic
      creator: this.playbookService.stats()?.maintainer || {},
    }
  }

  save($event: any): void {
    console.log($event);
  }

  async checkEligibility() {
    this.checking.set(true);
    const flowData: Partial<Flow> = {
      function: 'chatBpmnEligibility',
      path: this.data.path,
    };

    try {
      const flowId = await this.flowService.addFlow(flowData);
      this.payload.flowId = flowId;
      this.monitorFlow(flowId);
      const outcome = await this.functions.call('chatBpmnEligibility', this.payload);
      console.log(outcome);
      this.assessment.set(outcome.assessment);
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error: any) {
    this.checking.set(false);
    const message = typeof error === 'string' ? error : error?.message ?? 'Unknown error occurred';
    this.snackbar.open(message, 'X', {duration: 7000});
  }

  monitorFlow(flowId: string) {
    console.log(flowId)
    this.flowSubscription = this.flowService.monitorFlow(flowId).subscribe((flowState: FlowState) => {
      this.flowMessages.set([...flowState.messages]);
      this.flowProgress.set(flowState.progress);
      this.flowStatus.set(flowState.status);

      if (flowState.status === FlowStatus.Completed) {
        this.snackbar.open(flowState.messages[flowState.messages.length - 1], 'X', {duration: 3500});
        this.flowSubscription?.unsubscribe();
      } else if (flowState.status === FlowStatus.Error) {
        this.handleError(flowState.error ?? 'An unknown flow error occurred.');
        this.flowSubscription?.unsubscribe();
      }
    });
  }

  async generate() {
    this.checking.set(false);
    this.generating.set(true);
    const flowData: Partial<Flow> = {
      function: 'generateBpmn',
      path: this.data.path,
    };

    try {
      const flowId = await this.flowService.addFlow(flowData);
      this.payload.flowId = flowId;
      this.monitorFlow(flowId);
      const outcome = await this.functions.call('generateBpmn', this.payload);
      console.log(outcome);
      this.data.bpmn = outcome;
    } catch (error) {
      this.handleError(error);
    }
  }

  ngOnDestroy() {
    this.flowSubscription?.unsubscribe();
  }

  protected readonly FlowStatus = FlowStatus;
}
