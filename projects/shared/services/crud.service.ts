import {
  Firestore, Query, DocumentReference, collection,
  doc, writeBatch, addDoc, deleteDoc, updateDoc,
  getDoc, getDocs, setDoc, getCountFromServer,
  collectionData, docData, query, where, orderBy, limit,
  CollectionReference,
  arrayUnion,
  onSnapshot
} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError, Observable, of} from 'rxjs';
import {WtfQuery} from '@shared/interfaces/wtf-query';
import {KeyValue} from '@angular/common';
import {inject, Injectable, NgZone, signal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class CrudService {
  private readonly db = inject(Firestore);
  private readonly snackbar = inject(MatSnackBar);
  private batchSignal = signal<ReturnType<typeof writeBatch> | null>(null);

  initBatch(): void {
    this.batchSignal.set(writeBatch(this.db));
  }

  batchSet(col: string, docId: string, data: any): void {
    const batch = this.batchSignal();
    if (!batch) throw new Error('Batch not initialized');
    const docRef = docId ? doc(this.db, col, docId) : doc(collection(this.db, col));
    batch.set(docRef, data);
  }

  batchDelete(col: string, docId: string): void {
    const batch = this.batchSignal();
    if (!batch) throw new Error('Batch not initialized');
    const docRef = doc(this.db, col, docId);
    batch.delete(docRef);
  }

  batchUpdate(col: string, docId: string, data: any): void {
    const batch = this.batchSignal();
    if (!batch) throw new Error('Batch not initialized');
    const docRef = doc(this.db, col, docId);
    batch.update(docRef, data);
  }

  commitBatch(): Promise<void> {
    const batch = this.batchSignal();
    if (!batch) throw new Error('Batch not initialized');
    return batch.commit();
  }

  getDocRef(col: string, docId: string): DocumentReference {
    return doc(this.db, col, docId);
  }

  getColRef(col: string): CollectionReference {
    return collection(this.db, col);
  }

  async getDoc(col: string, docId: string, silent = false): Promise<any | null> {
    try {
      const ref = this.getDocRef(col, docId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      if (!silent) this.snackbar.open('No such document!', 'X', {duration: 4000});
      return null;
    } catch (error) {
      this.handleError(error, 'Error fetching document', silent);
      return null;
    }
  }

  async update(col: string, docId: string, data: any): Promise<void> {
    try {
      await updateDoc(this.getDocRef(col, docId), data);
    } catch (error) {
      this.handleError(error, 'Error updating document');
    }
  }

  async updateAppend(col: string, docId: string, data: KeyValue<string, string>): Promise<void> {
    try {
      await updateDoc(this.getDocRef(col, docId), {[data.key]: arrayUnion(data.value)});
    } catch (error) {
      this.handleError(error, 'Error updating document');
    }
  }

  async add(col: string, data: any): Promise<DocumentReference | null> {
    // return await addDoc(collection(this.db, col), data);
    try {
      return await addDoc(collection(this.db, col), data);
    } catch (error) {
      this.handleError(error, 'Error adding document');
      return null;
    }
  }

  async set(col: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = this.getDocRef(col, docId);
      await setDoc(docRef, data);
    } catch (error) {
      this.handleError(error, 'Error setting document');
    }
  }

  async getDocs(q: WtfQuery, withId = false, useQuery = false, silent = false): Promise<any[] | null> {
    try {
      const colRef = this.getColRef(q.path);
      const queryRef = useQuery ? this.buildQuery(colRef, q) : colRef;
      const snap = await getDocs(queryRef);
      return snap.docs.map(doc => withId ? {id: doc.id, ...doc.data()} : doc.data());
    } catch (error) {
      this.handleError(error, 'Error fetching documents', silent);
      return null;
    }
  }

  getStream(q: WtfQuery, withId: boolean = false): Observable<any[]> {
    const colRef = collection(this.db, q.path);
    return collectionData<any>(this.buildQuery(colRef, q), {idField: withId ? 'id' : undefined}).pipe(
      catchError(error => {
        this.handleError(error, 'Error fetching stream');
        return of([]);
      })
    );
  }

  // listen to doc updates in real time
  doc$<T>(path: string): Observable<T | undefined> {
    const docRef = doc(this.db, path) as DocumentReference<T>;
    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = {...snapshot.data(), id: snapshot.id};
            subscriber.next(data as T);
          } else {
            subscriber.next(undefined);
          }
        },
        (error) => {
          this.handleError(error, 'Error in document stream');
          subscriber.error(error);
        }
      );
      return () => unsubscribe();
    });
  }

  delete(col: string, docId: string): void {
    deleteDoc(this.getDocRef(col, docId))
      .then(() => this.snackbar.open('Deleted successfully!', 'X', {duration: 2000}))
      .catch(error => this.handleError(error, 'Error deleting document'));
  }

  async count(col: string): Promise<number> {
    try {
      const snapshot = await getCountFromServer(collection(this.db, col));
      return snapshot.data().count;
    } catch (error) {
      this.handleError(error, 'Error counting documents');
      return 0;
    }
  }

  async countQuery(query: WtfQuery): Promise<number> {
    try {
      const snapshot = await getCountFromServer(this.buildQuery(collection(this.db, query.path), query));
      return snapshot.data().count;
    } catch (error) {
      this.handleError(error, 'Error counting query results');
      return 0;
    }
  }

  async colExists(path: string): Promise<boolean> {
    try {
      const colRef = collection(this.db, path);
      const q: WtfQuery = {path, limit: 1};
      const query = this.buildQuery(colRef, q);
      const snapshot = await getDocs(query);
      return !snapshot.empty;
    } catch (error) {
      this.handleError(error, 'Error checking collection existence');
      return false;
    }
  }

  private buildQuery(colRef: CollectionReference, q: WtfQuery): Query {
    let queryRef: Query = colRef; // Start with the collection reference
    if (q.where) queryRef = query(queryRef, where(q.where.field, q.where.operator, q.where.value));
    if (q.orderBy) queryRef = query(queryRef, orderBy(q.orderBy.field, q.orderBy.direction));
    if (q.limit) queryRef = query(queryRef, limit(q.limit));
    return queryRef;
  }

  async getDocRefs(path: string): Promise<DocumentReference[]> {
    try {
      const colRef = collection(this.db, path);
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.ref);
    } catch (error) {
      this.handleError(error, 'Error fetching document references');
      return [];
    }
  }

  async deleteAllRefs(refs: DocumentReference[]): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      for (const ref of refs) {
        batch.delete(ref);
      }
      await batch.commit();
    } catch (error) {
      this.handleError(error, 'Error deleting document references');
    }
  }


  private handleError(error: any, message: string, silent = false): void {
    console.error(error);
    if (!silent) this.snackbar.open(message, 'X', {duration: 4000});
  }
}
