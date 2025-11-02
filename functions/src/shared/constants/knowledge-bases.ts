import {KnowledgeBase, WtfQuery} from '../interfaces';

export const KNOWLEDGE_BASES: WtfQuery = {
  path: 'kb',
  limit: 100,
  orderBy: {field: 'topicId', direction: 'desc'},
  where: {field: 'topicId', operator: '!=', value: null}
};

export const KNOWLEDGE_BASE: KnowledgeBase = {
  title: '',
  summary: '',
  chunkCount: 0,     // Total number of KbChunks
  hasBPMN: false,       // Optional flag if BPMN is required by tasks
  tags: [],
  timestamps: {
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: 0
  },
}

export const KB_TYPES: string[] = [
  'BOARD', 'CEO', 'COO', 'CTO', 'CMO', 'CFO', 'CLO', 'CISO', 'VP_OF_SALES', 'HEAD_OF_PARTNERSHIP',
  'HEAD_OF_HR', 'HEAD_OF_L_AND_D', 'PRODUCT_MANAGER', 'VP_OF_ENGINEERING', 'CONTENT_STRATEGIST', 'HEAD_OF_AI',
  'CUSTOMER_SUCCESS', 'CUSTOMER_SUPPORT', 'BLOCKCHAIN_LEAD', 'HEAD_OF_DESIGN', 'R_AND_D_LEAD', 'CREATIVE_DIRECTOR',
  'SOCIALS_AND_COMMUNITY', 'CONTENT_CREATOR', 'GROWTH_HACKER'
];

export const KB_STATUSES: string[] = ['Suggested', 'Under Review', 'Rejected', 'Approved'];

export const KB_CHUNKS: WtfQuery = {
  path: 'chunks',
  limit: 500,
  orderBy: {field: 'topicId', direction: 'desc'},
  where: {field: 'topicId', operator: '!=', value: null}
};
