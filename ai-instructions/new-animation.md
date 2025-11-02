# Instruction: Create a new shared Angular Animation

## Goal

This instruction guides the AI to create a new TypeScript file for an Angular animation inside the `projects/shared/animations` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `animations` directory**: The primary location for animations is `projects/shared/animations/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/animations/index.ts`.
3.  **Analyze existing animations**: Review other animation files in the directory to understand the structure, common imports from `@angular/animations`, and naming conventions.

## User Interaction

1.  **Ask for the animation name**:
    *   Example: "What would you like to name the animation? (e.g., Card Flip, Fade In)"
    *   The user will provide a name.

2.  **Ask for animation details (optional)**:
    *   The AI can ask for states, transitions, and keyframes, or it can generate a common default animation (like a simple fade or slide) if the user doesn't provide details.

## Execution Steps

1.  **Generate the animation file**:
    *   Create a new file with a `.ts` extension (e.g., `card-flip.ts`).
    *   The file name should be kebab-case.
    *   The exported animation trigger constant should be in `UPPER_SNAKE_CASE` (e.g., `CARD_FLIP`).
    *   The trigger name inside the animation should be camelCase (e.g., `flip`).
    *   Import necessary functions like `trigger`, `state`, `style`, `transition`, `animate`, `keyframes` from `@angular/animations`.

2.  **Update the barrel file**:
    *   Open `projects/shared/animations/index.ts`.
    *   Insert a new export statement for the newly created animation file in alphabetical order.
    *   Example: `export * from './card-flip';`

## Example Animation File

Filename: `projects/shared/animations/fade.ts`

```typescript
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

export const FADE = trigger('fade', [
  state('in', style({ opacity: 1 })),
  state('out', style({ opacity: 0 })),

  transition('* => in', [
    animate('0.4s ease-in', keyframes([
      style({ opacity: 0, offset: 0 }),
      style({ opacity: 1, offset: 1 })
    ]))
  ]),

  transition('* => out', [
    animate('1s', style({ opacity: 0 }))
  ]),
]);
```

## Example Barrel File Update

File: `projects/shared/animations/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from "./card-flip";
export * from "./fade";
```
