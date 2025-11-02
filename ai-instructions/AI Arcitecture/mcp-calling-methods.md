# MCP Calling Methods: Direct vs Agent

## 1. Overview

This document explains the two supported methods for invoking **Model Context Protocol (MCP)** endpoints in our platform:

1. **Direct Calls** — calling MCP tools without involving an agent.
2. **Agent-mediated Calls** — invoking MCP tools through an agent’s reasoning and context layer.

Both methods use the same MCP Gateway and authentication model but differ in purpose, context handling, and orchestration overhead.

---

## 2. What MCP Is

**MCP (Model Context Protocol)** is a standard way for models, agents, or systems to call structured tools or APIs.
It defines how tools describe their capabilities, inputs, outputs, and authentication.

An MCP endpoint is simply a **structured HTTP or WebSocket interface**, for example:

```http
POST /mcp/google.drive.listFiles
Content-Type: application/json
Authorization: Bearer <token>

{
  "caller": { "path": "profiles/abc/companies/xyz" },
  "payload": { "query": "invoices 2025" }
}
```

MCP endpoints are *self-describing*, meaning you can fetch their `/manifest.json` or `.well-known/mcp/manifest.json` to see all available tools and schemas.

---

## 3. Method 1 — Direct MCP Calls

### Definition

A **direct call** happens when a workflow, script, or UI action sends a request to an MCP endpoint **without going through an agent**.

### Example Flow

```
Workflow Node → MCP Gateway → MCP Server
```

### Use Cases

| Scenario                    | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| **Workflow automation**     | Workflow nodes call MCP tools directly when logic is deterministic.       |
| **System background tasks** | Scheduled or event-driven MCP calls (e.g. daily sync jobs).               |
| **UI integrations**         | User-triggered actions like “Upload to Notion” or “Sync with QuickBooks.” |
| **Developer diagnostics**   | Testing connectivity and tool schema validation.                          |

### Example

```json
{
  "id": "step1",
  "type": "mcp",
  "namespace": "google.drive",
  "method": "listFiles",
  "input": { "query": "invoices 2025" }
}
```

Execution:

```
Workflow Engine → /mcp/google.drive.listFiles → Google MCP Server → Result
```

### Benefits

* Lightweight and fast (no reasoning layer)
* Ideal for deterministic operations
* Easier to debug and monitor
* Lower cost (no model inference involved)

### Requirements

* The caller must supply its own `caller.path` and authentication context.
* Context resolution and IAM enforcement handled by MCP Gateway.

---

## 4. Method 2 — Agent-mediated MCP Calls

### Definition

An **agent-mediated call** happens when an AI agent decides *which* MCP tool to call and *when*, based on reasoning, memory, or collaboration context.

### Example Flow

```
User → Agent → MCP Gateway → MCP Server
```

### Use Cases

| Scenario                            | Description                                                               |
| ----------------------------------- | ------------------------------------------------------------------------- |
| **Delegated reasoning**             | The agent interprets vague goals and chooses appropriate MCP tools.       |
| **Multi-agent collaboration (A2A)** | Agents call MCP tools as part of delegated tasks.                         |
| **Dynamic workflows**               | Agents chain multiple MCP tools adaptively (plan → act → reflect).        |
| **Knowledge-based actions**         | Agent queries KB, interprets results, and triggers MCP calls accordingly. |

### Example

1. User: “Generate the Q3 report and send it to the board.”
2. CFO Agent:

  * Queries KB (`/mcp/kb.query`)
  * Calls `accounting.reconcile`
  * Uses `financialReporting.compile`
  * Sends report via A2A to CEO Agent

Each call passes through the same MCP Gateway, but the **agent orchestrates** them.

### Benefits

* Context-aware and adaptive
* Supports delegation and multi-agent workflows
* Handles uncertainty or missing data
* Can plan, decompose, and verify tasks autonomously

### Requirements

* Requires an active agent runtime
* Higher cost (model reasoning involved)
* Slightly slower due to context processing

---

## 5. Side-by-Side Comparison

| Aspect                  | **Direct Call**                              | **Agent-mediated Call**               |
| ----------------------- | -------------------------------------------- | ------------------------------------- |
| **Initiator**           | Workflow engine, system process, or UI       | AI agent                              |
| **Decision-making**     | Deterministic                                | Contextual and reasoning-driven       |
| **Performance**         | Fast, low overhead                           | Slower, reasoning step required       |
| **Cost**                | Lower (no model inference)                   | Higher (LLM usage)                    |
| **Use Case**            | Automation, data sync, deterministic actions | Dynamic goals, delegation, planning   |
| **Auth / Context**      | Provided manually in request                 | Inferred from agent’s runtime context |
| **A2A / collaboration** | Optional                                     | Native feature                        |

---

## 6. Authentication and Context

Both methods rely on the same `caller` object for context and access control:

```json
"caller": {
  "path": "profiles/{profileId}/companies/{companyId}",
  "auth": "firebaseAuth"
}
```

The MCP Gateway uses this to:

* Resolve company and user identity
* Apply access control and rate limits
* Fetch adapter and credential configurations
* Log execution context for observability

---

## 7. Hybrid Model: Agent + Direct Nodes

In many workflows, both methods coexist:

```
Human → Agent (reasoning + planning)
                ↓
           Workflow Engine
         ↙        ↓        ↘
     MCP Node   API Node   Flow Node
```

The agent generates or triggers a workflow that mixes direct MCP calls, GenKit flows, and API integrations — depending on the task type.

This hybrid design maximizes efficiency while keeping the intelligence layer where it adds the most value.

---

## 8. Summary

| Principle                      | Description                                                         |
| ------------------------------ | ------------------------------------------------------------------- |
| **MCP is protocol, not agent** | You can call MCP endpoints from anywhere — agents are optional.     |
| **Direct calls**               | Best for deterministic or recurring automation tasks.               |
| **Agent calls**                | Best for reasoning, delegation, or adaptive task execution.         |
| **Hybrid design**              | Combine both in workflows for performance and intelligence balance. |

---

### ✅ Key Takeaway

> MCP endpoints are universal — any workflow, system, or agent can call them.
> Agents *decide*, MCP *executes*.
> Your platform’s automation layer should support **both**:
>
> * **Direct MCP calls** for speed and predictability,
> * **Agent-mediated MCP calls** for intelligence and autonomy.
