import { Member } from '@shared/interfaces';
import { MemberRank } from '@shared/enums';

const CEO: Partial<Member> = {
  role: 'Chief Executive Officer',
  rank: MemberRank.CSuite,
  order: 0,
  department: 'C-Suite',
};

const CTO: Partial<Member> = {
  role: 'Chief Technology Officer',
  rank: MemberRank.CSuite,
  order: 1,
  department: 'Tech',
};

const CMO: Partial<Member> = {
  role: 'Chief Marketing Officer',
  rank: MemberRank.CSuite,
  order: 2,
  department: 'Marketing',
};

const COO: Partial<Member> = {
    role: 'Chief Operating Officer',
    rank: MemberRank.CSuite,
    order: 1,
    department: 'Operations',
};

const FullStackDeveloper: Partial<Member> = {
    role: 'Full-Stack Developer',
    rank: MemberRank.Department,
    order: 10,
    department: 'Tech',
};

const UXUIDesigner: Partial<Member> = {
    role: 'UX/UI Designer',
    rank: MemberRank.Department,
    order: 11,
    department: 'Tech',
};

const Accountant: Partial<Member> = {
    role: 'Accountant',
    rank: MemberRank.Department,
    order: 10,
    department: 'Operations',
};

const SalesOfficer: Partial<Member> = {
    role: 'Sales Officer',
    rank: MemberRank.Department,
    order: 11,
    department: 'Operations',
};

const ContentCreator: Partial<Member> = {
    role: 'Content Creator',
    rank: MemberRank.Department,
    order: 12,
    department: 'Operations',
};


export const TECH_FIRM_TEAM_BASIC: Partial<Member>[] = [
  CEO,
  CTO,
  CMO,
  FullStackDeveloper,
  UXUIDesigner
];

export const REAL_ESTATE_TEAM_BASIC: Partial<Member>[] = [
    CEO,
    COO,
    Accountant,
    SalesOfficer,
    ContentCreator
];
