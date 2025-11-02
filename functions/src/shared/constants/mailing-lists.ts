import {MailingList, WtfQuery} from '../interfaces';
import { Timestamp } from 'firebase-admin/firestore';

export const MAILING_LIST: WtfQuery = {
  path: 'mailing_lists',
  limit: 150,
  where: {field: 'scheduledTime', operator: '!=', value: 0},
  orderBy: {field: 'scheduledTime', direction: 'desc'}
};

export const NEW_MAILING_LIST: MailingList = {
  name: '',
  from: '',
  message: {
    subject: '',
    html: ''
  },
  receivers: [],
  scheduledTime: Timestamp.now()
};

export const SUBSCRIBERS: WtfQuery = {
  path: 'subscribers',
  limit: 150,
  where: {field: 'email', operator: '!=', value: ''},
  orderBy: {field: 'email', direction: 'desc'}
};
