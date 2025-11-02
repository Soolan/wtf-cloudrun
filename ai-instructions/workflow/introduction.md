# Introducing Workflow 


## An automated workflow represents a BPA (Business Process Automation)
We intend to import n8n workflows and follow a similar logic for creating and displaying them.
Here is an example of n8n workflow (.json):
`@ai-instructions/workflow/sample.json`

**Interfaces**
All necessary interfaces to represent a bpa, its nodes, connections and settings are located here:
`@projects/shared/interfaces/bpa.ts`


**Constants**
These are mock objects to test our components:
`@projects/shared/constants/bpas.ts`

**routes**
In our routes here: `@projects/website/src/app/console/routes.ts`
We have a landing page for all workflows and an editor for view/edit selected workflows:
```
  {
    path: ':companyId/bpa',
    loadComponent: () =>
    import('@shared/components/bpa/bpa.component').then(m => m.BpaComponent)
  },
  {
    path: ':companyId/bpa/:workflowId',
    loadComponent: () =>
    import('@shared/components/bpa-editor/bpa-editor.component').then(m => m.BpaEditorComponent)
  },
```

**Components**
The node editor component is where several child components come together to provide all necessary preview/edit functionalities:
```
<div class="bpa-editor-container">
  <lib-bpa-toolbar
    (save)="onSaveWorkflow()"
    (run)="onRunWorkflow()"
    (importFile)="onImportWorkflow($event)"
    (export)="onExportWorkflow()"
  ></lib-bpa-toolbar>
  <div class="bpa-editor-content">
    <lib-bpa-node-palette [nodes]="nodes$ | async"></lib-bpa-node-palette>
    <lib-bpa-canvas [nodes]="nodes$ | async" (nodeSelected)="onNodeSelected($event)"></lib-bpa-canvas>
    <lib-bpa-node-editor [node]="selectedNode"></lib-bpa-node-editor>
  </div>
  @if (workflowId) {
    <div class="workflow-info">
      <h3>Workflow ID: {{ workflowId }}</h3>
      <p>Workflow Data: {{ workflow$ | async | json }}</p>
      <p>Nodes Data: {{ nodes$ | async | json }}</p>
    </div>
  }
</div>
```
These are the components that hold the logic and template:
`@projects/shared/components/bpa/`
`@projects/shared/components/bpa-editor/`
`@projects/shared/components/bpa-toolbar/`
`@projects/shared/components/bpa-canvas/`
`@projects/shared/components/bpa-node-editor/`
`@projects/shared/components/bpa-node-palette/`

They are partially implemented.
