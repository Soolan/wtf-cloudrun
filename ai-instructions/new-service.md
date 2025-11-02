
# Instruction: Create a new shared Angular Service

## Goal

This instruction guides the AI to create a new, standalone Angular service inside the `projects/shared/services` directory. The service will be scaffolded with signals and blueprint methods based on a data model provided by the user, and it will be properly exported from the barrel file (`index.ts`).

## Pre-computation Analysis

1.  **Identify the `services` directory**: The primary location for services is `projects/shared/services/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/services/index.ts`.
3.  **Analyze existing services**: Review other services to understand conventions for state management (`signal`), dependency injection (`inject`), and method naming.

## User Interaction

1.  **Ask for the service name**:
    *   Example: "What would you like to name the service?"
    *   User: "company"

2.  **Ask for the primary data model/entity**:
    *   Example: "What is the primary data model or entity this service will manage? (e.g., Company, User, Product)"
    *   User: "Company"
    *   *AI Note: The model name will be used to name signals and methods (e.g., `company`, `addCompany`).*

3.  **Ask about dependencies**:
    *   Example: "Should I inject any other services? If so, please list them."
    *   User: "CrudService, AuthService"

## Execution Steps

1.  **Generate the service file**:
    *   Create a file with the `.service.ts` extension (e.g., `company.service.ts`).
    *   Create a class with a `Service` suffix (e.g., `CompanyService`).
    *   The service must be `providedIn: 'root'`.
    *   Inject any specified dependencies using the `inject()` function.
    *   Define signals to hold the state for the specified data model (e.g., `company = signal<CompanyWithId | null>(null);`).
    *   Scaffold blueprint methods for common operations (add, update, delete, reset). The method bodies should be empty.

2.  **Update the barrel file**:
    *   Open `projects/shared/services/index.ts`.
    *   Insert the new export statement in alphabetical order to maintain a clean and predictable file structure.
    *   Example: `export * from './user-profile.service';`

## Example Service File

User inputs:
*   Service Name: "company"
*   Data Model: "Company"
*   Dependencies: "CrudService, AuthService"

Filename: `projects/shared/services/company.service.ts`

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { Company, CompanyWithId } from '@shared/interfaces';
import { CrudService } from '@shared/services/crud.service';
import { AuthService } from '@shared/services/auth.service';
import { DocumentReference, DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly crud = inject(CrudService);
  private readonly auth = inject(AuthService);

  company = signal<CompanyWithId | null>(null);
  // other signals can be added here e.g. companies = signal<CompanyWithId[]>([]);

  constructor() { }

  // Blueprint methods
  
  /**
   * Sets the active company in the service's state.
   */
  setCompany(company: CompanyWithId | null): void {
    // Implementation to be added
  }

  /**
   * Adds a new company to the database.
   */
  addCompany(data: Company): Promise<DocumentReference<DocumentData, DocumentData> | null> {
    // Implementation to be added
    return Promise.resolve(null);
  }

  /**
   * Updates an existing company.
   */
  updateCompany(id: string, data: Partial<Company>): Promise<void> {
    // Implementation to be added
    return Promise.resolve();
  }

  /**
   * Deletes a company.
   */
  deleteCompany(id: string): Promise<void> {
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
```

## Example Barrel File Update

File: `projects/shared/services/index.ts`

```typescript
// Add the new export to the end of the file
export * from './company.service';
```
