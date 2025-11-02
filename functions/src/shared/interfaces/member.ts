// Team members in a company
import {MemberLevel} from '../enums';
import {Entity, Timestamps} from '../interfaces';

export interface Member {
  persona: Entity;
  role: string;
  bio?: string;
  order: number;
  contact: string[]; //email, LinkedIn, etc. extract details (i.e. handle and contact type) from string.
  type: MemberLevel,
  department: string;
  members: string[];
  timestamps: Timestamps;
  active?: boolean;
  invited?: boolean;
}

export interface MemberWithId extends Member {
  id: string;
}
