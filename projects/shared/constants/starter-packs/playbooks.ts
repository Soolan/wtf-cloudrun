import { Topic } from '@shared/interfaces';
import { TopicStatus } from '@shared/enums';

const TECH_FIRM_PLAYBOOK_TOPICS: Partial<Topic>[] = [
    {
        title: 'Engineering Principles',
        subtitle: 'Core principles for writing and shipping code.',
        order: 1,
        status: TopicStatus.Accept,
        tags: ['engineering', 'best-practices'],
    },
    {
        title: 'Marketing & SEO Strategy',
        subtitle: 'Guidelines for content and search engine optimization.',
        order: 2,
        status: TopicStatus.Accept,
        tags: ['marketing', 'seo'],
    }
];

const REAL_ESTATE_PLAYBOOK_TOPICS: Partial<Topic>[] = [
    {
        title: 'Client Onboarding Process',
        subtitle: 'Steps for onboarding a new real estate client.',
        order: 1,
        status: TopicStatus.Accept,
        tags: ['sales', 'client-onboarding'],
    },
    {
        title: 'Property Listing Guidelines',
        subtitle: 'How to list a new property on the market.',
        order: 2,
        status: TopicStatus.Accept,
        tags: ['operations', 'listings'],
    }
];

export const STARTER_PACK_PLAYBOOKS = {
    'Tech Firm': TECH_FIRM_PLAYBOOK_TOPICS,
    'Real Estate': REAL_ESTATE_PLAYBOOK_TOPICS
}
