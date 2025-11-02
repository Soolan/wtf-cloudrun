import {FlowStatus} from '@shared/enums';
import {TopicGeneratorPayload} from "@shared/interfaces/uploader";

export interface Flow {
  function: string;
  created_at: number;
  path: string;
  status: FlowStatus;
  progress: number;
  messages: string[];
  duration_ms?: number;
  error?: string;
  result?: any;
}

export interface FlowWithId extends Flow {
  id: string;
}

export interface FlowState {
  messages: string[];
  progress: number;
  status: FlowStatus | null;
  result?: any;
  error?: string;
  docId?: string;
}
