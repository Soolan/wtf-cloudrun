# Instruction: Create a new shared Constants File

## Goal

This instruction guides the AI to create a new TypeScript file for exporting constants inside the `projects/shared/constants` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `constants` directory**: The primary location for constants is `projects/shared/constants/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/constants/index.ts`.
3.  **Analyze existing constants**: Review other constant files in the directory to understand existing coding style and naming conventions (e.g., `UPPER_SNAKE_CASE`).

## User Interaction

1.  **Ask for the constants file name**:
    *   Example: "What is the subject of these constants? (e.g., API, Roles, Messages)"
    *   The user will provide a name, like "API" or "Roles".

2.  **Ask for the constants themselves**:
    *   Example: "Please provide the constants you want to define. You can provide them as key-value pairs or a TypeScript object."
    *   User: `API_URL = 'https://api.example.com', MAX_RETRIES = 3`

## Execution Steps

1.  **Generate the constants file**:
    *   Create a new file with a `.ts` extension (e.g., `api.ts`).
    *   The file name should be kebab-case.
    *   Define and export the constants as requested by the user. Constant names should be in `UPPER_SNAKE_CASE`.

2.  **Update the barrel file**:
    *   Open `projects/shared/constants/index.ts`.
    *   Insert a new export statement for the newly created constants file in alphabetical order.
    *   Example: `export * from './api';`

## Example Constants File

Filename: `projects/shared/constants/api.ts`

```typescript
export const API_URL = 'https://api.example.com';
export const MAX_RETRIES = 3;
export const TIMEOUT = 15000;
```

## Example Barrel File Update

File: `projects/shared/constants/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./api";
export * from "./apis_in_use";
// ... other exports
```
