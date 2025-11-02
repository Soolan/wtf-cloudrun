# 🧩 Team Tech Spec

## Overview

The **Team module** represents the unified layer where **human employees** and **AI agents** coexist under a company context.
Each team member is modeled via a standardized structure and connected to Firestore, MCP registries, and agent cards hosted dynamically under `.well-known`.

This design ensures:

* **Consistent handling** of both human and AI entities.
* **Dynamic registration** of AI agents as public Agent Cards.
* **Integration with Vertex AI Agent Builder** and **NVIDIA runtime**.
* **Seamless A2A (Agent-to-Agent) collaboration** within the same company workspace.

---

## Firestore Structure

```
profiles/{profileId}/companies/{companyId}/team/{memberId}
```

Each member document corresponds to a human collaborator or an AI agent with a reference to its `.well-known` card.

---

## Member Interface

```ts
import {Entity, EntityType} from '@shared/interfaces/entity';
import {MemberRank, InvitationStatus} from '@shared/enums';
import {Timestamps} from '@shared/interfaces/timestamps';

export interface Member {
  persona: Entity;             // Basic entity data (name, role, avatar, type)
  contact: string[];           // Emails, LinkedIn, etc.
  rank: MemberRank;            // Board, CSuite, Department
  department: string;          // i.e. Finance, Tech, Operations
  members: string[];           // Direct reports (IDs)
  status?: InvitationStatus;   // Pending, Accepted, etc.
  agentCard?: string;          // .well-known JSON URL for AI agents
  timestamps: Timestamps;      // Created/updated times
}
```

### Supporting Enums

```ts
export enum MemberRank {
  Board = 'Board',
  CSuite = 'CSuite',
  Department = 'Department'
}

export enum EntityType {
  Human = 'human',
  AI = 'ai'
}

export enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Expired = 'expired'
}
```

### Entity Interface

```ts
export interface Entity {
  name: string;
  role: string;
  avatar: string;
  type: EntityType; // Human or AI
}
```

---

## Agent Card URL Path Convention

Agent cards follow the **`.well-known` URL path convention**, which is a **standardized route** for publishing public metadata.
They are *not physically stored inside our repo*, but are dynamically generated and served under predictable URLs.

**Example:**

```
https://wtf.pub/.well-known/agent-cards/6r0tG0deTqaC8YwEh9Hz.json
```

This URL is powered by a Cloud Function or Hosting rewrite that internally reads from Firestore or Cloud Storage, giving the illusion of a static JSON file while maintaining full dynamic control.

---

## Agent Card Architecture (Hybrid Model)

The system uses a **hybrid approach** combining **Firestore (source of truth)** and **Cloud Storage (public cache)**.
This ensures that cards are versioned, easy to query, and globally accessible under standard web URLs.

### Firestore

Each AI member automatically creates a companion document:

```
agent_cards/{memberId}
```

