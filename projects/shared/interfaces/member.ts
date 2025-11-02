// Team members in a company
import {InvitationStatus, MemberRank} from '@shared/enums';
import {Entity, Timestamps} from '@shared/interfaces';

export interface Member {
  persona: Entity;             // Basic entity data (name, role, avatar, type)
  contact: string[];           // Emails, LinkedIn, etc.
  rank: MemberRank;            // Board, CSuite, Department
  department: string;          // i.e. Finance, Tech, Operations
  members: string[];           // Direct reports (IDs)
  status?: InvitationStatus;   // Pending, Accepted, etc.
  agentCard?: string;          // .well-known JSON URL for AI agents - might be redundant
  timestamps: Timestamps;      // Created/updated times
}

export interface MemberWithId extends Member {
  id: string;
}
