import {ChangeDetectionStrategy, Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Observable, combineLatest, of} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {BpaCanvasComponent} from '@shared/components';
import {BpaService} from '@shared/services';
import {BpaWithId, BpaNodeWithId, BpaConnection, BpaNode} from '@shared/interfaces/bpa';

@Component({
  selector: 'lib-bpa-editor',
  standalone: true,
  imports: [CommonModule, BpaCanvasComponent],
  templateUrl: './bpa-editor.component.html',
  styleUrls: ['./bpa-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BpaEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bpaService = inject(BpaService);

  workflowId: string | null = null;
  workflow$: Observable<BpaWithId | null> | null = null;
  nodes$: Observable<BpaNodeWithId[]> | null = null;
  selectedNode: BpaNodeWithId | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.workflowId = params.get('workflowId');
      if (this.workflowId) {
        this.workflow$ = this.bpaService.getBpaWorkflow(this.workflowId);
        this.nodes$ = this.bpaService.getBpaNodes(this.workflowId).pipe(
          map(nodes => {
            const sortedNodes = [...nodes].sort((a, b) => a.position[0] - b.position[0]);
            const minDistance = 150 + 200; // Node width + desired gap (increased from 100 to 200)

            let currentRightmostX = 100; // Start the first node at X=100

            const adjustedNodes = sortedNodes.map((node, index) => {
              let newX: number;
              if (index === 0) {
                newX = 100; // Fixed starting X for the first node
              } else {
                newX = currentRightmostX; // Place subsequent nodes based on previous adjusted node
              }

              currentRightmostX = newX + minDistance; // Update for the next node

              return {
                ...node,
                position: [newX, node.position[1]] as [number, number]
              };
            });
            return adjustedNodes;
          })
        );
      }
    });
  }

  onNodeSelected(node: BpaNodeWithId): void {
    this.selectedNode = node;
  }

  onSaveWorkflow(): void {
    alert('Save workflow clicked!');
    // TODO: Implement save logic
  }

  onRunWorkflow(): void {
    alert('Run workflow clicked!');
    // TODO: Implement run logic
  }

  onImportWorkflow(file: File): void {
    alert(`Import workflow clicked! File: ${file.name}`);
    // TODO: Implement import logic
  }

  onExportWorkflow(): void {
    alert('Export workflow clicked!');
    // TODO: Implement export logic
  }

  onNodeMoved(event: { nodeId: string, position: [number, number] }): void {
    console.log('Node moved:', event);
    // Here you would typically call a service to update the node's position in the backend.
    // For example: this.bpaService.updateNodePosition(this.workflowId, event.nodeId, event.position);
  }

  onConnectionDeleted(connectionToDelete: BpaConnection): void {
    if (this.workflow$) {
      this.workflow$ = this.workflow$.pipe(
        map(workflow => {
          if (workflow) {
            return {
              ...workflow,
              connections: workflow.connections.filter(c =>
                !(c.source.node === connectionToDelete.source.node &&
                  c.source.output === connectionToDelete.source.output &&
                  c.target.node === connectionToDelete.target.node &&
                  c.target.input === connectionToDelete.target.input)
              )
            };
          }
          return workflow;
        })
      );
    }
  }

  onNodeAdded(event: { node: BpaNode, connection?: BpaConnection }): void {
    if (this.workflowId) {
      // This is a simplified implementation.
      // A real implementation would call the service to save the new node and get a real ID.
      const newNodeId = `node-${Math.random().toString(36).substr(2, 9)}`;
      const newNode: BpaNodeWithId = { ...event.node, id: newNodeId };

      // Add the new node to the nodes$ observable
      if (this.nodes$) {
        this.nodes$ = this.nodes$.pipe(
          map(nodes => [...nodes, newNode])
        );
      }

      // If there's a connection, add it to the workflow$ observable
      if (event.connection && this.workflow$) {
        const newConnection: BpaConnection = {
          source: event.connection.source,
          target: { node: newNodeId, input: 'main' }
        };

        this.workflow$ = this.workflow$.pipe(
          map(workflow => {
            if (workflow) {
              return {
                ...workflow,
                connections: [...workflow.connections, newConnection]
              };
            }
            return workflow;
          })
        );
      }
    }
  }

  onConnectionCreated(newConnection: BpaConnection): void {
    if (this.workflow$) {
      this.workflow$ = this.workflow$.pipe(
        map(workflow => {
          if (workflow) {
            // Check for duplicate connection before adding
            const isDuplicate = workflow.connections.some(existingConn =>
              existingConn.source.node === newConnection.source.node &&
              existingConn.source.output === newConnection.source.output &&
              existingConn.target.node === newConnection.target.node &&
              existingConn.target.input === newConnection.target.input
            );

            if (!isDuplicate) {
              return {
                ...workflow,
                connections: [...workflow.connections, newConnection]
              };
            }
          }
          return workflow;
        })
      );
    }
  }

      onNodeInsertedBetweenConnections(event: { newNode: BpaNode, oldConnection: BpaConnection, newConnection1: BpaConnection, newConnection2: BpaConnection }): void {
    if (this.workflowId && this.nodes$ && this.workflow$) {
      combineLatest([this.nodes$, this.workflow$]).pipe(
        take(1),
        map(([nodes, workflow]) => {
          if (!nodes || !workflow) { return; }

          // 1. Prepare the new node
          const newNodeId = `node-${Math.random().toString(36).substring(2, 11)}`;
          const newNodeWithId: BpaNodeWithId = { ...event.newNode, id: newNodeId };

          // 2. Update connections
          const updatedConnections = workflow.connections.filter(c =>
            !(c.source.node === event.oldConnection.source.node &&
              c.source.output === event.oldConnection.source.output &&
              c.target.node === event.oldConnection.target.node &&
              c.target.input === event.oldConnection.target.input)
          );
          const finalNewConnection1: BpaConnection = {
            source: event.newConnection1.source,
            target: { node: newNodeId, input: event.newConnection1.target.input }
          };
          const finalNewConnection2: BpaConnection = {
            source: { node: newNodeId, output: event.newConnection2.source.output },
            target: event.newConnection2.target
          };
          const updatedConnectionsAfterAdd = [...updatedConnections, finalNewConnection1, finalNewConnection2];

          // 3. Identify nodes to shift
          const originalTargetNodeId = event.oldConnection.target.node;
          const downstreamNodeIds = this._getDownstreamNodes(originalTargetNodeId, nodes, workflow.connections);
          const shiftAmount = 250; // Node width (150) + gap (100)

          // 4. Update positions of existing nodes
          let updatedNodes = nodes.map(node => {
            if (downstreamNodeIds.has(node.id)) {
              return {
                ...node,
                position: [node.position[0] + shiftAmount, node.position[1]] as [number, number]
              };
            }
            return node;
          });

          // 5. Add the new node with its correctly shifted position
          const finalNewNodePosition: [number, number] = [
            newNodeWithId.position[0] + shiftAmount / 2,
            newNodeWithId.position[1]
          ];
          updatedNodes.push({ ...newNodeWithId, position: finalNewNodePosition });

          // 6. Update the observables
          this.nodes$ = of(updatedNodes);
          this.workflow$ = of({ ...workflow, connections: updatedConnectionsAfterAdd });
        })
      ).subscribe();
    }
  }

  onAutoLayout(): void {
    if (!this.nodes$ || !this.workflow$) {
      return;
    }

    combineLatest([this.nodes$, this.workflow$]).pipe(
      take(1),
      map(([nodes, workflow]) => {
        if (!nodes || !workflow || nodes.length === 0) {
          return;
        }

        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const adj: { [key: string]: string[] } = {};
        const inDegree: { [key: string]: number } = {};

        for (const node of nodes) {
          adj[node.id] = [];
          inDegree[node.id] = 0;
        }

        for (const conn of workflow.connections) {
          if (adj[conn.source.node]) {
            adj[conn.source.node].push(conn.target.node);
            inDegree[conn.target.node]++;
          }
        }

        const queue: string[] = [];
        for (const nodeId in inDegree) {
          if (inDegree[nodeId] === 0) {
            queue.push(nodeId);
          }
        }

        const columns: string[][] = [];
        let processedNodeCount = 0;

        while (queue.length > 0) {
          const levelSize = queue.length;
          const currentColumn: string[] = [];
          for (let i = 0; i < levelSize; i++) {
            const u = queue.shift()!;
            currentColumn.push(u);
            processedNodeCount++;

            if (adj[u]) {
              for (const v of adj[u]) {
                inDegree[v]--;
                if (inDegree[v] === 0) {
                  queue.push(v);
                }
              }
            }
          }
          columns.push(currentColumn);
        }

        const horizontalGap = 250;
        const verticalGap = 100;
        const nodeHeight = 150;

        const updatedNodes: BpaNodeWithId[] = [];

        let maxNodesInColumn = 0;
        for (const column of columns) {
            maxNodesInColumn = Math.max(maxNodesInColumn, column.length);
        }
        const maxColumnHeight = maxNodesInColumn * (nodeHeight + verticalGap) - verticalGap;


        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          const columnHeight = column.length * (nodeHeight + verticalGap) - verticalGap;
          const yOffset = (maxColumnHeight - columnHeight) / 2;

          for (let j = 0; j < column.length; j++) {
            const nodeId = column[j];
            const originalNode = nodeMap.get(nodeId);
            if (originalNode) {
              updatedNodes.push({
                ...originalNode,
                position: [
                  100 + i * horizontalGap,
                  100 + yOffset + j * (nodeHeight + verticalGap)
                ]
              });
            }
          }
        }

        // Handle nodes in cycles or disconnected components
        if (processedNodeCount < nodes.length) {
            const unplacedNodes = nodes.filter(n => !updatedNodes.find(un => un.id === n.id));
            let xOffset = columns.length * horizontalGap;
            for(const node of unplacedNodes) {
                updatedNodes.push({
                    ...node,
                    position: [100 + xOffset, 100]
                });
                xOffset += horizontalGap;
            }
        }


        this.nodes$ = of(updatedNodes);
      })
    ).subscribe();
  }


  private _getDownstreamNodes(startNodeId: string, allNodes: BpaNodeWithId[], allConnections: BpaConnection[]): Set<string> {
    const downstreamNodes = new Set<string>();
    const queue: string[] = [startNodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      if (!currentNodeId || visited.has(currentNodeId)) {
        continue;
      }

      visited.add(currentNodeId);
      downstreamNodes.add(currentNodeId);

      // Find all connections where currentNodeId is the source
      const outgoingConnections = allConnections.filter(conn => conn.source.node === currentNodeId);

      for (const conn of outgoingConnections) {
        if (!visited.has(conn.target.node)) {
          queue.push(conn.target.node);
        }
      }
    }
    return downstreamNodes;
  }
}
