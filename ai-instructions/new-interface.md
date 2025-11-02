# Instruction: Create a new shared TypeScript Interface

## Goal

This instruction guides the AI to create a new TypeScript interface file inside the `projects/shared/interfaces` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `interfaces` directory**: The primary location for interfaces is `projects/shared/interfaces/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/interfaces/index.ts`.
3.  **Analyze existing interfaces**: Review other interfaces in the directory to understand existing coding style and naming conventions.

## User Interaction

1.  **Ask for the interface name**:
    *   Example: "What would you like to name the interface?"
    *   The user will provide a name, like "UserProfile" or "OrderItem".

## Execution Steps

1.  **Generate the interface file**:
    *   Create a new file with a `.ts` extension (e.g., `user-profile.ts`).
    *   The file name should be kebab-case.
    *   The interface name should be PascalCase (e.g., `UserProfile`).
    *   The AI should ask for the properties of the interface or generate a sensible default based on the name.

2.  **Update the barrel file**:
    *   Open `projects/shared/interfaces/index.ts`.
    *   Insert a new export statement for the newly created interface in alphabetical order.
    *   Example: `export * from './user-profile';`

## Example Interface File

Filename: `projects/shared/interfaces/user-profile.ts`

```typescript
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
```

## Example Barrel File Update

File: `projects/shared/interfaces/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./api";
export * from "./user-profile";
// ... other exports
```
