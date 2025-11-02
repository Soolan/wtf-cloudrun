import {BpaNode, BpaNodeWithId, BpaWithId} from '@shared/interfaces/bpa';
import {BpaNodeType, ProcessNodeStatus} from '@shared/enums/bpa';
import {NOW} from '@shared/constants/timestamps';
import {BLANK_PERSONA} from '@shared/constants/members';

export const MOCK_BPAS: BpaWithId[] = [
  {
    id: 'workflow-001',
    name: 'Sample Workflow 1',
    status: ProcessNodeStatus.Active,
    creator: {...BLANK_PERSONA, name: 'Admin User'},
    timestamps: NOW,
    connections: [
      {
        source: {node: 'node-001', output: 'triggerTime'},
        target: {node: 'node-002', input: 'message'},
      },
      {
        source: {node: 'node-002', output: 'status'},
        target: {node: 'node-003', input: 'method'},
      },
    ],
    settings: {
      timezone: 'America/New_York',
    },
  },
  {
    id: 'workflow-002',
    name: 'Another Workflow',
    status: ProcessNodeStatus.Inactive,
    creator: {...BLANK_PERSONA, name: 'Test User'},
    timestamps: NOW,
    connections: [],
    settings: {},
  },
];

export const MOCK_BPA_NODES: BpaNodeWithId[] = [
  {
    id: 'node-001',
    name: 'Start',
    type: BpaNodeType.Trigger,
    nodeDefinitionId: 'generic-trigger',
    version: 1,
    position: [100, 200],
    parameters: {},
    credentials: {},
    icon: '',
    status: ProcessNodeStatus.Active,
    schema: {
      inputs: [],
      outputs: [
        {name: 'triggerTime', label: 'Trigger Timestamp', type: 'number'},
        {name: 'payload', label: 'Trigger Payload', type: 'object'}
      ]
    }
  },
  {
    id: 'node-002',
    name: 'Prime Quality Node',
    type: BpaNodeType.Action,
    nodeDefinitionId: 'prime-quality-node',
    version: 1,
    position: [400, 200],
    parameters: {
      message: 'Hello World'
    },
    credentials: {},
    icon: '',
    status: ProcessNodeStatus.Active,
    schema: {
      inputs: [
        {name: 'message', label: 'Message', type: 'string', required: true}
      ],
      outputs: [
        {name: 'status', label: 'Execution Status', type: 'string'}
      ]
    }
  },
  {
    id: 'node-003',
    name: 'HTTP Request',
    type: BpaNodeType.Action,
    nodeDefinitionId: 'http-request',
    version: 1,
    position: [700, 200],
    parameters: {
      url: 'https://example.com'
    },
    credentials: {},
    icon: '',
    status: ProcessNodeStatus.Active,
    schema: {
      inputs: [
        {name: 'url', label: 'Request URL', type: 'string', required: true},
        {name: 'method', label: 'Request Method', type: 'string', required: true},
        {name: 'body', label: 'Request Body', type: 'object'},
        {name: 'headers', label: 'Request Headers', type: 'object'}
      ],
      outputs: [
        {name: 'responseBody', label: 'Response Body', type: 'object'},
        {name: 'statusCode', label: 'Status Code', type: 'number'},
      ]
    }
  }
];

export const AVAILABLE_BPA_NODES: BpaNode[] = [
  {
    name: 'Form Trigger',
    type: BpaNodeType.Trigger,
    nodeDefinitionId: 'form-trigger',
    version: 1,
    position: [0, 0],
    parameters: {
      title: 'New Form',
      description: '',
      fields: []
    },
    credentials: {},
    icon: 'form-trigger.svg',
    status: ProcessNodeStatus.Active,
    schema: {
      inputs: [],
      outputs: [] // Outputs are dynamic and will be generated from parameters
    }
  },
  {
    name: 'Once Upon A Time Log',
    type: BpaNodeType.Action,
    nodeDefinitionId: 'log-message',
    version: 1,
    position: [0, 0],
    parameters: {
      message: 'Hello World'
    },
    credentials: {},
    icon: '',
    status: ProcessNodeStatus.Active,
    schema: {
      inputs: [
        {name: 'message', label: 'Log Message', type: 'string'}
      ],
      outputs: []
    }
  },
  {
    name: 'HTTP Request',
    type: BpaNodeType.Action,
    nodeDefinitionId: 'http-request',
    version: 1,
    position: [0, 0],
    parameters: {
      url: 'https://example.com'
    },
    credentials: {},
    icon: '',
    status: ProcessNodeStatus.Active,
    schema: {
      inputs: [
        {name: 'url', label: 'Request URL', type: 'string', required: true},
        {name: 'method', label: 'Request Method', type: 'string', required: true},
        {name: 'body', label: 'Request Body', type: 'object'},
        {name: 'headers', label: 'Request Headers', type: 'object'}
      ],
      outputs: [
        {name: 'responseBody', label: 'Response Body', type: 'object'},
        {name: 'statusCode', label: 'Status Code', type: 'number'},
      ]
    }
  },
  {
    name: 'Trigger',
    type: BpaNodeType.Trigger,
    nodeDefinitionId: 'generic-trigger',
    version: 1,
    position: [0, 0],
    parameters: {},
    credentials: {},
    icon: '',
    status: ProcessNodeStatus.Active,
    schema: {
      inputs: [],
      outputs: [
        {name: 'triggerTime', label: 'Trigger Timestamp', type: 'number'},
      ]
    }
  }
];

