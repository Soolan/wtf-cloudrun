# Instruction: Create a new shared Angular Directive

## Goal

This instruction guides the AI to create a new, standalone Angular directive inside the `projects/shared/directives` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `directives` directory**: The primary location for directives is `projects/shared/directives/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/directives/index.ts`.
3.  **Analyze existing directives**: Review other directives in the directory to understand existing coding style, naming conventions, and selectors.

## User Interaction

1.  **Ask for the directive name**:
    *   Example: "What would you like to name the directive?"
    *   The user will provide a name, like "dropzone" or "highlight".

## Execution Steps

1.  **Generate the directive file**:
    *   Create a new file with the `.directive.ts` extension (e.g., `dropzone.directive.ts`).
    *   The file name should be kebab-case.
    *   The class name should be PascalCase (e.g., `DropzoneDirective`).
    *   The selector should be camelCase, prefixed with `lib` and enclosed in square brackets (e.g., `[libDropzone]`).
    *   The directive should be `standalone: true`.

2.  **Update the barrel file**:
    *   Open `projects/shared/directives/index.ts`.
    *   Insert a new export statement for the newly created directive in alphabetical order.
    *   Example: `export * from './dropzone.directive';`

## Example Directive File

Filename: `projects/shared/directives/dropzone.directive.ts`

```typescript
import { Directive, EventEmitter, Output, HostListener } from '@angular/core';

@Directive({
  selector: '[libDropzone]',
  standalone: true
})
export class DropzoneDirective {
  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.hovered.emit(true);
  }

  @HostListener('dragleave')
  onDragLeave(): void {
    this.hovered.emit(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.dropped.emit(files);
    }
    this.hovered.emit(false);
  }
}
```

## Example Barrel File Update

File: `projects/shared/directives/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./black-renderer.directive";
export * from "./dropzone.directive";
```
