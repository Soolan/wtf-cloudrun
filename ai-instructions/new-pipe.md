# Instruction: Create a new shared Angular Pipe

## Goal

This instruction guides the AI to create a new, standalone Angular pipe inside the `projects/shared/pipes` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `pipes` directory**: The primary location for pipes is `projects/shared/pipes/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/pipes/index.ts`.
3.  **Analyze existing pipes**: Review other pipes in the directory to understand existing coding style and naming conventions.

## User Interaction

1.  **Ask for the pipe name**:
    *   Example: "What would you like to name the pipe?"
    *   The user will provide a name, like "slugify" or "urlName".

## Execution Steps

1.  **Generate the pipe file**:
    *   Create a new file with the `.pipe.ts` extension (e.g., `slugify.pipe.ts`).
    *   The file name should be kebab-case.
    *   The class name should be PascalCase (e.g., `SlugifyPipe`).
    *   The pipe's `name` property in the decorator should be camelCase (e.g., `slugify`).
    *   The pipe should be `standalone: true`.

2.  **Update the barrel file**:
    *   Open `projects/shared/pipes/index.ts`.
    *   Insert a new export statement for the newly created pipe in alphabetical order.
    *   Example: `export * from './slugify.pipe';`

## Example Pipe File

Filename: `projects/shared/pipes/slugify.pipe.ts`

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slugify',
  standalone: true
})
export class SlugifyPipe implements PipeTransform {
  transform(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
```

## Example Barrel File Update

File: `projects/shared/pipes/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from './slugify.pipe';
export * from './storage-url.pipe';
```
