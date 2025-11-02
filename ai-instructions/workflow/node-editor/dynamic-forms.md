# Strategy for Dynamic Node Settings UI

This document outlines the architectural strategy for building a scalable and maintainable settings panel for workflow nodes.

## 1. The Challenge

A workflow can contain dozens of different node types, from simple utilities like an "IF" condition to complex integrations like "Google Drive" or "OpenAI". Each node requires a unique set of parameters and credentials.

Creating a static, custom-built Angular form for every single node type is not feasible. It would lead to a massive, unmaintainable codebase.

## 2. The Solution: A Metadata-Driven UI

Instead of building unique forms, we will build a single, generic framework that can dynamically render a form based on a **"Parameters Schema"** provided by each node type.

This means each node is responsible for describing the UI it needs.

### 2.1. The "Parameters Schema"

Every node type will have a corresponding Parameters Schema object. This object defines the form fields required for its "Parameters" tab.

**Example: Google Drive "Upload File" Node**
```json
{
  "fields": [
    { 
      "name": "drive", 
      "label": "My Google Drive", 
      "type": "credential", 
      "credentialType": "google" 
    },
    { 
      "name": "fileId", 
      "label": "File ID", 
      "type": "string", 
      "placeholder": "Enter file ID or map input" 
    },
    { 
      "name": "data", 
      "label": "Binary Data", 
      "type": "expression", 
      "description": "The data to upload" 
    },
    { 
      "name": "overwrite", 
      "label": "Overwrite", 
      "type": "boolean", 
      "defaultValue": true 
    }
  ]
}
```

**Example: "IF" Node**
This schema requests a more complex, custom component.
```json
{
  "fields": [
    { 
      "name": "conditions", 
      "label": "Conditions", 
      "type": "conditionBuilder" 
    }
  ]
}
```

### 2.2. The "Settings Schema"

Similar to the Parameters Schema, each node can also provide a Settings Schema for node-specific configuration that goes beyond the common settings (like retry logic, notes, etc.). This allows for dynamic rendering of additional settings fields.

**Example: A custom setting for a "Send Email" node**
```json
{
  "fields": [
    {
      "name": "emailTemplate",
      "label": "Email Template",
      "type": "select",
      "options": [
        { "value": "welcome", "label": "Welcome Email" },
        { "value": "reset_password", "label": "Reset Password Email" }
      ]
    },
    {
      "name": "sendCopy",
      "label": "Send Copy to Admin",
      "type": "boolean",
      "defaultValue": false
    }
  ]
}
```

### 2.3. The `DynamicNodeFormComponent`

This new, smart component will be the core of the solution. It will be responsible for rendering the form defined by a Parameters Schema.

- **Inputs:** It will take the `parametersSchema` for the node and the node's current `parameters` data (`BpaNode.parameters`).
- **Logic:** It will iterate through the `fields` in the Parameters Schema and use an `ngSwitch` statement to render the appropriate control based on the `type` property.
- **Supported Field Types:**
  - `string`: Renders `<input type="text">`.
  - `number`: Renders `<input type="number">`.
  - `boolean`: Renders a toggle switch or checkbox.
  - `credential`: Renders a dropdown to select from saved credentials.
  - `expression`: Renders a special input that allows mapping data from previous nodes (e.g., `{{ $json.someValue }}`).
  - `conditionBuilder`: Renders a completely custom Angular component for building complex conditional logic.
  - ...and so on. We can add more types as needed.
- **Output:** It will use Angular's Reactive Forms to manage the data. When the form is updated, it will emit an event with the new `parameters` object.

### 2.4. Refactoring `bpa-node-editor`

The main node editor component will be updated to use this new system within a tabbed interface.

- **Parameters Tab:** This tab will host the `DynamicNodeFormComponent`. It will be responsible for finding the correct Parameters Schema for the selected node and passing it to the dynamic form.
- **Settings Tab:** This tab will contain static fields for node-level properties like its `name` and `description`.
- **Input / Output Tabs:** These tabs will function as previously discussed, showing available data from upstream nodes and the results of test executions.

## 3. Advantages of This Approach

1.  **Scalability:** To support a new node, we simply define its Parameters Schema object. No new Angular form needs to be built from scratch.
2.  **Consistency:** All node settings panels will have a consistent look, feel, and behavior.
3.  **Maintainability:** The logic for rendering forms is centralized in one place. Bug fixes and improvements benefit all nodes at once.
4.  **Flexibility:** The system handles everything from the simplest nodes to the most complex ones by allowing the Parameters Schema to request custom components when necessary.
