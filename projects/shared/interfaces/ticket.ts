import { Timestamp } from '@angular/fire/firestore';
import {Entity, Resource, Timestamps} from '@shared/interfaces';
import {Product, ReleaseEntry, TicketPriority, TicketStage} from '@shared/enums';

export interface Ticket {
  title: string;
  serial: number;
  deadline: Timestamp;    // firebase timestamp
  description: string;
  product?: Product;
  stage: TicketStage;
  timestamps: Timestamps; // numbers
  release_entry: ReleaseEntry;
  dependencies?: string[]; // (ticket ids) tickets that must be completed before this one
  parentId?: string;  // The parent ticket id, which this ticket is one of its subtasks
  process?: string; // bpmn file
  creator?: Entity;
  assignedTo?: Entity;
  attachments?: Resource[];
  priority?: TicketPriority;
  clarification?: TaskClarification;
}

export interface TicketWithId extends Ticket {
  id: string;
}

export interface TicketStats {
  serials: Record<string, number>; // i.e. {'finance': 1, 'tech': 66}
  deadline: number;
  timestamps: Timestamps;
}

export interface TicketTimeline {
  event: string;
  timestamp: number;
}

export interface TaskClarification {
  isValid: boolean; // has valid and relevant title, description and attachment(s)
  hasBPMN: boolean;
  hasSubtasks: boolean;
  hasKb: boolean;
  usesTool: boolean;
  hasAccess: boolean; // Tool access
  doable: boolean; // depend on the outcome of clarification, can proceed doing the ticket?
}

