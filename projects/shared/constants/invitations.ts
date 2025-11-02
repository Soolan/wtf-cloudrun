import {WtfQuery} from '@shared/interfaces';

export const INVITATIONS: WtfQuery = {
  path: 'invitations',
  limit: 200,
  where: {field: 'createdAt', operator: '!=', value: 0},
  orderBy: {field: 'createdAt', direction: 'desc'}
};

export const INVITE_URL: string = 'https://wtf.pub/invite'
