import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {
  BpaNodeWithId,
  MappedInput,
  NodeSettingsDialogData,
  ParametersSchema
} from '@shared/interfaces';
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {StorageUrlPipe} from "@shared/pipes";
import {MatTooltipModule} from "@angular/material/tooltip";
import {NodeRegistryService} from "@shared/services";
import {DynamicNodeFormComponent} from '@shared/components';
import { FormField } from '@shared/interfaces';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {TextFieldModule} from "@angular/cdk/text-field";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatDividerModule} from "@angular/material/divider";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'lib-node-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    StorageUrlPipe,
    MatTooltipModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './node-settings.component.html',
  styleUrls: ['./node-settings.component.scss']
})
export class NodeSettingsDialogComponent implements OnInit, OnDestroy {
  @ViewChild('dynamicFormComponentContainer', {read: ViewContainerRef, static: true}) dynamicFormComponentContainer!: ViewContainerRef;

  mappedInputs: MappedInput[] = [];
  nodeMap: Map<string, BpaNodeWithId>;
  liveInputData: { [key: string]: any } | null = null;
  liveOutputData: { [key: string]: any } | null = null;
  isLoadingData = false;
  isEditingTitle = false;
  previousNode: BpaNodeWithId | null = null;
  nextNode: BpaNodeWithId | null = null;
  parametersSchema: ParametersSchema | null = null;
  settingsForm!: FormGroup;
  onErrorOptions = [
    { value: 'stop', label: 'Stop Workflow', description: 'Halt execution and fail workflow' },
    { value: 'continue', label: 'Continue', description: 'Pass error message as item in regular output' },
    { value: 'continueErrorOutput', label: 'Continue (using extra \'error\' output)', description: 'Pass item to an extra \'error\' output' }
  ];

