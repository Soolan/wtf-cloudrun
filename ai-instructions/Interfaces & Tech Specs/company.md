# Company Tech Spec

## Overview

The **Company** feature represents an independent organizational entity within the system.
Each company operates under a user profile and acts as the root context for all subordinate modules:

* Team (AI agents and human members)
* Tickets (tasks and workflows)
* Playbook (knowledge and processes)
* BPM/BPA (process models and automation)
* Integrations (MCP connections, domains, branding)

Firestore path:

```
profiles/{profileId}/companies/{companyId}
```

---

## 1. Interface Schema

```ts
export interface Company {
  name: string;
  logo: string;
  description?: string;
  website?: string;
  email?: string;
  banner: string;
  bannerAlt?: string;
  tags?: string[];
  socials?: Social[];
  colorPalette?: string[];  // hex codes for 'primary', 'accent', 'warn'. ['#a387f4', '#b3829c', '#eeffaa']
  domains?: CustomDomain[];

  // Integrations
  mcpConnections?: MCPConnection[];
  defaultMCPNamespace?: string;

  // Status
  status: CompanyStatus;

  // System
  timestamps: Timestamps;
}

export enum CompanyStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  SUSPENDED = 'suspended'
}
```

### Subinterfaces

**MCPConnection**

```ts
export interface MCPConnection {
  name: string;
  endpoint: string;
  authType: AuthType;
  description?: string;
  scopes?: string[];
}
```

**CustomDomain**

```ts
export interface CustomDomain {
  wtfProduct: Product;
  timer: number;
  domain: string;
  forwardTo: string;
  status: DnsVerificationStatus;
  record: DnsRecord;
  verifiedAt?: number;
}

export interface DnsRecord {
  name: string;
  type: string;
  data: string;
}
```

**HostCompany**

```ts
export interface HostCompany {
  id: string;
  url: string;
  name?: string;
}
```

---

## 2. Data Model & Firestore Design

* Each company document is a top-level subcollection under a profile.
* Company-related entities are nested:

  ```
  profiles/{profileId}/companies/{companyId}/team/{memberId}
  profiles/{profileId}/companies/{companyId}/tickets/{ticketId}
  profiles/{profileId}/companies/{companyId}/playbook/{topicId}
  ```
* This structure guarantees strict data isolation per company and allows scalable indexing and querying.

---

## 3. Key Architectural Decisions

### 🔹 Enum-Only Keys

All fixed-value properties (status, DNS type, auth type, product, etc.) are represented by enums.
This ensures strong typing, prevents string mismatches, and simplifies future schema evolution.

### 🔹 MCP-First Integration

`mcpConnections` defines integration endpoints dynamically available to the company and is stored directly in the **Company document**.  
Agents and workflows can query this field to discover available namespaces and tools.  
`defaultMCPNamespace` lets them resolve preferred routes automatically.

When a user adds a new MCP, credentials (API keys, OAuth tokens, etc.) can be securely stored at the company level.  
These credentials reuse the existing shared `Credentials` interface, ensuring consistent handling across all integrations.

---

### MCPConnection Interface

```ts
export interface MCPConnection {
  name: string;            // Display name (e.g. "n8n Automation Server")
  endpoint: string;        // Base URL of MCP server
  authType: AuthType;      // How this MCP authenticates
  description?: string;    // Optional description
  scopes?: string[];       // Available scopes or namespaces
  credentials?: Credentials; // Optional credential payload
}
```

#### Credentials Interface

```ts
export interface Credentials {
  apiKey?: string;        // For API_KEY auth
  token?: string;         // For BEARER auth
  username?: string;      // For BASIC auth
  password?: string;      // For BASIC auth
  clientId?: string;      // For OAUTH2
  clientSecret?: string;  // For OAUTH2
  accessToken?: string;   // For OAUTH2
  refreshToken?: string;  // Optional for OAUTH2
}
```

---

### Example: Adding and Registering a New MCP

#### Step 1. MCP Discovery
The user opens *Integrations → Add MCP*, and the client queries the global registry at:
```
mcp_registry/{mcpId}
```

**Registry Example:**
```json
{
  "name": "n8n Automation Server",
  "namespace": "automation.n8n",
  "endpoint": "https://mcpmarket.com/server/n8n-9",
  "authType": "apiKey",
  "description": "Provides node-based workflow automation via MCP.",
  "scopes": ["workflow.create", "workflow.execute"]
}
```

---

#### Step 2. User Adds MCP and Sets Credentials

After selection, the UI prompts for credentials if needed.

**Firestore Patch:**
```
PATCH profiles/{profileId}/companies/{companyId}
```

