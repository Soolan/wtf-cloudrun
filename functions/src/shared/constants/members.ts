import {Entity, WtfQuery, Member} from '../interfaces';
import {NOW} from '../constants/timestamps';
import {MemberLevel} from '../enums';

export const MEMBERS: WtfQuery = {
  path: 'team',
  limit: 500,
  where: {field: 'timestamps.deleted_at', operator: '==', value: 0},
  orderBy: {field: 'order', direction: 'desc'}
};

export const BLANK_PERSONA: Entity = {
  id: '',
  name: '',
  avatar: '',
};

export const BLANK_MEMBER: Member = {
  persona: BLANK_PERSONA,
  role: '',
  bio: '',
  order: 0,
  contact: [],
  type: MemberLevel.Department,
  department: '',
  members: [],
  timestamps: NOW
}

export const NEW_MEMBER: string = 'new_member';
export const CEO: string = 'CEO';
