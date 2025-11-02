# Agent Card Storage and Discovery Design (A2A-Compliant)

## Overview

This document defines how **agent cards** (A2A-compliant metadata descriptors) are stored, served, and discovered within our platform.
The updated design fully aligns with the A2A and OpenAPI 3.0 specifications — including built-in authentication and authorization mechanisms.

The architecture supports both:

* **Public Agents:** Discoverable and callable through the marketplace.
* **Private Agents:** Company-owned agents, discoverable but protected via declared security schemes. (stored in `profiles/{profileId}/companies/{companyId}/team/{memberId}`)

---

## 1. Storage Model

### Unified Endpoint

All agent cards — both public and private — are served from the same structured location:

```
https://wtf.pub/.well-known/agent-cards/{memberId}.json
```

### Public Agents

* **Purpose:** Discoverable via the marketplace and callable without authentication.
* **Storage Source:** Metadata stored in Firestore (e.g., `companies/{companyId}/team/{memberId}`).
* **Example:**

  ```json
  {
    "id": "https://wtf.pub/.well-known/agent-cards/6r0tG0deTqaC8YwEh9Hz.json",
    "name": "Support Bot",
    "description": "Handles basic user inquiries.",
    "securitySchemes": {},
    "security": [],
    "skills": [
      { "name": "faqLookup", "url": "https://mcp.wtf.pub/faq" }
    ]
  }
  ```

### Private Agents

* **Purpose:** Restricted to internal users or authorized systems.
* **Access Control:** Defined declaratively using `securitySchemes` and `security` per the A2A spec.
* **Example:**

  ```json
  {
    "id": "https://wtf.pub/.well-known/agent-cards/TqaC8G0deYwEh9Hz6r0t.json",
    "name": "Ops Assistant",
    "description": "Handles internal task automation.",
    "securitySchemes": {
      "firebaseAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Firebase ID token required for access"
      },
      "mTLS": {
        "type": "mutualTLS",
        "description": "Optional client certificate validation"
      }
    },
    "security": [
      { "firebaseAuth": [] },
      { "mTLS": [] }
    ],
    "skills": [
      { "name": "bpmnRunner", "url": "https://mcp.internal.wtf.pub/run-bpmn" },
      { "name": "knowledgeBase", "url": "https://mcp.internal.wtf.pub/kb" }
    ]
  }
  ```

---

## 2. Discovery Mechanism

### Global Discovery Index

A centralized public index lists all **discoverable** agents:

```
https://wtf.pub/.well-known/agents/index.json
```

Example:

```json
{
  "agents": [
    "https://wtf.pub/.well-known/agent-cards/support-bot.json",
    "https://wtf.pub/.well-known/agent-cards/ops-assistant.json"
  ]
}
```

Each agent’s card defines its own authentication requirements, enabling compliant clients to determine which agents they can access.

### Authenticated Access

For private agents:

* The card itself declares what authentication methods are supported.
* The platform’s backend validates incoming credentials (e.g., Firebase JWT, mTLS certs).
* Clients that lack proper credentials will receive a **403** response when attempting to call restricted endpoints.

No separate “extended card” or “private card” documents are needed — **everything is declared in one canonical card**.

---

## 3. Hosting and Delivery

| Layer                                  | Responsibility                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Firebase Hosting / Cloud Run**       | Serves `.well-known/agent-cards/*` and `.well-known/agents/index.json`.                                          |
| **Cloud Function / Cloud Run Handler** | Interprets `securitySchemes` and validates requests.                                                             |
| **Firestore Metadata**                 | Stores minimal agent info (`securityType`, `runtime`, `model`, `tools[]`) for internal lookups and regeneration. |

**Example Routing Rule:**

```
/well-known/agent-cards/{memberId}.json → functions.serveAgentCard(memberId)
```

**Behavior:**

* Public agents: served statically or via cached CDN.
* Private agents: validated dynamically before returning content.
* Unauthorized access: returns HTTP 403.

---

## 4. Advantages of the Unified Model

* ✅ Fully compliant with A2A and OpenAPI 3.0.
* ✅ Single, predictable discovery endpoint for all agents.
* ✅ No duplicated “extended card” logic or schema extensions.
* ✅ Explicit and machine-readable security declarations.
* ✅ Scales well with company-specific or marketplace-level discovery.

---

## 5. Example Hybrid Discovery Flow

1. **Client discovers agent card:**
   `GET https://wtf.pub/.well-known/agent-cards/ops-assistant.json`
2. **Client inspects card:**
   Notices the `firebaseAuth` scheme → retrieves a Firebase ID token.
3. **Client calls the agent’s MCP endpoint:**
   `POST https://mcp.internal.wtf.pub/run-bpmn` with `Authorization: Bearer <token>`.
4. **Backend validates JWT** against Firebase and executes request.
5. **Response returned** in MCP-compliant format.

---

## 6. Future Enhancements

* Add versioned cards:
  `https://wtf.pub/.well-known/agent-cards/{memberId}@v2.json`
* Support signed temporary access URLs.
* Extend the index for search, categories, and marketplace listings.
* Integrate Cloud Monitoring for per-agent observability metrics.