**Payload Example:**
```json
{
  "mcpConnections": [
    {
      "name": "n8n Automation Server",
      "endpoint": "https://mcpmarket.com/server/n8n-9",
      "authType": "apiKey",
      "description": "Workflow automation nodes via MCP",
      "scopes": ["workflow.create", "workflow.execute"],
      "credentials": {
        "apiKey": "n8n_live_ABC123..."
      }
    }
  ]
}
```

---

#### Step 3. Capability Discovery

A Cloud Function listens for changes to the company document:
```
onUpdate(profiles/{profileId}/companies/{companyId})
```

When new MCP entries are detected, it calls the MCP server’s `/capabilities` endpoint to retrieve available tools and stores them in a **centralized Company Capability Cache**.

Example:
```
GET https://mcpmarket.com/server/n8n-9/capabilities
```

**Response:**
```json
{
  "namespace": "automation.n8n",
  "tools": ["workflow.create", "workflow.execute"]
}
```

---

#### Step 4. Default MCP Namespace

Companies can optionally specify a default MCP:
```ts
defaultMCPNamespace = "automation.n8n";
```

Agents and workflows automatically route calls without explicit namespace to this default.

---

#### Step 5. Agent and Workflow Usage

When an agent or workflow runs:
```
POST /mcp/execute
{
  "namespace": "automation.n8n",
  "tool": "workflow.create",
  "payload": { ... }
}
```
the system looks up the correct entry in `mcpConnections`, attaches the credentials dynamically according to `authType`, and authenticates securely before making the external request.

---

### Example User Journey

1. **User:** Clicks “Add Integration → Add MCP Server.”  
2. **Client:** Fetches available MCPs from `mcp_registry`.  
3. **User:** Selects “n8n Automation Server.”  
4. **Client:** Prompts for credentials (API key, OAuth, etc.).  
5. **System:** Updates company’s `mcpConnections` array.  
6. **Cloud Function:** Fetches `/capabilities` and caches them.  
7. **Agents / Workflows:** Instantly gain access to the new MCP tools.

---

### Default MCP (Platform-Core)

Each new company includes a default internal MCP for baseline capabilities:

```json
{
  "name": "Platform Core MCP",
  "endpoint": "https://mcp.wtf.pub/core",
  "authType": "firebaseAuth",
  "description": "Provides access to core AI services and internal utilities."
}
```

This ensures all companies have a functional baseline before adding additional integrations.



### 🔹 Dynamic Custom Domains

The `CustomDomain` interface provides the basis for multi-tenant deployment.
Each domain record tracks verification and product association (Academy, Console, etc.),
enabling auto-routing via Firebase Hosting or reverse proxy logic.

### 🔹 Minimal System Metadata

The `timestamps` object standardizes creation and update tracking.
Lifecycle management (suspension, archival) uses `CompanyStatus`.

---

## 4. Related Integrations

| Layer                     | Purpose                       | Example                                       |
| ------------------------- | ----------------------------- | --------------------------------------------- |
| Firebase Hosting          | Domain verification & routing | `academy.soolan.com` → `/console/{companyId}` |
| Firestore Rules           | Ownership enforcement         | Match `request.auth.uid` to parent profile    |
| Vertex AI / Agent Builder | Agent runtime context         | Agents inherit `companyId` namespace          |
| MCP Server                | Dynamic tool discovery        | `/mcp/{namespace}/tools`                      |
| GenKit Functions          | Event-driven sync             | `onCompanyCreate`, `onDomainVerified`, etc.   |

---

## 5. System Interactions

| Trigger              | Action                   | Result                                   |
| -------------------- | ------------------------ | ---------------------------------------- |
| Company Created      | Cloud Function           | Initializes team, playbook, default MCPs |
| Domain Added         | DNS Verification Service | Updates status and verifiedAt            |
| Company Suspended    | Admin or Billing Trigger | Disables automation and agent execution  |
| MCP Connection Added | Firestore Trigger        | Registers capabilities dynamically       |

---

## 6. Future Extensions

* **Company Settings Collection:** add localized preferences, HR, Finance, etc.
* **MCP Adapter Health Checks:** periodically validate connected MCP endpoints.
* **Multi-brand support:** allow multiple brand identities under one company.

---

## 7. Summary

The `Company` feature defines the foundation of each autonomous business within the platform.
It provides structure for identity, integrations, and lifecycle management, while keeping the schema lean and Firestore-optimized.
With MCP-first design, companies can dynamically connect to external AI tools and automation servers, enabling scalable, customizable, and intelligent business operations.