This document stores the complete official [A2A Agent Card JSON](https://a2a-protocol.org/latest/specification/#5-agent-discovery-the-agent-card) verbatim (no custom schema).
Admins or internal services can write to it directly using JSON validated against the A2A schema.

### Cloud Storage Mirror

A Cloud Function listens for writes to agent_cards/{memberId} and mirrors the JSON to:

.well-known/agent-cards/{memberId}.json

The file contents are identical to the Firestore document—no transformation—ensuring external consumers receive the same structure.

### Validation & Signing

Each write is validated against the official A2A JSON Schema (protocol ≥ 0.2.9).

Optionally, the platform adds a server-side digital signature under the signatures array.

### Credentials

Secrets or credentials are never stored in the public card; instead, a reference to a secured extended card may be provided via the supportsAuthenticatedExtendedCard flag.

### Example: A2A-Compliant Agent Card (stored verbatim)

```json
{
  "protocolVersion": "0.2.9",
  "name": "GeoSpatial Route Planner Agent",
  "description": "Provides advanced route planning, traffic analysis, and custom map generation services. This agent can calculate optimal routes, estimate travel times considering real-time traffic, and create personalized maps with points of interest.",
  "url": "https://georoute-agent.example.com/a2a/v1",
  "preferredTransport": "JSONRPC",
  "additionalInterfaces" : [
    {"url": "https://georoute-agent.example.com/a2a/v1", "transport": "JSONRPC"},
    {"url": "https://georoute-agent.example.com/a2a/grpc", "transport": "GRPC"},
    {"url": "https://georoute-agent.example.com/a2a/json", "transport": "HTTP+JSON"}
  ],
  "provider": {
    "organization": "Example Geo Services Inc.",
    "url": "https://www.examplegeoservices.com"
  },
  "iconUrl": "https://georoute-agent.example.com/icon.png",
  "version": "1.2.0",
  "documentationUrl": "https://docs.examplegeoservices.com/georoute-agent/api",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": false
  },
  "securitySchemes": {
    "google": {
      "type": "openIdConnect",
      "openIdConnectUrl": "https://accounts.google.com/.well-known/openid-configuration"
    }
  },
  "security": [{ "google": ["openid", "profile", "email"] }],
  "defaultInputModes": ["application/json", "text/plain"],
  "defaultOutputModes": ["application/json", "image/png"],
  "skills": [
    {
      "id": "route-optimizer-traffic",
      "name": "Traffic-Aware Route Optimizer",
      "description": "Calculates the optimal driving route between two or more locations, taking into account real-time traffic conditions, road closures, and user preferences (e.g., avoid tolls, prefer highways).",
      "tags": ["maps", "routing", "navigation", "directions", "traffic"],
      "examples": [
        "Plan a route from '1600 Amphitheatre Parkway, Mountain View, CA' to 'San Francisco International Airport' avoiding tolls.",
        "{\"origin\": {\"lat\": 37.422, \"lng\": -122.084}, \"destination\": {\"lat\": 37.7749, \"lng\": -122.4194}, \"preferences\": [\"avoid_ferries\"]}"
      ],
      "inputModes": ["application/json", "text/plain"],
      "outputModes": [
        "application/json",
        "application/vnd.geo+json",
        "text/html"
      ]
    },
    {
      "id": "custom-map-generator",
      "name": "Personalized Map Generator",
      "description": "Creates custom map images or interactive map views based on user-defined points of interest, routes, and style preferences. Can overlay data layers.",
      "tags": ["maps", "customization", "visualization", "cartography"],
      "examples": [
        "Generate a map of my upcoming road trip with all planned stops highlighted.",
        "Show me a map visualizing all coffee shops within a 1-mile radius of my current location."
      ],
      "inputModes": ["application/json"],
      "outputModes": [
        "image/png",
        "image/jpeg",
        "application/json",
        "text/html"
      ]
    }
  ],
  "supportsAuthenticatedExtendedCard": true,
  "signatures": [
    {
      "protected": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpPU0UiLCJraWQiOiJrZXktMSIsImprdSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vYWdlbnQvandrcy5qc29uIn0",
      "signature": "QFdkNLNszlGj3z3u0YQGt_T9LixY3qtdQpZmsTdDHDe3fXV9y9-B3m2-XgCpzuhiLt8E0tV6HXoZKHv4GtHgKQ"
    }
  ]
}
```
This exact JSON lives in Firestore and is mirrored 1-to-1 to public Storage.

---

## Agent Card Lifecycle

### Create / Update
- When a new AI member is created in team/{memberId}, a Firestore function builds an initial A2A Agent Card (based on templates or user input) and saves it under agent_cards/{memberId}.
- A trigger validates and mirrors the card to Storage at .well-known/agent-cards/{memberId}.json.

### Read
- Public or partner agents discover the card at its .well-known URL.
- Internal services read from Firestore for analytics or management.

### Delete
- Removing a member deletes both the Firestore card and its mirrored Storage file.

---

### Example: Firestore Trigger (Simplified)

```ts
exports.onMemberChange = onDocumentWritten(
  'profiles/{p}/companies/{c}/team/{memberId}',
  async (event) => {
    const after = event.data?.after?.data();
    if (!after || after.persona.type !== 'ai') return;

    const card = buildAgentCard(after);

    // Save to Firestore
    await db.doc(`agent_cards/${event.params.memberId}`).set(card);

    // Save to Cloud Storage
    await storage.bucket('wtf-pub-agent-cards')
      .file(`${event.params.memberId}.json`)
      .save(JSON.stringify(card, null, 2), {contentType: 'application/json'});
  }
);
```

---

## A2A and Agent Interoperability

* Agents communicate through **A2A events** stored in Firestore and processed by **Cloud Functions**.
* Each agent can discover and invoke others’ `.well-known` cards within the same company.
* Access to company MCP endpoints is determined by the **Company’s `mcpConnections` key**.
* The **CFO → Accounting → Reporting** flow (from previous doc) uses these cards as the discovery layer.

---

## Vertex AI + NVIDIA Integration

1. **Vertex AI Agent Builder**
Vertex AI Agent Builder runtimes are described within each card’s url, preferredTransport, and skills definitions.

2. **NVIDIA Integration**
NVIDIA Adapters can be represented as additional transports or as skill endpoints supporting specific compute interfaces.

---

## Example User Journeys

### 1️⃣ Invite a Human Member

1. Admin invites `john@mysite.com` as “Finance Analyst”.
2. No agent_cards document is created.
3. `team/{memberId}` is created with:
   * `persona.type = 'human'`
   * `status = 'pending'`

4. Firebase Function sends invite email.
5. When accepted, a Firebase Auth account is created and linked via `memberId`.
6. Member gains access scoped by company role.

---

### 2️⃣ Create an AI Agent

1. Admin clicks **“Add AI Agent”** and fills the details for “Chief Financial Officer”.
2. New `team/{memberId}` created with:
   * `persona.type = 'ai'`
3. Cloud Function generates an A2A-compliant Agent Card JSON and writes it to `agent_cards/{memberId}` collection.
4. The same JSON is published to Storage:  `.well-known/agent-cards/{memberId}.json`.
5. Agent becomes discoverable by others via A2A or workflow orchestration.

---

### 3️⃣ Agent Execution via A2A & MCP

1. The CFO Agent reads its .well-known card to identify available transports and skills.
2. It communicates with subordinate agents (Accounting, Auditing) by resolving their public cards.
3. Tasks invoking tools or APIs use declared MCP endpoints in the corresponding skill definitions.
4. Each sub-agent executes work and reports via A2A messaging (clarification → execution → result).
5. Results are recorded in Firestore and optionally evaluated by the CFO Agent or human supervisor.

## Summary

| Concept                | Implementation                           | Notes                         |
| ---------------------- | ---------------------------------------- | ----------------------------- |
| **Entity abstraction** | Shared `Entity` interface                | Unifies human/AI records      |
| **Agent Cards**        | Firestore → Storage mirror               | Verbatim A2A JSON             |
| **Validation**         | Official A2A JSON Schema                 | Prevents schema drift         |
| **A2A communication**  | Protocol-compliant discovery + messaging | No proprietary extensions     |
| **Vertex AI + NVIDIA** | Declared as skill endpoints / transports | Standardized across vendors   |
| **Security**           | A2A `securitySchemes` + Firebase Auth    | Secrets handled outside cards |
