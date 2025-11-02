# Instruction: Create a new shared Angular Dialog Component

## Goal

This instruction guides the AI to create a new, standalone Angular component intended for use as a Material Dialog. The component will be created inside the `projects/shared/dialogs` directory and exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `dialogs` directory**: The primary location for dialogs is `projects/shared/dialogs/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/dialogs/index.ts`.
3.  **Analyze existing dialogs**: Review other dialog components to understand the structure, common imports from `@angular/material/dialog`, and how `MatDialogRef` and `MAT_DIALOG_DATA` are used.

## User Interaction

1.  **Ask for the dialog name**:
    *   Example: "What would you like to name the dialog component? (e.g., Confirm, EditUser)"
    *   The user will provide a name.

## Execution Steps

1.  **Generate the component file**:
    *   Create a new file with the `.component.ts` extension (e.g., `confirm.component.ts`).
    *   The file name should be kebab-case.
    *   The class name should be PascalCase and end with `Component` (e.g., `ConfirmComponent`).
    *   The component should be `standalone: true` and import necessary Material Dialog modules.
    *   Inject `MatDialogRef` and `MAT_DIALOG_DATA` into the component.

2.  **Generate the HTML template**:
    *   Create a corresponding `.component.html` file.
    *   The template should include standard dialog elements like `mat-dialog-title`, `mat-dialog-content`, and `mat-dialog-actions`.

3.  **Update the barrel file**:
    *   Open `projects/shared/dialogs/index.ts`.
    *   Insert a new export statement for the newly created dialog component in alphabetical order.
    *   Example: `export * from './confirm/confirm.component';`

## Example Dialog Component File

Filename: `projects/shared/dialogs/confirm/confirm.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmComponent {
  private dialogRef = inject(MatDialogRef<ConfirmComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { title: string; message: string; };

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
```

## Example Dialog Template File

Filename: `projects/shared/dialogs/confirm/confirm.component.html`

```html
<h1 mat-dialog-title>{{ data.title }}</h1>
<div mat-dialog-content>
  <p>{{ data.message }}</p>
</div>
<div mat-dialog-actions align="end">
  <button mat-button (click)="onDismiss()">Cancel</button>
  <button mat-button color="primary" (click)="onConfirm()" cdkFocusInitial>Confirm</button>
</div>
```

## Example Barrel File Update

File: `projects/shared/dialogs/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./authentication/authentication.component";
export * from "./confirm/confirm.component";
// ... other exports
```
