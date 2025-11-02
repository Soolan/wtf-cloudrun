import {Entity, WtfQuery, Member} from '@shared/interfaces';
import {NOW} from '@shared/constants/timestamps';
import {MemberRank} from '@shared/enums';

export const MEMBERS: WtfQuery = {
  path: 'team',
  limit: 500,
  where: {field: 'timestamps.deleted_at', operator: '==', value: 0},
  orderBy: {field: 'order', direction: 'desc'}
};

export const BLANK_PERSONA: Entity = {
  role: '',
  name: '',
  avatar: '',
};

export const BLANK_MEMBER: Member = {
  persona: BLANK_PERSONA,
  role: '',
  bio: '',
  order: 0,
  contact: [],
  rank: MemberRank.Department,
  department: '',
  members: [],
  timestamps: NOW
}

export const NEW_MEMBER: string = 'new_member';
export const CEO: string = 'CEO';
