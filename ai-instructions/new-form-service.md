# Instruction: Create a new shared Angular Form Service

## Goal

This instruction guides the AI to create a new, injectable Angular service that manages a `FormGroup` instance. The service will be created inside the `projects/shared/forms` directory and exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `forms` directory**: The primary location for form services is `projects/shared/forms/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/forms/index.ts`.
3.  **Analyze existing form services**: Review other form services to understand the structure, such as how `FormBuilder` is used and how form groups are defined.

## User Interaction

1.  **Ask for the form's purpose**:
    *   Example: "What data model will this form be for? (e.g., Ticket, UserProfile)"
    *   The user will provide a name, like "Ticket".

2.  **Ask for the form fields**:
    *   Example: "Please provide the fields for the form, or I can infer them from an existing interface if you provide the path."
    *   The AI can then generate the `FormGroup` structure based on the fields.

## Execution Steps

1.  **Generate the form service file**:
    *   Create a new file with the `.form.service.ts` extension (e.g., `ticket-form.service.ts`).
    *   The file name should be kebab-case.
    *   The class name should be PascalCase and end with `FormService` (e.g., `TicketFormService`).
    *   The service should be `providedIn: 'root'`.
    *   Inject `FormBuilder` into the constructor.
    *   Define a public `form: FormGroup` property and initialize it in the constructor with the fields.

2.  **Update the barrel file**:
    *   Open `projects/shared/forms/index.ts`.
    *   Insert a new export statement for the newly created form service in alphabetical order.
    *   Example: `export * from './ticket-form.service';`

## Example Form Service File

Filename: `projects/shared/forms/ticket-form.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class TicketFormService {
  form: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      title: [null, Validators.required],
      serial: [null, Validators.required],
      deadline: [null],
      description: [null],
      // ... other fields
    });
  }
}
```

## Example Barrel File Update

File: `projects/shared/forms/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./api-form.service";
export * from "./ticket-form.service";
// ... other exports
```
