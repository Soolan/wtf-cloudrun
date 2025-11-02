# Workflow Data Structures

This document outlines the core data structures (TypeScript interfaces) that define a Business Process Automation (BPA) workflow. Understanding these interfaces is crucial for developing and interacting with the workflow system.

The primary interfaces are located in `@projects/shared/interfaces/bpa.ts`.

---

## Core Interfaces

### `Bpa`
The `Bpa` interface is the root object for an entire workflow.

```typescript
export interface Bpa {
  name: string;
  status: ProcessNodeStatus;
  creator: Entity;
  timestamps: Timestamps;
  connections: BpaConnection[]; // Holds all connections for the workflow
  settings?: BpaWorkflowSettings;
}
```
- **Business Logic:** It holds metadata about the workflow, such as its name and status. Crucially, it contains the `connections` array, which defines the entire graph of how nodes are linked together. The nodes themselves are stored separately (e.g., in a subcollection in Firestore).

### `BpaNode`
This interface represents a single node on the canvas. A node is a single step or unit of work in the workflow.

```typescript
export interface BpaNode {
  id: string; // The unique document ID
  name: string;
  icon: string;
  type: BpaNodeType; // The general category: 'trigger', 'action', or 'cluster'
  nodeDefinitionId: string; // The unique node type ID: 'form-trigger', 'http-request', etc.
  position: [number, number];
  parameters: { [key: string]: any }; // User-configured settings for the node
  schema?: BpaNodeSchema; // Defines the node's capabilities (inputs/outputs)
}
```
- **Business Logic:** This stores everything needed to render and execute a node.
  - `id`: A unique identifier for the specific node instance on the canvas.
  - `type`: A broad category used for general styling or filtering (e.g., all triggers).
  - `nodeDefinitionId`: The unique identifier for the node's implementation. This is used to look up the correct UI Schema and execution logic.
  - `parameters`: A key-value store for any settings a user configures in the node's settings panel.
  - `schema`: This is the most important property for understanding data flow. It's the blueprint for what data the node accepts and produces.

### `BpaConnection`
This interface defines a single connection (an arrow) between two nodes.

```typescript
export interface BpaConnection {
  source: {
    node: string;   // Document ID of the source node
    output: string; // Name of the source's output field
  };
  target: {
    node: string;   // Document ID of the target node
    input: string;  // Name of the target's input field
  };
}
```
- **Business Logic:** This object explicitly links two nodes together.
  - `source.node` and `target.node` use the unique `id` of the `BpaNode`.
  - `source.output` and `target.input` are **string identifiers**, not the data itself. This is the key to how the system works.

---

## The Schema: How Inputs and Outputs Work

The real power of the system comes from the interaction between `BpaConnection` and `BpaNodeSchema`.

### `BpaNodeSchema` and `BpaNodeIoField`
The `schema` of a node defines its "signature" - what data it needs and what data it provides.

```typescript
// Attached to a BpaNode
export interface BpaNodeSchema {
  inputs: BpaNodeIoField[];
  outputs: BpaNodeIoField[];
}

// Describes a single input or output "port"
export interface BpaNodeIoField {
  name: string;       // The machine-readable identifier (e.g., 'userId')
  label: string;      // The human-readable label (e.g., 'User ID')
  type: string;       // 'string', 'number', 'boolean', 'object', etc.
}
```

### The Business Logic Explained

The `input` and `output` strings in a `BpaConnection` are **not** the data. They are **identifiers** that point to the `name` of a `BpaNodeIoField` in a node's `schema`.

**This design allows the system to be:**
1.  **Descriptive:** You know exactly what kind of data is being passed (e.g., `output: 'userRecord'`).
2.  **Decoupled:** The connection itself is lightweight. It only stores references, not the full data definition or the data itself.
3.  **Flexible:** When configuring a node, the UI can inspect the `schema` of the nodes connected to it to intelligently show the user what data is available.

### Example Scenario: "Form Trigger" -> "IF Node"

Let's trace the logic with the scenario we discussed:

1.  **A "Form Submission" trigger is created.** It has no inputs, but its `schema.outputs` is defined as:
    ```typescript
    "outputs": [
      { "name": "email", "label": "Email Address", "type": "string" },
      { "name": "date", "label": "Submission Date", "type": "string" }
    ]
    ```

2.  **An "IF" node is added.** Its `schema.inputs` might accept generic data:
    ```typescript
    "inputs": [
      { "name": "main", "label": "Input Data", "type": "object" }
    ]
    ```

3.  **You connect the two nodes.** A `BpaConnection` is created:
    ```typescript
    {
      "source": { "node": "form-node-id", "output": "email" }, // Let's say we connect the email field
      "target": { "node": "if-node-id", "input": "main" }
    }
    ```
    Here, the string `'email'` in `source.output` refers directly to the `BpaNodeIoField` with `name: 'email'` in the form node's schema.

4.  **Configuring the "IF" Node:** When you open the settings for the "IF" node, the UI sees the incoming connection. It looks up the "Form Submission" node, reads its `schema.outputs`, and sees that `email` and `date` are available. It can then present these as options to the user for building a condition.

5.  **Data Flow at Execution:** When the workflow actually runs, the "Form Submission" node produces a JSON object. The system uses the `BpaConnection` to know that the value associated with the `email` output should be passed to the `main` input of the "IF" node.
