# New Standalone Component Template

**1. Component Details:**
   - `componentName`: (Required) The name of the new component (e.g., `user-profile`).
   - `projectName`: (Optional) The name of the project (e.g., `dashboard`). If not provided, the component will be created in the `shared` project.

**2. Generation Command:**

*   **If a `projectName` is provided:**
    ```bash
    ng generate-topic component {{componentName}} --standalone --style=scss --project={{projectName}}
    ```
*   **If no `projectName` is provided (for a shared component):**
    ```bash
    ng generate-topic component {{componentName}} --standalone --style=scss --path=projects/shared/components
    ```

**3. Barrel Export (for shared components):**

*   If the component is created in `shared`, export it from `@projects/shared/components/index.ts`:
    ```typescript
    export * from './{{componentName}}/{{componentName}}.component';
    ```

**4. Routing (Optional):**

*   If the component needs to be routable, add it to the appropriate `routes.ts` file.
