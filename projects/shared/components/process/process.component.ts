import {
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import Modeler from 'bpmn-js/lib/Modeler';
import {CompanyService, StorageService} from '@shared/services';
import {ProgressType} from '@shared/enums';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgStyle} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Canvas} from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import {MatTooltip} from '@angular/material/tooltip';
import {BpmnService} from '@shared/services/bpmn.service';
import {NEW_BPMN} from '@shared/constants/processes';

@Component({
  selector: 'lib-process',
  standalone: true,
  imports: [MatIcon, NgStyle, MatIconButton, MatTooltip],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss',
})
export class ProcessComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bpmnModelerRef', {static: true}) private bpmnModelerRef!: ElementRef;
  @Input() fullscreen = false;
  @Input() maximized = false;
  @Input() process!: string;
  @Output() path = new EventEmitter<string>();

  private companyService = inject(CompanyService);
  private storage = inject(StorageService);
  public bpmnService = inject(BpmnService);
  private snackBar = inject(MatSnackBar);

  bpmn!: Modeler;
  loading = true;
  diagramModified = false;
  saving = false;
  shortcuts = false;

  constructor() {
    this.bpmn = new Modeler();
  }

  async ngAfterViewInit(): Promise<void> {
    this.bpmn.attachTo(this.bpmnModelerRef.nativeElement);
    setTimeout(() => this.bpmnService.removeBranding(), 10);
    this.listenToChanges();
    const xml = this.process? await this.bpmnService.loadRef(this.process): NEW_BPMN;
    this.bpmnService.render(this.bpmn, xml);
  }

  private listenToChanges(): void {
    this.bpmn.on('commandStack.changed', () => {
      this.diagramModified = true;
    });
  }

  async saveXML(): Promise<void> {
    this.saving = true;

    // If process is empty, generate-topic a new storage reference
    if (!this.process) {
      const path = `${this.companyService.path()}/${this.companyService.id()}/bpmn`;
      this.process = `${path}/${Date.now()}.bpmn`;
      this.path.emit(this.process);
    }
    await this.bpmnService.saveXML(this.bpmn, this.process);
    this.saving = false;
  }

  loadXML(): void {
    this.bpmnService.loadXML(this.bpmn);
  }


  async downloadSVG() {
    await this.bpmnService.downloadSVG(this.bpmn);
  }

  async downloadXML() {
    await this.bpmnService.downloadXML(this.bpmn);
  }

  toggleShortcuts() {
    this.shortcuts = !this.shortcuts;
  }

  zoom(zoomIn?: boolean | null): void {
    const canvas = this.bpmn.get<Canvas>('canvas');
    if (zoomIn === null || !canvas) {
      canvas?.zoom(1);
      return;
    }

    const step = 0.5; // Zoom step
    let newScale = zoomIn
      ? canvas.viewbox().scale + step  // Zoom in
      : canvas.viewbox().scale - step; // Zoom out
    newScale = Math.max(0.25, Math.min(3, newScale)); // Restrict zoom between 0.25x and 3x

    canvas.zoom(newScale);
  }


  ngOnDestroy(): void {
    if (this.bpmn) this.bpmn.destroy();
  }

  protected readonly ProgressType = ProgressType;
  protected readonly NEW_BPMN = NEW_BPMN;
}
