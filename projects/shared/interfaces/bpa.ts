import {BpaNodeType, ProcessNodeStatus} from '../enums';
import { Timestamps, Entity } from './';

/**
 * The main workflow document.
 * The nodes themselves are stored in a `nodes` subcollection.
 */
export interface Bpa {
  name: string;
  status: ProcessNodeStatus;
  creator: Entity;
  timestamps: Timestamps;
  connections: BpaConnection[];
  settings?: BpaWorkflowSettings;
}

export interface BpaWithId extends Bpa {
  id: string;
}

/**
 * Represents a field in a node's inputs or outputs
 */
export interface BpaNodeIoField {
  name: string;       // The machine-readable name (e.g., 'userId', 'emailBody')
  label: string;      // The human-readable label (e.g., 'User ID', 'Email Body')
  type: string;       // 'string', 'number', 'boolean', 'object', etc.
  required?: boolean;
}

export interface BpaNodeSchema {
  inputs: BpaNodeIoField[];
  outputs: BpaNodeIoField[];
}

export interface NodeSettings {
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  retryMaxTries?: number;
  retryWait?: number;
  onError?: 'stop' | 'continue' | 'continueErrorOutput';
  notes?: string;
  displayNoteInFlow?: boolean;
}

export interface BpaNode {
  name: string;
  icon: string;
  type: BpaNodeType; // The general category: Trigger, Action, etc.
  nodeDefinitionId: string; // The unique node type ID: 'form-trigger', 'http-request', etc.
  status: ProcessNodeStatus;
  version: number;
  position: [number, number];
  parameters: { [key: string]: any };
  settings?: NodeSettings;
  description?: string;
  credentials?: { [key: string]: any };
  categoryTag?: string;
  schema?: BpaNodeSchema;
  pinnedOutput?: any; // Holds the last pinned execution result
}

export interface BpaNodeWithId extends BpaNode {
  id: string; // The Firestore document ID
}

/**
 * Defines the connection between two nodes, referencing their document IDs.
 */
export interface BpaConnection {
  source: {
    node: string; // Document ID of the source node
    output: string;
  };
  target: {
    node: string; // Document ID of the target node
    input: string;
  };
}

/**
 * Contains workflow-specific settings.
 */
export interface BpaWorkflowSettings {
  timezone?: string;
  errorWorkflow?: string;
}

export interface ConnectionEndpoints {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface NodeCategory {
  name: string;
  description: string;
  icon: string;
  tag: string;
}

// From node-registry.service.ts
export interface ParametersSchemaField {
  name: string;
  label: string;
  type: 'string' | 'textarea' | 'boolean' | 'field-list' | 'credential' | 'select' | 'form-urls';
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: { value: string; label: string; }[];
}

export interface ParametersSchema {
  fields: ParametersSchemaField[];
}

export interface SettingsSchemaField {
  name: string;
  label: string;
  type: 'string' | 'textarea' | 'boolean' | 'number' | 'select';
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: { value: string; label: string; description?: string }[];
}

export interface SettingsSchema {
  fields: SettingsSchemaField[];
}

export interface NodeDefinition {
  type: string;
  name: string;
  icon: string;
  parametersSchema: ParametersSchema;
  settingsSchema?: SettingsSchema;
}

// From node-settings.component.ts
export interface NodeSettingsDialogData {
  node: BpaNodeWithId;
  nodes: BpaNodeWithId[];
  connections: BpaConnection[];
}

export interface MappedInput extends BpaNodeIoField {
  isConnected: boolean;
  sourceNode?: BpaNodeWithId;
  sourceOutput?: string;
}
