import { Injectable } from '@angular/core';
import {NodeDefinition, ParametersSchema, SettingsSchema} from '@shared/interfaces';

const NODE_DEFINITIONS: { [key: string]: NodeDefinition } = {
  'form-trigger': {
    type: 'form-trigger',
    name: 'Form Trigger',
    icon: 'form-trigger.svg', // Assuming we have an icon
    parametersSchema: {
      fields: [
        {
          name: 'formUrls',
          label: '',
          type: 'form-urls'
        },
        {
          name: 'title',
          label: 'Form Title',
          type: 'string',
          placeholder: 'My Awesome Form',
          defaultValue: 'New Form'
        },
        {
          name: 'description',
          label: 'Form Description',
          type: 'textarea',
          placeholder: 'Enter a description for your form.'
        },
        {
          name: 'fields',
          label: 'Form Fields',
          type: 'field-list', // This will render a special component
          description: 'Add the fields for your form.',
          defaultValue: []
        },
        {
          name: 'responseMode',
          label: 'Respond when',
          type: 'select',
          defaultValue: 'submitted',
          options: [
            { value: 'submitted', label: 'Form is submitted' },
            { value: 'finished', label: 'Workflow finishes' }
          ]
        }
      ]
    }
  }
  // Other nodes will be defined here as they are created
};

@Injectable({
  providedIn: 'root'
})
export class NodeRegistryService {

  // constructor() { }

  /**
   * Gets the Parameters Schema for a given node type.
   * @param nodeType The type of the node (e.g., 'form-trigger')
   */
  getParametersSchema(nodeType: string): ParametersSchema | null {
    return NODE_DEFINITIONS[nodeType]?.parametersSchema || null;
  }

  /**
   * Gets the full definition for a given node type.
   * @param nodeType The type of the node.
   */
  getNodeDefinition(nodeType: string): NodeDefinition | null {
    return NODE_DEFINITIONS[nodeType] || null;
  }

  /**
   * Gets all registered node definitions.
   */
  getAllNodeDefinitions(): NodeDefinition[] {
    return Object.values(NODE_DEFINITIONS);
  }

  /**
   * Gets the Settings Schema for a given node type.
   * @param nodeType The type of the node (e.g., 'form-trigger')
   */
  getSettingsSchema(nodeType: string): SettingsSchema | null {
    return NODE_DEFINITIONS[nodeType]?.settingsSchema || null;
  }
}
