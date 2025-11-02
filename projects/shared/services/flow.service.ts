import {inject, Injectable} from '@angular/core';
import {Flow, FlowState} from '@shared/interfaces';
import {CrudService} from '@shared/services/crud.service';
import {FlowStatus} from "@shared/enums";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class FlowService {
  private readonly crud = inject(CrudService);

  constructor() { }

  /**
   * Adds a new flow to the database.
   * @param flowData The initial data for the flow document.
   */
  async addFlow(flowData: Partial<Flow>): Promise<string> {
    const initialFlow: Flow = {
      function: 'unknown',
      created_at: Date.now(),
      status: FlowStatus.Running,
      progress: 5,
      messages: ['Initializing...'],
      path: '',
      ...flowData
    };

    const flowDocRef = await this.crud.add('flows', initialFlow);
    if (!flowDocRef) {
      throw new Error('Failed to create flow document.');
    }
    console.log('📄 Created flow doc:', flowDocRef?.id);
    return flowDocRef.id;
  }

  /**
   * Monitors a flow's progress and status.
   * @param flowId The ID of the flow to monitor.
   * @returns An observable that emits the current state of the flow.
   */

  monitorFlow(flowId: string): Observable<FlowState> {
    if (!flowId || typeof flowId !== 'string') {
      console.error('❌ monitorFlow called with invalid flowId:', flowId);
      throw new Error(`Invalid flowId: ${flowId}`);
    }
    const path = `flows/${flowId}`;
    console.log('✅ Listening to', path);

    return this.crud.doc$<Flow>(path).pipe(
      map(flow => {
        if (!flow) {
          return {
            messages: [],
            progress: 0,
            status: FlowStatus.Error,
            error: 'Flow document not found.',
            docId: flowId
          };
        }
        return {
          messages: flow.messages,
          progress: flow.progress / 100,
          status: flow.status,
          result: flow.result,
          error: flow.error,
          docId: flowId
        };
      })
    );
  }
}
