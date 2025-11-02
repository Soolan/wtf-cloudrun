# Finance Department User Journey

## 1. Overview

This document describes how the **Finance Department** operates inside the AI platform using:

* **Base agents** (shared archetypes)
* **A2A (Agent-to-Agent) Protocol** for collaboration
* **MCP (Model Context Protocol)** for tool invocation
* **Firebase functions/GenKit flows** for executing backend logic

All layers are designed to be **multi-tenant, scalable, and dynamically loaded** from Firestore, minimizing duplicated infrastructure.

---

## 2. User Journey: CFO – “Prepare Quarterly Financial Overview”

### 2.1 Scenario

A company’s CFO agent is assigned the task:
**“Prepare Q3 Financial Overview for Board Meeting.”**

### 2.2 Participants

| Role                  | Responsibility                                             |
| --------------------- | ---------------------------------------------------------- |
| CFO                   | Oversees reporting, delegates subtasks, validates outcomes |
| FP&A Analyst          | Produces forecasts and variance reports                    |
| Accounting Specialist | Reconciles ledgers and produces statements                 |
| Auditing Analyst      | Verifies compliance and risk metrics                       |

---

## 3. Step-by-Step System Flow

| Step | Action                                     | Layer               | Example Components                    |
| ---- | ------------------------------------------ | ------------------- | ------------------------------------- |
| 1    | **Ticket created** by human/CEO            | Firestore           | User → Cloud Function                 |
| 2    | **Clarify phase** – CFO validates ticket   | Agent runtime + MCP | CFO → `kb.query`                      |
| 3    | **Decompose tasks** – CFO assigns subtasks | A2A                 | CFO → FP&A, Accounting, Auditing      |
| 4    | **Subtask execution**                      | MCP + GenKit        | Accounting → `accounting.reconcile()` |
| 5    | **Subtask completion**                     | A2A + Firestore     | Agents update → CFO notified          |
| 6    | **CFO review**                             | MCP                 | `financialReporting.compile()`        |
| 7    | **Ticket closed**                          | Firestore           | Dashboard / Audit log update          |

---

## 4. Key Interactions

### 4.1 Clarification Phase (Upward Communication)

If the CFO lacks sufficient info:

```json
{
  "from": "cfo",
  "to": "ceo",
  "messageType": "CLARIFICATION_REQUEST",
  "payload": {
    "ticketId": "ticket-2025Q3",
    "missing": ["Revenue dataset link", "Updated forecast template"]
  }
}
```

Clarification flows **upward** to the task creator (human or CEO).

---

### 4.2 Knowledge Base Query via MCP

```json
POST /mcp/kb.query
{
  "caller": { "path": "profiles/abc/companies/xyz/team/cfo" },
  "payload": {
    "query": "Q3 financial reporting process",
    "namespace": "finance-kb"
  }
}
```

**Runtime resolution:**

1. MCP Gateway parses `caller.path`
2. Loads Firestore context:

  * `profileId`, `companyId`, `memberId`
3. Fetches adapter mapping (`/settings/adapters/kb`)
4. Executes vector search and returns results

One **shared MCP Gateway** dynamically routes per-company requests.

---

### 4.3 Task Decomposition and A2A Messaging

CFO creates 3 subtasks and delegates via A2A:

```json
{
  "from": "cfo",
  "to": "fpna",
  "messageType": "TASK_ASSIGNMENT",
  "payload": {
    "ticketId": "ticket-2025Q3-fpna",
    "summary": "Generate variance & forecast analysis"
  }
}
```

A2A messages are event-based (Firestore or Pub/Sub) and scoped by `companyId`.

---

### 4.4 Subtask Execution via MCP

Example: Accounting agent reconciles ledgers

```json
POST /mcp/accounting.reconcile
{
  "caller": { "path": "profiles/abc/companies/xyz/team/accounting" },
  "payload": {
    "source": "gs://xyz/data/2025Q3/transactions.csv",
    "destination": "gs://xyz/reports/q3/ledger-final.json"
  }
}
```

