import {FlowStatus} from '../enums';

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
