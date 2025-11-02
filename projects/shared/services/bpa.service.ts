import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, query, where, addDoc, setDoc } from '@angular/fire/firestore'; // Add addDoc, setDoc
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bpa, BpaWithId, BpaNode, BpaNodeWithId, BpaConnection, ConnectionEndpoints } from '@shared/interfaces/bpa';
import { MOCK_BPAS, MOCK_BPA_NODES } from '@shared/constants/bpas';

@Injectable({
  providedIn: 'root'
})
export class BpaService {
  private firestore = inject(Firestore);

  constructor() { }

  getBpaWorkflow(workflowId: string): Observable<BpaWithId | null> {
    if (workflowId === 'workflow-001') {
      const mockWorkflow = MOCK_BPAS.find(w => w.id === workflowId) || null;
      return of(mockWorkflow);
    }
    const workflowDocRef = doc(this.firestore, `bpa-workflows/${workflowId}`);
    return from(getDoc(workflowDocRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...(snapshot.data() as Bpa) };
        } else {
          return null;
        }
      })
    );
  }

  saveBpaWorkflow(workflow: Bpa, workflowId?: string): Observable<string> {
    const workflowsCollectionRef = collection(this.firestore, 'bpa-workflows');
    let docRef;
    if (workflowId) {
      docRef = doc(this.firestore, `bpa-workflows/${workflowId}`);
      return from(setDoc(docRef, workflow)).pipe(map(() => workflowId));
    } else {
      return from(addDoc(workflowsCollectionRef, workflow)).pipe(map(res => res.id));
    }
  }

  getBpaNodes(workflowId: string): Observable<BpaNodeWithId[]> {
    if (workflowId === 'workflow-001') {
      return of(MOCK_BPA_NODES);
    }
    const nodesCollectionRef = collection(this.firestore, `bpa-workflows/${workflowId}/nodes`);
    return from(getDocs(nodesCollectionRef)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as BpaNode) }));
      })
    );
  }

  saveBpaNode(workflowId: string, node: BpaNode, nodeId?: string): Observable<string> {
    const nodesCollectionRef = collection(this.firestore, `bpa-workflows/${workflowId}/nodes`);
    let docRef;
    if (nodeId) {
      docRef = doc(this.firestore, `bpa-workflows/${workflowId}/nodes/${nodeId}`);
      return from(setDoc(docRef, node)).pipe(map(() => nodeId));
    } else {
      return from(addDoc(nodesCollectionRef, node)).pipe(map(res => res.id));
    }
  }

  getConnectionEndpoints(connection: BpaConnection, nodes: BpaNodeWithId[]): ConnectionEndpoints | null {
    const nodeMap = new Map<string, BpaNodeWithId>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    const sourceNode = nodeMap.get(connection.source.node);
    const targetNode = nodeMap.get(connection.target.node);

    if (!sourceNode || !targetNode) {
      return null;
    }

    const nodeWidth = 150;
    const nodeHeight = 150;

    // Define offsets for the joints
    const outputJointOffset = 12; // Increased by 50% (8 * 1.5)
    const inputJointOffset = 24;  // Increased by 50% (16 * 1.5)

    const startX = sourceNode.position[0] + nodeWidth + outputJointOffset - 17;
    const startY = sourceNode.position[1] + nodeHeight / 2;
    const endX = targetNode.position[0] - inputJointOffset + 17;
    const endY = targetNode.position[1] + nodeHeight / 2;

    return { startX, startY, endX, endY };
  }
}
