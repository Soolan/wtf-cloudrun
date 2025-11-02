# Instruction: Create a new shared Angular Route Guard

## Goal

This instruction guides the AI to create a new, functional Angular route guard inside the `projects/shared/guards` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `guards` directory**: The primary location for guards is `projects/shared/guards/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/guards/index.ts`.
3.  **Analyze existing guards**: Review other guards in the directory to understand the structure. Modern Angular guards are typically functions (`CanActivateFn`) rather than classes.

## User Interaction

1.  **Ask for the guard name**:
    *   Example: "What would you like to name the guard? (e.g., Auth, Admin)"
    *   The user will provide a name.

## Execution Steps

1.  **Generate the guard file**:
    *   Create a new file with the `.guard.ts` extension (e.g., `auth.guard.ts`).
    *   The file name should be kebab-case.
    *   The exported guard function should be in `UPPER_SNAKE_CASE` with a `_GUARD` suffix (e.g., `AUTH_GUARD`).
    *   The guard should be a `CanActivateFn` function.
    *   Inject necessary services like `AuthService` and `Router` to perform the required checks.

2.  **Update the barrel file**:
    *   Open `projects/shared/guards/index.ts`.
    *   Insert a new export statement for the newly created guard file in alphabetical order.
    *   Example: `export * from './auth.guard';`

## Example Guard File

Filename: `projects/shared/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@shared/services';
import { firstValueFrom } from 'rxjs';

export const AUTH_GUARD: CanActivateFn = async (): Promise<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await firstValueFrom(authService.user$);

  if (user) {
    return true; // User is logged in
  }

  // Redirect to the login page
  return router.navigate(['/login']);
};
```

## Example Barrel File Update

File: `projects/shared/guards/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./auth.guard";
export * from "./init.guard";
```
