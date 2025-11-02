# Profile Tech Spec

## 1. Overview

The **Profile** document represents the root identity for each user in the platform.
It defines ownership, subscription plan, preferences, security, and global settings.
Each company, team, and AI agent exists under a profile hierarchy in Firestore.

```
profiles/{profileId}
  ├─ companies/{companyId}
  │    ├─ team/{memberId}
  │    ├─ tickets/{ticketId}
  │    ├─ playbook/{topicId}
  │    └─ ...
  └─ ...
```

Profiles provide:

* Identity and access control
* Billing and plan tracking
* Preferences and personalization
* Global context for company-level features

---

## 2. Firestore Structure

| Collection                 | Document ID   | Purpose                                               |
| -------------------------- | ------------- | ----------------------------------------------------- |
| `/profiles`                | `{profileId}` | Root identity; maps to Firebase Auth UID              |
| `/profiles/{id}/companies` | `{companyId}` | Company-level contexts with their own MCP connections |
| `/profiles/{id}/settings`  | optional      | Advanced settings or logs                             |

Each document uses Firestore’s internal `doc.id` as UID; no `uid` field is stored explicitly.

---

## 3. Profile Interface

```ts
export interface Profile {
  display_name: string;
  firstname: string;
  lastname: string;
  avatar: string;
  biography?: string;
  tag: number;

  // Ownership and plan
  currentPlan: CurrentPlan;
  planHistory?: PlanChange[];
  billingId?: string;
  defaultCompanyId?: string;

  // Preferences
  language?: string;
  theme?: Theme;
  socials?: Social[];

  // Rewards / gamification
  balances?: Balance[];
  loyalty?: Loyalty;
  achievements?: number[];

  // Security
  security: Security;
  suspended: boolean;
  verified?: boolean;

  // System meta
  lastLogin?: number;
  sendMe: SendMe;
  isAdmin: boolean;
  timestamps: Timestamps;
}

export interface ProfileWithId extends Profile {
  id: string;
}
```

---

## 4. Related Interfaces

### 4.1. Security

```ts
export interface Security {
  private: boolean;
  emailSafetyCode: string;
  pinCode: string;
  mobile: string;
  twoFA: TwoFA;
  ipTracking: IpTracking[];
}

export interface TwoFA {
  paired: boolean;
  active: boolean;
}

export interface IpTracking {
  when: number;
  ip: string;
}
```

### 4.2. SendMe

```ts
export interface SendMe {
  email: boolean;
  newsletter: boolean;
  notification: boolean;
}
```

### 4.3. PlanChange and Enums

```ts
export interface PlanChange {
  from: Plan;
  to: Plan;
  reason: PlanChangeReason;
  cycle?: BillingCycle;
  timestamp: number;
  performedBy: string;
  notes?: string;
}

export enum Plan {
  Free = 'free',
  Basic = 'basic',
  Pro = 'pro',
}

export enum BillingCycle {
  Monthly = 'monthly',
  Annually = 'annually',
}

export enum PlanChangeReason {
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  EXPIRED = 'expired',
  TRIAL_STARTED = 'trial started',
  TRIAL_ENDED = 'trial ended',
  ADMIN_ADJUSTMENT = 'admin adjustment',
  BILLING_FAILURE = 'billing failure',
  OTHER = 'other'
}
```

---

## 5. Architecture Overview

### Core Responsibilities

* Identity and authentication
* Billing and plan enforcement
* Security and user verification
* Personalization and preferences
* Company management (per-tenant structure)

### High-Level Architecture

```
┌────────────────────────────────┐
│          Profile Doc            │
│  - currentPlan, planHistory     │
│  - security, preferences        │
│  - timestamps, theme, etc.      │
└──────────────┬─────────────────┘
               │
     Firestore Triggers
               │
┌────────────────────────────────┐
│ Firebase Functions / GenKit     │
│  - onCreate → bootstrap company │
│  - onUpdate → sync plan changes │
│  - onDelete → cascade cleanup   │
└────────────────────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ External Integrations           │
│  - Payment Gateway (generic)    │
│  - Vertex AI / MCP Registry     │
│  - n8n MCP Server (automation)  │
└────────────────────────────────┘
```

---

## 6. System Interactions

| Event                        | Trigger                                  | Action                                                               |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| **Profile created**          | `onCreate(profile)`                      | Initialize defaults (security, plan = free, welcome workflow).       |
| **Plan upgraded/downgraded** | Payment Gateway webhook → Cloud Function | Append to `planHistory`, update `currentPlan`.                       |
| **Security updated**         | Profile update                           | Regenerate safety code, refresh sessions if needed.                  |
| **Profile deleted**          | Auth deletion event                      | Cascade delete all subcollections (companies, teams, tickets, etc.). |

---

## 7. Integration Notes

| Concern              | Strategy                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **Email privacy**    | Emails stored only in Firebase Auth; not duplicated in Firestore.                              |
| **UID**              | Firestore `doc.id` serves as the unique identifier.                                            |
| **Access control**   | Enforced by Firestore rules and Firebase Auth context.                                         |
| **Plan enforcement** | Cloud Functions validate plan tier before enabling premium features.                           |
| **MCP connections**  | Defined **per company**, not per profile, to isolate tools and credentials between businesses. |

---

## 8. Future Extensions

* Add `activityLog` subcollection for audit trails.
* Support additional plan tiers (`enterprise`, `custom`).
* Implement usage-based billing via plan metrics.
* Enhance security: add trusted devices list and location-based login alerts.

---

### ✅ Summary

The **Profile** feature defines the root identity and configuration for every user account.
It manages authentication, plan history, preferences, and security, while delegating
MCP connectivity and automation capabilities to **company-level contexts**.