  private broadcastChannel: BroadcastChannel | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<NodeSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NodeSettingsDialogData,
    private cdr: ChangeDetectorRef,
    private nodeRegistry: NodeRegistryService,
    private fb: FormBuilder
  ) {
    this.nodeMap = new Map(this.data.nodes.map(node => [node.id, node]));
  }

  ngOnInit(): void {
    this.updateDialogForNode(this.data.node);
  }

  ngOnDestroy(): void {
    this.broadcastChannel?.close();
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveTitle(newName: string): void {
    if (newName && newName.trim() !== this.data.node.name) {
      this.data.node.name = newName.trim();
    }
    this.isEditingTitle = false;
  }

  navigateTo(node: BpaNodeWithId | null): void {
    if (node) {
      this.updateDialogForNode(node);
    }
  }

  onParametersChange(params: { [key: string]: any }): void {
    if (this.data.node) {
      this.data.node.parameters = params;
      this.updateFormTriggerOutputs();
      this.cdr.detectChanges();
    }
  }

  executePreviousNodes(): void {
    this.isLoadingData = true;
    this.liveInputData = null;
    setTimeout(() => {
      const generatedData: { [key: string]: any } = {};
      this.mappedInputs.forEach(input => {
        if (input.isConnected && input.sourceNode?.schema?.outputs) {
          const sourceOutputSchema = input.sourceNode.schema.outputs.find(o => o.name === input.sourceOutput);
          if (sourceOutputSchema) {
            switch (sourceOutputSchema.type) {
              case 'number': generatedData[input.name] = Date.now(); break;
              case 'string': generatedData[input.name] = `Mock output for ${input.name}`; break;
              case 'boolean': generatedData[input.name] = Math.random() > 0.5; break;
              case 'object': generatedData[input.name] = {mockKey: 'mockValue', from: input.sourceNode?.name}; break;
              default: generatedData[input.name] = null;
            }
          }
        }
      });
      this.liveInputData = generatedData;
      this.isLoadingData = false;
    }, 1000);
  }

  runNode(): void {
    this.liveOutputData = null;
    this.isLoadingData = true;
    switch (this.data.node.nodeDefinitionId) {
      case 'form-trigger':
        this.runFormTrigger();
        break;
      default:
        this.isLoadingData = false;
        break;
    }
  }

  private runFormTrigger(): void {
    const runId = Date.now().toString();
    const formData = {
      title: this.data.node.parameters?.['title'],
      description: this.data.node.parameters?.['description'],
      fields: this.data.node.parameters?.['fields']
    };
    sessionStorage.setItem(`form-run-${runId}`, JSON.stringify(formData));

    const width = 800;
    const height = 700;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);
    const windowFeatures = `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`;

    window.open(`/form/${runId}`, `form-popup-${runId}`, windowFeatures);

    this.broadcastChannel = new BroadcastChannel('form-submission');
    this.broadcastChannel.onmessage = (event) => {
      this.liveOutputData = event.data;
      this.isLoadingData = false;
      this.cdr.detectChanges();
      this.broadcastChannel?.close();
    };
  }

  private updateDialogForNode(node: BpaNodeWithId): void {
    this.data.node = node;
    this.isEditingTitle = false;
    this.liveInputData = null;
    this.liveOutputData = null;
    this.parametersSchema = this.nodeRegistry.getParametersSchema(this.data.node.nodeDefinitionId);
    this.buildSettingsForm(node);
    this.mapInputs();
    this.findConnectedNodes();
    this.loadDynamicFormComponent();
    this.updateFormTriggerOutputs();
    this.cdr.detectChanges();
  }

  private buildSettingsForm(node: BpaNodeWithId): void {
    const settings = node.settings || {};

    this.settingsForm = this.fb.group({
      alwaysOutputData: [settings.alwaysOutputData ?? false],
      executeOnce: [settings.executeOnce ?? false],
      retryOnFail: [settings.retryOnFail ?? false],
      retryMaxTries: [settings.retryMaxTries ?? 3],
      retryWait: [settings.retryWait ?? 1000],
      onError: [settings.onError ?? 'stop'],
      notes: [settings.notes ?? ''],
      displayNoteInFlow: [settings.displayNoteInFlow ?? false]
    });

    this.settingsForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(formValue => {
      if (this.data.node) {
        this.data.node.settings = {
          ...this.data.node.settings,
          ...formValue
        };
        this.cdr.detectChanges();
      }
    });
  }

  private loadDynamicFormComponent(): void {
    this.dynamicFormComponentContainer.clear();
    if (this.parametersSchema) {
      const componentRef = this.dynamicFormComponentContainer.createComponent(DynamicNodeFormComponent);
      componentRef.instance.parametersSchema = this.parametersSchema;
      componentRef.instance.nodeId = this.data.node.id;
      componentRef.instance.parameters = this.data.node.parameters;
      componentRef.instance.parametersChange.subscribe(params => {
        this.onParametersChange(params);
      });
    }
  }

  private findConnectedNodes(): void {
    const previousConnection = this.data.connections.find(conn => conn.target.node === this.data.node.id);
    const nextConnection = this.data.connections.find(conn => conn.source.node === this.data.node.id);
    this.previousNode = previousConnection ? this.nodeMap.get(previousConnection.source.node) || null : null;
    this.nextNode = nextConnection ? this.nodeMap.get(nextConnection.target.node) || null : null;
  }

  private mapInputs(): void {
    const nodeInputs = this.data.node.schema?.inputs || [];
    if (nodeInputs.length === 0) {
      this.mappedInputs = [];
      return;
    }
    const incomingConnections = this.data.connections.filter(conn => conn.target.node === this.data.node.id);
    this.mappedInputs = nodeInputs.map(inputField => {
      const connection = incomingConnections.find(conn => conn.target.input === inputField.name);
      if (connection) {
        const sourceNode = this.nodeMap.get(connection.source.node);
        return {...inputField, isConnected: true, sourceNode: sourceNode, sourceOutput: connection.source.output};
      } else {
        return {...inputField, isConnected: false};
      }
    });
  }

  private updateFormTriggerOutputs(): void {
    if (this.data.node?.nodeDefinitionId !== 'form-trigger') {
      return;
    }
    const fields = this.data.node.parameters?.['fields'] as FormField[] | undefined;
    if (fields && this.data.node.schema) {
      this.data.node.schema.outputs = fields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type
      }));
    }
  }
}
