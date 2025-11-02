import {Entity, PlaybookStats, Topic, TopicWithId, WtfQuery} from '@shared/interfaces';
import {BLANK_PERSONA} from '@shared/constants/members';
import {TopicStatus} from '@shared/enums/playbook';
import {NOW} from '@shared/constants/timestamps';

export const PLAYBOOK_TOPICS: WtfQuery = {
  path: 'playbook',
  limit: 1000,
  where: {field: 'timestamps.created_at', operator: '!=', value: ''},
  orderBy: {field: 'timestamps.created_at', direction: 'desc'},
};

export const PLAYBOOK_CHAPTERS: WtfQuery = {
  path: 'playbook',
  limit: 1000,
  where: {field: 'parentId', operator: '==', value: ''},
  orderBy: {field: 'parentId', direction: 'desc'},
};

export const TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Draft,
  creator: BLANK_PERSONA,
  title: 'New topic',
  subtitle: 'Briefly explain what is this topic about.',
  fullText: 'topic body',
  order: 0,
  tags: [],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const NEW_TOPIC: string = 'new_topic';
export const STATS_DOC: string = '_stats';
export const NEW_STATS: PlaybookStats = {maintainer: {} as Entity, total: 1, timestamps: NOW};

export const GENERAL_POLICIES_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'General Policies & Guidelines',
  subtitle: 'This section contains the general policies available to all departments.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'general policies'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const OPERATIONS_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Operations',
  subtitle: 'This section contains the guidelines available to the operation department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'operation'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const TECH_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Tech',
  subtitle: 'This section contains the guidelines available to the tech department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'tech'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const FINANCE_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Finance',
  subtitle: 'This section contains the guidelines available to the finance department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'operation'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const MARKETING_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Marketing',
  subtitle: 'This section contains the guidelines available to the marketing department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'marketing'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const LEGAL_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Legals',
  subtitle: 'This section contains the guidelines available to the legals department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'legal'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const HR_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Human resources',
  subtitle: 'This section contains the guidelines available to the HR department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'HR'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const SALES_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Sales',
  subtitle: 'This section contains the guidelines available to the sales department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'sales'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const CUSTOMER_SERVICE_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Customer service',
  subtitle: 'This section contains the guidelines available to the customer service department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'customer service'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const PRODUCTION_TOPIC: Topic = {
  kbId: '',
  parentId: '',
  status: TopicStatus.Accept,
  creator: BLANK_PERSONA,
  title: 'Sales',
  subtitle: 'This section contains the guidelines available to the production department.',
  fullText: '',
  order: 0,
  tags: ['guideline', 'production'],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
};

export const mockTopics: TopicWithId[] = [
  {
    id: '1',
    kbId: 'kb1',
    parentId: undefined,
    title: 'Introduction to Angular with extra chilli sauce and fries',
    subtitle: 'Learn the basics of Angular',
    fullText: '',
    order: 1,
    timestamps: {
      created_at: 1632024978000,
      updated_at: 1632024978000,
      deleted_at: 0
    },
    tags: ['angular', 'beginner'],
    status: TopicStatus.Draft,
    creator: BLANK_PERSONA,
  },
  {
    id: '2',
    kbId: 'kb2',
    parentId: '1',
    title: 'Components in Angular and infinity and beyond',
    subtitle: 'How to create and use components in Angular',
    order: 1,
    timestamps: {
      created_at: 1632024978000,
      updated_at: 1632024978000,
      deleted_at: 0
    },
    tags: ['angular', 'components'],
    status: TopicStatus.Accept,
    creator: BLANK_PERSONA,
  },
  {
    id: '3',
    kbId: 'kb3',
    parentId: '1',
    title: 'Directives in Angular',
    subtitle: 'Understanding directives and how to use them',
    order: 2,
    timestamps: {
      created_at: 1632024978000,
      updated_at: 1632024978000,
      deleted_at: 0
    },
    tags: ['angular', 'directives'],
    status: TopicStatus.Draft,
    creator: BLANK_PERSONA,
  },
  {
    id: '4',
    kbId: 'kb4',
    parentId: undefined,
    title: 'Advanced Angular Techniques',
    subtitle: 'Deep dive into advanced Angular topics',
    order: 2,
    timestamps: {
      created_at: 1632024978000,
      updated_at: 1632024978000,
      deleted_at: 0
    },
    tags: ['angular', 'advanced'],
    status: TopicStatus.Reject,
    creator: BLANK_PERSONA,
  },
  {
    id: '5',
    kbId: 'kb5',
    parentId: '4',
    title: 'Angular Performance Optimization',
    subtitle: 'How to optimize Angular applications for performance',
    order: 1,
    timestamps: {
      created_at: 1632024978000,
      updated_at: 1632024978000,
      deleted_at: 0
    },
    tags: ['angular', 'performance'],
    status: TopicStatus.Review,
    creator: BLANK_PERSONA,
  },
  {
    id: '6',
    kbId: 'kb5',
    parentId: '3',
    title: 'Yaw!!!',
    subtitle: 'How to optimize Angular applications for performance',
    order: 1,
    timestamps: {
      created_at: 1632024978000,
      updated_at: 1632024978000,
      deleted_at: 0
    },
    tags: ['angular', 'performance'],
    status: TopicStatus.Accept,
    creator: BLANK_PERSONA,
  }
];
