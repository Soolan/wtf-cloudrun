import {WtfQuery} from '@shared/interfaces';

export const DISCUSSIONS: WtfQuery = {
  path: 'discussions',
  limit: 50,
  where: {field: 'timestamp', operator: '>', value: 0},
  orderBy: {field: 'timestamp', direction: 'desc'}
};
