import {TopicStatus} from '../enums';
import {Timestamps, Entity, Resource} from '../interfaces';

export interface Topic {
  title: string;       // Title of the topic
  order: number;       // Position/order within the parent topic
  status: TopicStatus; // Topic status
  creator: Entity;     // Who did this?

  kbId?: string;       // Reference to knowledge-base document
  parentId?: string;   // Reference to the parent topic (Firestore doc ID)
  subtitle?: string;   // Optional subtitle
  fullText?: string;   // Optional fullText
  tags?: string[];     // Optional tags for categorization
  resources?: Resource[]; // Storage refs(text/image/audio/video) and URLs (including api endpoints)
  bpmn?: Resource;
  bpmnEligibility?: BpmnEligibility;
  timestamps: Timestamps;
}

export interface TopicWithId extends Topic {
  id: string;
}


export interface PlaybookStats {
  maintainer: Entity,
  total: number;
  timestamps: Timestamps;
}

export interface BpmnEligibility {
  score: number;
  hasParticipants: boolean;
  hasActivities: boolean;
  hasDecisions: boolean;
  hasSequence: boolean;
  hasArtifacts: boolean;
  recommendations: string[];
}

/*
Question:
  Why did we introduce the Topic model?
  Couldn't we simply modify the KB model and add the missing parts? (i.e. parentId and order)

  On top of 1mb size limit for firestore docs (fulltext and embedding fields could be massive... so better
  to store them separately),
  we did that for several reasons.

  1. Separation of Concerns:
  The knowledge-base collection focuses on storing content and metadata, optimized for RAG & vector search.
  The playbook collection provides a structure for organizing the kb into a nested human-readable hierarchy.
  That means, all KBs should have at least one playbook topic associated with them, but a playbook topic can
  be independent with no kbId (i.e. chapter or section titles).

  2. Flexibility & Scalability:
  You can reuse the same knowledge-base documents in multiple topics, enabling modular design.

  3. Maintainability:
  Future changes to the hierarchy (e.g., moving topics) don't affect the knowledge-base collection.


  Given this context, we have to implement the scenarios where we can crud any doc in kb and playbook
  collections.

  Scenario 1 - Adding a new topic to the playbook
    needs to be stored in kb?
      add the full text, call the related genkit flow and let it create the kb doc:
      simply add the playbook doc with kbId="";

  Scenario 2 - Deleting an existing topic from the playbook
    does it have kbId && do you want to delete the kb doc as well?
      delete both docs:
      delete topic (and its sub-collections, i.e. discussion, if they exist) ;

  Scenario 3 - Updating an existing topic in the playbook
    does it have kbId?
      depend on the field(s) update: only topic or both
        case (kbId, parentId, order, subtitle, published): only topic updates
        case (title, tags): both playbook & kb doc updates
        In any case we always update timestamps.updated_at field for both docs:
      simply only update the topic doc;

 Note 1: A topic might have 'discussions' sub-collection where invited parties share their thoughts and
 come to a consensus before publishing the topic.

 Note 2: All deletes are actually soft delete (timestamps.deleted_at).
   A maintenance cloud scheduler which runs weekly is in charge of hard deleting any document
   which is older than three months.
 Note 3: For KB scenarios, refer to the comments in the kb model
 */
