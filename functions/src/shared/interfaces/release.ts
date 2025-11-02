import { Timestamp } from 'firebase-admin/firestore';

export interface Release {
  version: string;
  date: Timestamp;
  features: string[];
  improvements: string[];
  fixes: string[];
  operations: string[];
}

export interface Quarter {
  quarter: string;
  items: string[];
}

export interface Sprint {
  no: number;
  date: number;
}
