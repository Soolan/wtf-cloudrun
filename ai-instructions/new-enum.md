# Instruction: Create a new shared TypeScript Enum

## Goal

This instruction guides the AI to create a new TypeScript enum file inside the `projects/shared/enums` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `enums` directory**: The primary location for enums is `projects/shared/enums/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/enums/index.ts`.
3.  **Analyze existing enums**: Review other enums in the directory to understand existing coding style and naming conventions.

## User Interaction

1.  **Ask for the enum name**:
    *   Example: "What would you like to name the enum?"
    *   The user will provide a name, like "AuthAction" or "OrderStatus".

2.  **Ask for the enum members**:
    *   Example: "What are the members of this enum? (comma-separated)"
    *   User: "Pending, Processing, Shipped, Delivered"

## Execution Steps

1.  **Generate the enum file**:
    *   Create a new file with a `.ts` extension (e.g., `order-status.ts`).
    *   The file name should be kebab-case.
    *   The enum name should be PascalCase (e.g., `OrderStatus`).
    *   Populate the enum with the members provided by the user.

2.  **Update the barrel file**:
    *   Open `projects/shared/enums/index.ts`.
    *   Insert a new export statement for the newly created enum in alphabetical order.
    *   Example: `export * from './order-status';`

## Example Enum File

Filename: `projects/shared/enums/order-status.ts`

```typescript
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
}
```

## Example Barrel File Update

File: `projects/shared/enums/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./auth-action";
export * from "./order-status";
// ... other exports
```
