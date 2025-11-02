import {Ticket, TicketStats, WtfQuery} from '../interfaces';
import {Product, ReleaseEntry, TicketPriority, TicketStage} from '../enums';
import { Timestamp } from 'firebase-admin/firestore';
import {NOW} from '../constants/timestamps';

export const DAY = 86400000;             // 1 day

export const TICKETS: WtfQuery = {
  path: 'tickets',
  limit: 500,
  where: {field: 'timestamps.deleted_at', operator: '==', value: 0},
  orderBy: {field: 'deadline', direction: 'desc'}
};

export const MIRROR_TICKETS: WtfQuery = {
  path: 'mirror_tickets',
  limit: 5000,
  where: {field: 'deadline', operator: '<', value: new Date().getTime() + (14 * DAY)},
  orderBy: {field: 'deadline', direction: 'desc'}
};

export const BIG_BANG = 1659283200000;   // 2022, Aug 1st
export const SPRINT_PERIOD = 17 * DAY; // 17 days
export const DELTA = new Date().getTime() - BIG_BANG; // millis between now and the big bang
export const DEADLINES = [
  28 * DAY,                      // Backlog: 4 weeks
  3 * DAY,                       // ToDo:    3 days
  2 * DAY,                       // Doing:   2 days
  DAY                            // Done :   1 day
];

export const NEW_TICKET_ID: string = 'new_ticket';
export const TICKET_STATS_ID: string = '_stats';
export const TICKET_STATS: TicketStats = {
  serials: {'board': 0},
  deadline: 0,
  timestamps: NOW
};

export const TICKET_STAGES = ["Backlog", "ToDo", "Doing", "Done"]

export const TICKET_STAGES_SELECT = [
  {name: TicketStage.Backlog, value: TicketStage.Backlog},
  {name: TicketStage.ToDo, value: TicketStage.ToDo},
  {name: TicketStage.Doing, value: TicketStage.Doing},
  {name: TicketStage.Done, value: TicketStage.Done},
];

export const TICKET_PRIORITIES = ["Low", "Medium", "High", "Critical"]

export const TICKET_PRIORITY_SELECT = [
  {name: TicketPriority.Low, value: TicketPriority.Low},
  {name: TicketPriority.Medium, value: TicketPriority.Medium},
  {name: TicketPriority.High, value: TicketPriority.High},
  {name: TicketPriority.Critical, value: TicketPriority.Critical},
];

export const TICKET: Ticket = {
  title: '',
  serial: 0,
  deadline: Timestamp.fromDate(new Date(Date.now() + DEADLINES[0])), // 28 days
  description: '',
  product: Product.Website,
  stage: TicketStage.Backlog,
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0,
  },
  release_entry: ReleaseEntry.Feature,
  creator: {id: '', name: '', avatar: ''},
  assignedTo: {id: '', name: '', avatar: ''},
  attachments: [],
  priority: TicketPriority.Medium,
  dependencies: [],
  parentId: ''
};

export const WELCOME_TICKET: Ticket = {
  title: 'Welcome to your new board.',
  serial: 0,
  deadline: Timestamp.fromDate(new Date(Date.now() + DEADLINES[0])), // 28 days
  description: 'Activate your email, update the company details',
  product: Product.Website,
  stage: TicketStage.Backlog,
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0,
  },
  release_entry: ReleaseEntry.Feature,
  creator: {id: '', name: '', avatar: ''},
  assignedTo: {id: '', name: '', avatar: ''},
  attachments: [],
  priority: TicketPriority.Medium,
  dependencies: [],
  parentId: ''
};