MCP Gateway → Adapter → GenKit Flow → Output written to Cloud Storage.

---

### 4.5 CFO Review and Aggregation

CFO compiles results:

```json
POST /mcp/financialReporting.compile
{
  "caller": { "path": "profiles/abc/companies/xyz/team/cfo" },
  "payload": {
    "inputs": [
      "gs://xyz/reports/q3/ledger-final.json",
      "gs://xyz/reports/q3/forecast.pdf",
      "gs://xyz/reports/q3/audit-summary.json"
    ],
    "template": "https://docs.companyx.com/board/template"
  }
}
```

Final report stored, ticket marked as `done`.

---

## 5. Multi-Tenant Architecture

### 5.1 Base Agent Model

Agents share archetypal definitions stored in a central registry.

**Structure**

```
agents/
└── finance/
    ├── cfo.json
    ├── fpna.json
    ├── accounting.json
    └── auditing.json
```

**Example – cfo.json**

```json
{
  "role": "Chief Financial Officer",
  "description": "Oversees all financial operations.",
  "defaultModel": "gemini-1.5-pro",
  "tools": ["financialReporting.compile", "kb.query"],
  "skills": ["clarificationRequest", "taskDecomposition"],
  "security": { "type": "firebaseAuth" }
}
```

When a company creates a CFO, it **extends** this base definition:

```json
{
  "extends": "finance/cfo",
  "knowledgeBase": "gs://companyX/finance-kb",
  "tools": ["accounting.reconcile", "financialReporting.compile"],
  "collaborators": ["fpna", "accounting", "auditing"]
}
```

**Runtime merge logic:**

```ts
const agent = deepMerge(loadBase(agent.extends), agent);
```

No separate runtime instances are created per company; only configuration differs.

---

### 5.2 A2A Broker

* Backed by Firestore or Pub/Sub.
* Messages include `from`, `to`, `companyId`, `payload`.
* Each agent listens to messages filtered by its own ID and company scope.

### 5.3 MCP Gateway

* Single global instance for all tenants.
* Resolves adapters dynamically per request.
* Uses Firestore to look up:

  * Company credentials
  * Custom adapter endpoints
* Adapters trigger GenKit flows, Vertex calls, or NVIDIA models.

---

### 5.4 Data Isolation

| Layer        | Isolation Mechanism                                        |
| ------------ | ---------------------------------------------------------- |
| Firestore    | Namespaced by `profiles/{profileId}/companies/{companyId}` |
| MCP          | Context resolved via `caller.path`                         |
| A2A          | Messages filtered by `companyId`                           |
| Storage / KB | Dedicated `gs://{companyId}/` bucket prefix                |

---

## 6. System Trace Summary

| Concept            | Practical Function                                    |
| ------------------ | ----------------------------------------------------- |
| **Base Agent**     | Shared archetype defining tools, skills, prompts      |
| **Agent Instance** | Firestore doc extending a base agent                  |
| **A2A Protocol**   | Event-driven communication for delegation and results |
| **MCP Gateway**    | Dynamic tool invocation and model access              |
| **GenKit Flow**    | Execution backend for data processing                 |
| **Firestore**      | Persistent ticket, team, and task state               |

---

## 7. Architectural Advantages

| Dimension           | Benefit                                                          |
| ------------------- | ---------------------------------------------------------------- |
| **Scalability**     | Single MCP & A2A infrastructure for infinite tenants             |
| **Maintainability** | Base agent definitions updated centrally                         |
| **Isolation**       | Company-scoped Firestore and credentials                         |
| **Cost Efficiency** | Serverless execution, scale-to-zero when idle                    |
| **Extensibility**   | New roles or departments added by creating base agent JSON files |

---

## 8. Next Steps

1. Define the **Base Agent Manifest Schema** (required fields, inheritance rules).
2. Implement the **MCP Gateway Resolver** to map `caller.path` → adapter configuration.
3. Deploy the **A2A Broker** using Firestore triggers or Pub/Sub topics.
4. Integrate **GenKit flows** for financial tools (`accounting.reconcile`, `financialReporting.compile`).

---
