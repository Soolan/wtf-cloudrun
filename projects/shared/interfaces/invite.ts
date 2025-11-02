import {InvitationStatus} from '@shared/enums';

export interface Invite {
  companyName: string;
  companyLogo: string;
  teamPath: string; // i.e. profiles/pid/companies/cid/team
  email: string; // The invited user's email
  invitedBy: string; // Name of the inviter (admin or existing team member)
  status: InvitationStatus; // Current state of the invite
  createdAt: number; // Firestore timestamp for when the invite was created
  hasProfile: boolean; // If true, it means user has signed up with us already
  acceptedAt?: number; // Optional: timestamp when the invite was accepted
  autoRegister?: boolean; // If true, registers the user in background upon acceptance
}
