import { Injectable, inject, signal } from '@angular/core';
import { Api, ApiWithId } from '@shared/interfaces';
import { CrudService } from '@shared/services/crud.service';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly crud = inject(CrudService);

  api = signal<ApiWithId | null>(null);
  apis = signal<ApiWithId[]>([]);

  constructor() { }

  /**
   * Sets the active API in the service's state.
   */
  setApi(api: ApiWithId | null): void {
    // Implementation to be added
  }

  /**
   * Adds a new API to the database.
   */
  addApi(data: Api): Promise<DocumentReference<DocumentData, DocumentData> | null> {
    // Implementation to be added
    return Promise.resolve(null);
  }

  /**
   * Updates an existing API.
   */
  updateApi(id: string, data: Partial<Api>): Promise<void> {
    // Implementation to be added
    return Promise.resolve();
  }

  /**
   * Deletes an API.
   */
  deleteApi(id: string): Promise<void> {
    // Implementation to be added
    return Promise.resolve();
  }

  /**
   * Resets the service state.
   */
  reset(): void {
    // Implementation to be added
  }
}
