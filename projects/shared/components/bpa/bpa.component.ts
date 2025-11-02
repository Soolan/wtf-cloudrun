import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MOCK_BPAS } from '@shared/constants';
import { BpaWithId, Bpa, BpaNode, BpaConnection } from '@shared/interfaces/bpa';
import { CompanyService } from '@shared/services';
import { BpaService } from '@shared/services/bpa.service';
import { BLANK_PERSONA } from '@shared/constants/members';
import { NOW } from '@shared/constants/timestamps';
import { ProcessNodeStatus } from '@shared/enums/bpa';

@Component({
  selector: 'lib-bpa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './bpa.component.html',
  styleUrls: ['./bpa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BpaComponent {
  private router = inject(Router);
  protected companyService = inject(CompanyService);
  private bpaService = inject(BpaService);

  workflows: BpaWithId[] = MOCK_BPAS;

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const n8nWorkflow = JSON.parse(e.target.result);
          console.log('Parsed n8n workflow (before transformation):', n8nWorkflow); // NEW LOG

          // Create a map of node names to node IDs
          const nodeIdMap: Map<string, string> = new Map();
          if (n8nWorkflow.nodes) {
            n8nWorkflow.nodes.forEach((node: any) => {
              nodeIdMap.set(node.name, node.id);
            });
          }

          const bpaWorkflow: Bpa = {
            name: n8nWorkflow.name || 'Imported Workflow',
            status: n8nWorkflow.active ? ProcessNodeStatus.Active : ProcessNodeStatus.Inactive,
            creator: { ...BLANK_PERSONA, name: 'Imported User' }, // Use 'name' property of Entity
            timestamps: NOW,
            connections: this.transformN8nConnections(n8nWorkflow.connections, nodeIdMap), // Pass nodeIdMap
            settings: n8nWorkflow.settings || {},
          };

          console.log('Transformed BPA workflow (before saving):', bpaWorkflow); // NEW LOG

          this.bpaService.saveBpaWorkflow(bpaWorkflow).subscribe(workflowId => {
            console.log('Workflow saved with ID:', workflowId);
            if (n8nWorkflow.nodes && n8nWorkflow.nodes.length > 0) {
              n8nWorkflow.nodes.forEach((n8nNode: any) => {
                const bpaNode: BpaNode = {
                  name: n8nNode.name,
                  icon: n8nNode.icon,
                  type: n8nNode.type,
                  nodeDefinitionId: n8nNode.nodeDefinitionId,
                  version: n8nNode.typeVersion,
                  status: n8nNode.status,
                  position: n8nNode.position,
                  parameters: n8nNode.parameters,
                  description: n8nNode.description,
                  ...(n8nNode.credentials !== undefined && { credentials: n8nNode.credentials }),
                };
                this.bpaService.saveBpaNode(workflowId, bpaNode, n8nNode.id).subscribe(nodeId => {
                  console.log(`Node ${nodeId} saved for workflow ${workflowId}`);
                });
              });
            }
            this.router.navigate(['console', this.companyService.id(), 'bpa', workflowId]).then();
          });

        } catch (error) {
          console.error('Detailed import error:', error); // MORE DETAILED ERROR LOG
          alert('Error importing workflow. Please ensure it\'s a valid n8n JSON file.');
        }
      };

      reader.readAsText(file);
    }
  }

  private transformN8nConnections(n8nConnections: any, nodeIdMap: Map<string, string>): BpaConnection[] {
    const connections: BpaConnection[] = [];
    for (const sourceNodeName in n8nConnections) {
      if (n8nConnections.hasOwnProperty(sourceNodeName)) {
        const outputs = n8nConnections[sourceNodeName];
        for (const outputName in outputs) {
          if (outputs.hasOwnProperty(outputName)) {
            const targets = outputs[outputName];
            targets.forEach((targetArray: any[]) => {
              // Handle cases where targetArray might be empty (e.g., for unconnected outputs)
              if (targetArray.length === 0) {
                // Optionally, log a warning or skip this connection
                return;
              }
              targetArray.forEach((target: any) => {
                const sourceNodeId = nodeIdMap.get(sourceNodeName);
                const targetNodeId = nodeIdMap.get(target.node);

                if (sourceNodeId && targetNodeId) {
                  connections.push({
                    source: { node: sourceNodeId, output: outputName },
                    target: { node: targetNodeId, input: target.type || 'main' } // n8n uses 'type' for input name
                  });
                } else {
                  console.warn(`Could not resolve node ID for connection: Source: ${sourceNodeName}, Target: ${target.node}`);
                }
              });
            });
          }
        }
      }
    }
    return connections;
  }

  viewWorkflow(workflowId: string): void {
    this.router.navigate(['console', this.companyService.id(), 'bpa', workflowId]).then();
  }

  createNewWorkflow(): void {
    alert('Create new workflow functionality is not yet implemented.');
  }
}

