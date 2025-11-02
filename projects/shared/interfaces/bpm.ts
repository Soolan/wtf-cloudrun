import { BpmStatus } from '../enums';
import { Timestamps, Entity, Resource } from './';

export interface Bpm {
  topicId: string;       // Reference to the source topic from the playbook
  title: string;         // Title of the business process model
  status: BpmStatus;     // The current status of the model
  version: number;       // Version number for the model
  creator: Entity;       // The user who created or last updated the model
  timestamps: Timestamps;

  bpmn: Resource;        // The BPMN XML file resource
  svg?: Resource;        // An optional SVG representation of the diagram
  description?: string;  // Optional description or notes about the model
}

export interface BpmWithId extends Bpm {
  id: string;
}
