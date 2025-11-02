import {Timestamps} from './timestamps';

// They live here:
//  profiles/{profileId}/companies/{companyId}/kb/{kbId}
// Note: topicId is used for kbId

export interface KnowledgeBase {
  title: string;          // The title of the knowledge base (same as topic title)
  summary: string;        // A short description or snippet
  tags: string[];         // A list of tags to help with task queries.
  chunkCount?: number;    // Total number of KbChunks
  hasBPMN?: boolean;      // Optional flag if it has BPMN
  timestamps: Timestamps;
}

export interface KnowledgeBaseWithId extends KnowledgeBase {
  id: string;
}

// They live here:
//  profiles/{profileId}/companies/{companyId}/knowledgebase/{kbId}/chunks/{chunkId}
export interface KbChunk {
  text: string;              // Cleaned, chunked text
  embedding: number[];       // Vector embedding
  created_at: number;
}

