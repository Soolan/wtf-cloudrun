# Instruction: Scaffold a new Data Entity Feature

## Goal

This is a master instruction to guide the AI in scaffolding a complete feature slice for a new data entity. This includes creating all necessary shared artifacts (interface, enum, constants, services, dialogs) and the primary UI components (list and form views) with routing.

## Pre-computation Analysis

1.  **Understand the Entity**: The AI must first understand the core data entity it is scaffolding (e.g., Agent, Product, Invoice).
2.  **Identify all relevant directories**:
    *   `projects/shared/interfaces/`
    *   `projects/shared/enums/`
    *   `projects/shared/constants/`
    *   `projects/shared/services/`
    *   `projects/shared/forms/`
    *   `projects/shared/dialogs/`
    *   The target project for UI components (e.g., `projects/website/src/app/`).
3.  **Identify all relevant barrel files** to ensure new artifacts are exported.

## User Interaction

1.  **Ask for the entity name**: This is the most critical piece of information.
    *   Example: "What is the name of the data entity you want to create a feature for? (e.g., Agent, Product)"
    *   User: "Agent"

2.  **Gather Interface & Enum details**:
    *   Example: "What properties should the `Agent` interface have? Please specify types. If any property uses an enum that doesn't exist, please provide the enum name and its values."
    *   User: "name: string, role: string, status: AgentStatus. The AgentStatus enum should have values: InTraining, Live, Suspended."

3.  **Ask for the UI project**:
    *   Example: "In which project should I create the UI components? (e.g., website, dashboard)"
    *   User: "website"

## Execution Steps

This is a multi-stage process. The AI should follow these steps in order, confirming with the user as it progresses.

### Stage 1: Create Shared Artifacts

1.  **Create Enum(s)**: Following the `new-enum.md` instruction, create any necessary enum files (e.g., `agent-status.ts`) in `projects/shared/enums/` and update the barrel file.

2.  **Create Interface**: Following the `new-interface.md` instruction, create the main interface file (e.g., `agent.ts`) in `projects/shared/interfaces/`, including a `WithId` version. Update the barrel file.

3.  **Create Constants**: Following the `new-constants.md` instruction, create a constants file (e.g., `agents.ts`) in `projects/shared/constants/`. This should include a `WtfQuery` constant, a default entity constant, and a mock data array for testing. Update the barrel file.

4.  **Create Service**: Following the `new-service.md` instruction, create a data management service (e.g., `agent.service.ts`) in `projects/shared/services/`. Update the barrel file.

5.  **Create Form Service**: Following the `new-form-service.md` instruction, create a form service (e.g., `agent-form.service.ts`) in `projects/shared/forms/`. Update the barrel file.

6.  **Create Dialog**: Following the `new-dialog.md` instruction, create a confirmation dialog for deletion (e.g., `delete-agent`) in `projects/shared/dialogs/`. Update the barrel file.

### Stage 2: Create UI Components

1.  **Generate List and Form Components**: Following the `new-standalone-component.md` instruction, generate two components in the target project (e.g., `agents` and `agent` in `projects/website/src/app/`).

2.  **Implement the List Component (`agents.component.ts/.html`)**:
    *   Implement a Material Table (`mat-table`) to display a list of entities.
    *   Include sorting (`matSort`) and a filter input.
    *   Use the `storageUrl` pipe for avatar/image properties.
    *   Add an "Actions" column with an edit button that links to the form component (`/agents/:id`) and a delete button that opens the confirmation dialog.
    *   Optionally, use an expansion panel (`multiTemplateDataRows`) to show additional details for each row.

3.  **Implement the Form Component (`agent.component.ts/.html`)**:
    *   Use the generated `AgentFormService` to manage the form state.
    *   In `ngOnInit`, subscribe to the route params to get the entity ID.
    *   If an ID is present, use the `AgentService` to fetch the entity's data and patch the form.
    *   Implement a `save()` method that calls the appropriate `add` or `update` method on the `AgentService`.

### Stage 3: Configure Routing

1.  **Locate the Routes File**: Find the `app.routes.ts` file in the target project.

2.  **Add New Routes**: Add routes for the list and form components. Use `loadComponent` for lazy loading.
    *   Example:
        ```typescript
        {
          path: 'agents',
          loadComponent: () => import('./agents/agents.component').then(m => m.AgentsComponent)
        },
        {
          path: 'agents/:agentId',
          loadComponent: () => import('./agent/agent.component').then(m => m.AgentComponent)
        }
        ```

3.  **Update the Routes File**: Save the changes to the `app.routes.ts` file.
