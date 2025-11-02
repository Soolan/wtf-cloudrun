import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  ElementRef, ChangeDetectorRef
} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {BpaConnection, BpaNode, BpaNodeWithId} from '@shared/interfaces/bpa';
import {MatDialog, MatDialogConfig, MatDialogModule} from '@angular/material/dialog';
import {BpaService, DialogConfigService} from '@shared/services';
import {CdkDragEnd, DragDropModule} from '@angular/cdk/drag-drop';
import {NEW_BPMN} from '@shared/constants/processes';
import {MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {ConfirmationDialogComponent} from '@shared/dialogs/confirmation/confirmation.component';
import {ProcessNodeStatus} from '@shared/enums';
import {NodeSettingsDialogComponent} from "@shared/dialogs/node-settings/node-settings.component";
import {NodePickerPanelComponent} from "../node-picker-panel/node-picker-panel.component";
import {NODE_PANEL_SLIDE} from '@shared/animations';

@Component({
  selector: 'lib-bpa-canvas',
  standalone: true,
  imports: [
    CommonModule, DragDropModule, MatDialogModule, MatIcon, MatIconButton,
    MatTooltip, MatMiniFabButton, NodePickerPanelComponent
  ],
  templateUrl: './bpa-canvas.component.html',
  styleUrls: ['./bpa-canvas.component.scss'],
  animations: [NODE_PANEL_SLIDE],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BpaCanvasComponent implements OnChanges {
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName.toUpperCase() === 'INPUT' || target.tagName.toUpperCase() === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      this.add();
    } else if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.save();
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.zoomIn();
    } else if (event.key === '-') {
      event.preventDefault();
      this.zoomOut();
    } else if (event.code === 'Space') {
      event.preventDefault();
      this.isPanning = true;
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
      this.isPanning = false;
      this.lastPanPosition = null;
    }
  }

  @Input() nodes: BpaNodeWithId[] | null = [];
  @Input() connections: BpaConnection[] | null = [];
  @Input() selectedNode: BpaNodeWithId | null = null;
  @Output() nodeSelected = new EventEmitter<BpaNodeWithId>();
  @Output() nodeMoved = new EventEmitter<{ nodeId: string, position: [number, number] }>();
  @Output() connectionDeleted = new EventEmitter<BpaConnection>();
  @Output() nodeAdded = new EventEmitter<{ node: BpaNode, connection?: BpaConnection }>();
  @Output() nodeInsertedBetweenConnections = new EventEmitter<{
    newNode: BpaNode,
    oldConnection: BpaConnection,
    newConnection1: BpaConnection,
    newConnection2: BpaConnection
  }>();
  @Output() connectionCreated = new EventEmitter<BpaConnection>();
  @Output() autoLayoutRequested = new EventEmitter<void>();

  private dialog = inject(MatDialog);
  private bpaService = inject(BpaService);
  private document = inject(DOCUMENT);
  private el = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private configService = inject(DialogConfigService);
  dialogConfig: MatDialogConfig = {};

  nodeMap = new Map<string, BpaNodeWithId>();
  hoveredConnection: BpaConnection | null = null;
  hoveredNode: BpaNodeWithId | null = null;
  selectedConnection: BpaConnection | null = null;
  isDraggingJoint = false;

  isDraggingConnection: boolean = false;
  draggedConnectionSourceNode: BpaNodeWithId | null = null;
  draggedConnectionEndPoint: { x: number, y: number } | null = null;
  snappedTargetNode: BpaNodeWithId | null = null;
  highlightedConnectionId: string | null = null;

  // For pan and zoom
  scale = 1;
  panX = 0;
  panY = 0;
  transform = 'translate(0px, 0px) scale(1)';
  shortcuts = false;
  runningNodeIds = new Set<string>();
  isPanning = false;
  private lastPanPosition: { x: number, y: number } | null = null;
  isNodePickerOpen = false;
  addNodeContext: { connection?: BpaConnection | null, sourceNode?: BpaNodeWithId | null } | null = null;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) {
      this.nodeMap.clear();
      if (!this.nodes) return;
      for (const node of this.nodes) {
        this.nodeMap.set(node.id, node);
      }
    }
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.ctrlKey) {
      // Zooming
      const zoomDirection = event.deltaY < 0 ? 1 : -1;
      const zoomFactor = 1.1;
      const newScale = this.scale * (zoomDirection > 0 ? zoomFactor : 1 / zoomFactor);

      const rect = this.el.nativeElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);

      this.scale = newScale;

    } else if (event.shiftKey) {
      this.panX -= event.deltaY;
    } else {
      this.panY -= event.deltaY;
    }
    this.updateTransform();
  }

  updateTransform(): void {
    this.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    this.cdr.detectChanges();
  }

  onNodeClick(node: BpaNodeWithId): void {
    this.nodeSelected.emit(node);
  }

  onNodeDoubleClick(node: BpaNodeWithId): void {
    this.dialogConfig = {
      ...this.configService.getConfig(),
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog'
    };

    this.dialogConfig.data = {
      node,
      nodes: this.nodes,
      connections: this.connections
    };
    console.log(this.dialogConfig);
    this.dialog.open(NodeSettingsDialogComponent, this.dialogConfig);
    // this.dialog.open(LogoPromptComponent, this.dialogConfig);
  }

  onCanvasMouseDown(event: MouseEvent): void {
    if (this.isPanning) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('canvas-container') || target.classList.contains('canvas-content-wrapper') || target.tagName === 'svg') {
        event.preventDefault();
        this.lastPanPosition = {x: event.clientX, y: event.clientY};
      }
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (this.isPanning && this.lastPanPosition) {
      event.preventDefault();
      const dx = event.clientX - this.lastPanPosition.x;
      const dy = event.clientY - this.lastPanPosition.y;

      this.panX += dx;
      this.panY += dy;

      this.lastPanPosition = {x: event.clientX, y: event.clientY};
      this.updateTransform();
    }
  }

  onCanvasMouseUp(event: MouseEvent): void {
    if (this.isPanning) {
      event.preventDefault();
      this.lastPanPosition = null;
    }
  }

  onCanvasMouseLeave(event: MouseEvent): void {
    if (this.isPanning) {
      this.lastPanPosition = null;
    }
  }

  onNodeDragEnded(event: CdkDragEnd, node: BpaNodeWithId): void {
    const newPosition: [number, number] = [node.position[0] + (event.distance.x / this.scale), node.position[1] + (event.distance.y / this.scale)];
    const updatedNode = this.nodeMap.get(node.id);
    if (updatedNode) {
      updatedNode.position = newPosition;
      this.nodeMoved.emit({nodeId: node.id, position: newPosition});
      event.source.reset();
    }
  }

  getCurvePath(connection: BpaConnection): string | null {
    if (!this.nodes) return null;
    const endpoints = this.bpaService.getConnectionEndpoints(connection, this.nodes);
    if (!endpoints) return null;
    const {startX, startY, endX, endY} = endpoints;
    const dx = endX - startX;
    const dy = endY - startY;

    if (dx >= 0) {
      // Forward connection
      const horizontalCurve = Math.max(Math.abs(dx) / 2, Math.abs(dy) / 4, 100);
      return `M ${startX},${startY} C ${startX + horizontalCurve},${startY} ${endX - horizontalCurve},${endY} ${endX},${endY}`;
    } else {
      // Backward connection (smarter curved routing)
      const nodeHeight = 150;
      const sourceNode = this.nodeMap.get(connection.source.node)!;
      const detourY = sourceNode.position[1] + nodeHeight + 60; // Detour below source
      const hOffset = 100;
      return `M ${startX},${startY} C ${startX + hOffset},${detourY} ${endX - hOffset},${detourY} ${endX},${endY}`;
    }
  }

  getIconPosition(connection: BpaConnection | null): { x: number, y: number } | null {
    if (!connection || !this.nodes) return null;
    const endpoints = this.bpaService.getConnectionEndpoints(connection, this.nodes);
    if (!endpoints) return null;

    const {startX, endX, startY, endY} = endpoints;
    return {
      x: (startX + endX) / 2,
      y: (startY + endY) / 2
    };
  }

  getDragCurvePath(): string | null {
    if (!this.draggedConnectionSourceNode || !this.draggedConnectionEndPoint) {
      return null;
    }

    const sourceNode = this.draggedConnectionSourceNode;
    let targetPoint = this.draggedConnectionEndPoint;

    if (this.snappedTargetNode) {
      const targetNode = this.snappedTargetNode;
      const nodeHeight = 150;
      const inputJointOffset = 16;

      targetPoint = {
        x: targetNode.position[0] - inputJointOffset + 0.5,
        y: targetNode.position[1] + nodeHeight / 2 + 5
      };
    }

    const nodeWidth = 150;
    const nodeHeight = 150;
    const outputJointOffset = 12;

    const startX = sourceNode.position[0] + nodeWidth + outputJointOffset - 0.5;
    const startY = sourceNode.position[1] + nodeHeight / 2 + 5;

    const endX = targetPoint.x;
    const endY = targetPoint.y;

    const dx = endX - startX;
    const dy = endY - startY;

    if (dx >= 0) {
      // Forward connection
      const horizontalCurve = Math.max(Math.abs(dx) / 2, Math.abs(dy) / 4, 100);
      return `M ${startX},${startY} C ${startX + horizontalCurve},${startY} ${endX - horizontalCurve},${endY} ${endX},${endY}`;
    } else {
      // Backward connection (smarter curved routing)
      const sourceNode = this.draggedConnectionSourceNode!;
      const detourY = sourceNode.position[1] + nodeHeight + 60;
      const hOffset = 100;
      return `M ${startX},${startY} C ${startX + hOffset},${detourY} ${endX - hOffset},${detourY} ${endX},${endY}`;
    }
  }

  getConnectionId(connection: BpaConnection): string {
    return `${connection.source.node}-${connection.source.output}-${connection.target.node}-${connection.target.input}`;
  }

  openNodePicker(context: { connection?: BpaConnection | null, sourceNode?: BpaNodeWithId | null } = {}): void {
    this.addNodeContext = context;
    this.isNodePickerOpen = true;
  }

  closeNodePicker(): void {
    this.isNodePickerOpen = false;
    this.addNodeContext = null;
  }

  onNodePicked(node: BpaNode): void {
    const newNode: BpaNode = {...node, position: [0, 0]}; // Create a mutable copy

    if (this.addNodeContext?.connection) {
      // Insert node into a connection
      const oldConnection = this.addNodeContext.connection;
      const sourceNode = this.nodeMap.get(oldConnection.source.node);
      const targetNode = this.nodeMap.get(oldConnection.target.node);

      if (sourceNode && targetNode) {
        // Position the new node between the source and target nodes
        const sourcePos = sourceNode.position;
        const targetPos = targetNode.position;
        newNode.position = [(sourcePos[0] + targetPos[0]) / 2, (sourcePos[1] + targetPos[1]) / 2];

        const newConnection1: BpaConnection = {
          source: oldConnection.source,
          target: {node: '<NEW_NODE_ID>', input: 'main'}
        };
        const newConnection2: BpaConnection = {
          source: {node: '<NEW_NODE_ID>', output: 'main'},
          target: oldConnection.target
        };

        this.nodeInsertedBetweenConnections.emit({
          newNode,
          oldConnection,
          newConnection1,
          newConnection2
        });
      }
    } else if (this.addNodeContext?.sourceNode) {
      // Add node after an existing node
      const sourceNode = this.addNodeContext.sourceNode;

      // Position the new node to the right of the source node
      newNode.position = [sourceNode.position[0] + 250, sourceNode.position[1]];

      const newConnection: BpaConnection = {
        source: {node: sourceNode.id, output: 'main'},
        target: {node: '<NEW_NODE_ID>', input: 'main'}
      };

      this.nodeAdded.emit({node: newNode, connection: newConnection});

    } else {
      // Add node to empty space
      const rect = this.el.nativeElement.getBoundingClientRect();
      // Place it in the center of the current view
      const centerX = (rect.width / 2 - this.panX) / this.scale;
      const centerY = (rect.height / 2 - this.panY) / this.scale;
      newNode.position = [centerX, centerY];

      this.nodeAdded.emit({node: newNode});
    }

    this.closeNodePicker();
    this.cdr.detectChanges();
  }

  onAddNode(connection: BpaConnection | null): void {
    this.openNodePicker({connection});
  }

  onDeleteConnection(connection: BpaConnection | null, event: any): void {
    event.stopPropagation();
    if (!connection) {
      console.warn('onDeleteConnection called with null connection');
      return;
    }
    this.connectionDeleted.emit(connection);
  }

  onOutputJointClick(node: BpaNodeWithId, event: MouseEvent): void {
    if (!this.isDraggingJoint) {
      this.openNodePicker({sourceNode: node});
    }
    this.cdr.detectChanges();
    console.log(this.isNodePickerOpen)
  }

  onAddNodeFromOutputJoint(sourceNode: BpaNodeWithId, event: any): void {
    event.stopPropagation();
    this.openNodePicker({sourceNode});
  }

  onConnectionDragStarted(sourceNode: BpaNodeWithId, event: MouseEvent): void {
    this.isDraggingJoint = false;
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingConnection = true;
    this.draggedConnectionSourceNode = sourceNode;

    const canvasRect = this.el.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    const worldX = (mouseX - this.panX) / this.scale;
    const worldY = (mouseY - this.panY) / this.scale;

    this.draggedConnectionEndPoint = {x: worldX, y: worldY};

    this.document.addEventListener('mousemove', this.onConnectionDragMoved.bind(this));
    this.document.addEventListener('mouseup', this.onConnectionDragEnded.bind(this));
  }

  onConnectionDragMoved(event: MouseEvent): void {
    if (this.isDraggingConnection) {
      this.isDraggingJoint = true;
      const canvasRect = this.el.nativeElement.getBoundingClientRect();
      const currentMouseX = event.clientX - canvasRect.left;
      const currentMouseY = event.clientY - canvasRect.top;

      const worldX = (currentMouseX - this.panX) / this.scale;
      const worldY = (currentMouseY - this.panY) / this.scale;

      this.draggedConnectionEndPoint = {x: worldX, y: worldY};

      let currentTargetNode: BpaNodeWithId | null = null;
      const elementUnderMouse = this.document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;

      if (elementUnderMouse && elementUnderMouse.classList.contains('input-joint')) {
        const targetNodeElement = elementUnderMouse.closest('.workflow-node');
        if (targetNodeElement) {
          const targetNodeId = targetNodeElement.id;
          const targetNode = this.nodeMap.get(targetNodeId);
          if (targetNode && this.draggedConnectionSourceNode?.id !== targetNode.id) {
            currentTargetNode = targetNode;
          }
        }
      }

      this.snappedTargetNode = currentTargetNode;
      this.cdr.detectChanges();
    }
  }

  onConnectionDragEnded(event: MouseEvent): void {
    this.isDraggingConnection = false;

    this.document.removeEventListener('mousemove', this.onConnectionDragMoved.bind(this));
    this.document.removeEventListener('mouseup', this.onConnectionDragEnded.bind(this));

    let createdConnection: BpaConnection | null = null;

    const dropElement = this.document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;

    if (dropElement && dropElement.classList.contains('input-joint') && this.draggedConnectionSourceNode) {
      const targetNodeElement = dropElement.closest('.workflow-node');
      if (targetNodeElement) {
        const targetNodeId = targetNodeElement.id;
        const targetNode = this.nodeMap.get(targetNodeId);

        if (targetNode && this.draggedConnectionSourceNode.id !== targetNode.id) {
          createdConnection = {
            source: {node: this.draggedConnectionSourceNode.id, output: 'main'},
            target: {node: targetNode.id, input: 'main'}
          };
          this.connectionCreated.emit(createdConnection);
        }
      }
    }

    this.draggedConnectionSourceNode = null;
    this.draggedConnectionEndPoint = null;
    this.snappedTargetNode = null;

    if (createdConnection) {
      this.highlightedConnectionId = this.getConnectionId(createdConnection);
      setTimeout(() => {
        this.highlightedConnectionId = null;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  onExecuteNode(node: BpaNodeWithId, event: any): void {
    event.stopPropagation();
    this.runningNodeIds.add(node.id);
    this.cdr.detectChanges();

    setTimeout(() => {
      this.runningNodeIds.delete(node.id);
      this.cdr.detectChanges();
    }, 3000);
  }

  onToggleNode(node: BpaNodeWithId, event: any): void {
    event.stopPropagation();
    node.status = node.status === ProcessNodeStatus.Active
      ? ProcessNodeStatus.Inactive
      : ProcessNodeStatus.Active;
    this.cdr.detectChanges();
  }

  onDeleteNode(nodeToDelete: BpaNodeWithId, event: any): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Node',
        message: `Are you sure you want to delete the node "${nodeToDelete.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.nodes && this.connections) {
        this.nodes = this.nodes.filter(node => node.id !== nodeToDelete.id);
        this.connections = this.connections.filter(conn =>
          conn.source.node !== nodeToDelete.id && conn.target.node !== nodeToDelete.id
        );
        this.cdr.detectChanges();
      }
    });
  }

  onNodeMenu(node: BpaNodeWithId, event: any): void {
    event.stopPropagation();
    alert(`Menu for node: ${node.name}`);
  }

  shouldShowNodeActions(node: BpaNodeWithId): boolean {
    return node.id === this.selectedNode?.id || node.id === this.hoveredNode?.id;
  }

  zoomFit(): void {
    if (!this.nodes || this.nodes.length === 0) {
      this.scale = 1;
      this.panX = 0;
      this.panY = 0;
      this.updateTransform();
      return;
    }

    const nodeWidth = 150;
    const nodeHeight = 150;
    const padding = 50;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of this.nodes) {
      minX = Math.min(minX, node.position[0]);
      minY = Math.min(minY, node.position[1]);
      maxX = Math.max(maxX, node.position[0] + nodeWidth);
      maxY = Math.max(maxY, node.position[1] + nodeHeight);
    }

    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewportWidth = rect.width;
    const viewportHeight = rect.height;

    const boundingBoxWidth = maxX - minX;
    const boundingBoxHeight = maxY - minY;

    const scaleX = (viewportWidth - 2 * padding) / boundingBoxWidth;
    const scaleY = (viewportHeight - 2 * padding) / boundingBoxHeight;

    this.scale = Math.min(scaleX, scaleY, 2); // Cap max zoom at 2x

    if (this.nodes.length === 1) {
      this.scale = 1; // For a single node, just center it at 1x zoom.
    }

    const centerX = minX + boundingBoxWidth / 2;
    const centerY = minY + boundingBoxHeight / 2;

    this.panX = viewportWidth / 2 - centerX * this.scale;
    this.panY = viewportHeight / 2 - centerY * this.scale;

    this.updateTransform();
  }

  zoomIn(): void {
    const newScale = this.scale * 1.2;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    this.panX = centerX - (centerX - this.panX) * (newScale / this.scale);
    this.panY = centerY - (centerY - this.panY) * (newScale / this.scale);
    this.scale = newScale;
    this.updateTransform();
  }

  zoomOut(): void {
    const newScale = this.scale / 1.2;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    this.panX = centerX - (centerX - this.panX) * (newScale / this.scale);
    this.panY = centerY - (centerY - this.panY) * (newScale / this.scale);
    this.scale = newScale;
    this.updateTransform();
  }

  tidyUp(): void {
    // TODO: Implement tidy up logic
    console.log('Tidy up clicked');
  }

  toggleShortcuts(): void {
    this.shortcuts = !this.shortcuts;
  }

  upload(): void {
    // TODO: Implement upload logic
    console.log('upload clicked');
  }

  download(): void {
    // TODO: Implement download logic
    console.log('download clicked');
  }

  save(): void {
    // TODO: Implement save logic
    console.log('save clicked');
  }

  add(): void {
    this.openNodePicker();
  }

  autoLayout(): void {
    this.autoLayoutRequested.emit();
  }

  getNotes(notes: string): string {
    return notes.length > 25 ? notes.slice(0, 24) + '...' : notes;
  }

  protected readonly NEW_BPMN = NEW_BPMN;
}
