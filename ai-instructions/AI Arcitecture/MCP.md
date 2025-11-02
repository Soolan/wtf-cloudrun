# MCP — Model Context Protocol (Platform-Specific Spec)

## 1. Purpose

MCP is the platform’s **tooling and runtime invocation protocol** that allows agents to call external tools, services, or models in a standardized, secure, and observable way.
It complements **A2A** (Agent-to-Agent) communication by providing structured access to APIs, LLMs, and automation runtimes.

---

## 2. Roles & Responsibilities

| Role                     | Description                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Agent (Caller)**       | Sends MCP requests when it needs to invoke tools, APIs, models, or workflows.                                   |
| **MCP Gateway (Server)** | Central routing and validation layer. Handles auth, policy, routing, telemetry, and normalization of responses. |
| **Tool Adapter**         | Translates standardized MCP requests into provider-specific calls (Vertex AI, NVIDIA, BPM engine, etc.).        |
| **Audit & Policy Layer** | Enforces rate limits, data access policies, and security compliance per company.                                |

---

## 3. Message Structure

### Request (Agent → MCP Gateway)

```json
{
  "id": "mcp-req:uuid",
  "caller": {
    "agentId": "profiles/{profileId}/companies/{companyId}/team/{memberId}",
    "sessionId": "session-uuid",
    "traceId": "trace-uuid"
  },
  "action": {
    "type": "tool.run" | "model.invoke"| "db.query" | "workflow.run",
    "name": "vertex.invokeModel",
    "version": "v1"
  },
  "payload": {
    "model": "gemini-1.5-pro",
    "input": "Summarize the following doc...",
    "params": { "temperature": 0.0, "maxOutputTokens": 1024 }
  },
  "security": {
    "auth": { "method": "mcp-api-key" },
    "companyContext": { "companyId": "companyId" }
  },
  "meta": {
    "priority": "normal",
    "allowSideEffects": true
  }
}
```

### Response (MCP Gateway → Agent)

```json
{
  "id": "mcp-resp:uuid",
  "inResponseTo": "mcp-req:uuid",
  "status": { "code": 200, "message": "OK" },
  "result": {
    "type": "model.textCompletion",
    "output": "Summary text...",
    "metadata": { "tokens": 124, "model": "gemini-1.5-pro" }
  },
  "audit": {
    "processedBy": "mcp-gateway-1",
    "durationMs": 312,
    "trace": "trace-uuid"
  }
}
```

---

## 4. MCP Gateway Responsibilities

| Function                 | Description                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Authentication**       | Verifies caller identity using declared security schemes (Firebase ID token, mTLS, etc.). |
| **Policy Enforcement**   | Validates agent → company mapping and ensures allowed tools per agent.                    |
| **Credential Injection** | Obtains or generates short-lived credentials for Vertex, NVIDIA, or other runtimes.       |
| **Routing**              | Determines which adapter to use based on `action.name`.                                   |
| **Observability**        | Emits logs and traces to Cloud Trace, Cloud Monitoring, and logs metrics.                 |
| **Caching**              | Stores reusable non-sensitive results such as embeddings or metadata.                     |
| **Rate-Limiting**        | Enforces per-company and per-agent quotas.                                                |

---

## 5. Tool Adapters

Each adapter defines a consistent interface:

```ts
export interface MCPAdapter {
  execute(payload: any, config: any): Promise<MCPResult>;
}
```

### Vertex AI Adapter

* Maps `action.name = "vertex.invokeModel"` to `projects.locations.models.predict`.
* Handles session state, memory, and long-running jobs.
* Supports managed authentication via service accounts or workload identity.

### NVIDIA Adapter

* Maps to NVIDIA Triton or custom inference API.
* Manages fine-tuning jobs, inference, and model versioning.
* Handles cluster authentication and GPU resource allocation.

### BPM Runner Adapter

* Executes BPMN workflows stored in Firestore.
* Returns task state, execution logs, and generated artifacts.

### Knowledge / Embedding Adapter

* Embedding generation and vector queries.
* Returns similarity scores, document IDs, and source metadata.

---

## 6. Security Model

* MCP enforces **multi-layered security** combining:

  1. Agent Card `securitySchemes`
  2. Firestore `member` doc permissions (`allowedTools`, `securityType`)
  3. Company-level policies (`profiles/{profileId}/companies/{companyId}/policies`)

* Private agents must authenticate via **Firebase ID token** or **mTLS**.

* All runtime credentials (Vertex, NVIDIA) are **ephemeral**, generated per call.

* Data and access logs stored per-company for compliance and traceability.

---

## 7. Auditing & Compliance

Each MCP transaction produces:

* **Trace logs** in Cloud Trace
* **Structured logs** in Cloud Logging
* **Metrics** in Cloud Monitoring (per adapter, per model)
* **Audit record** persisted in Firestore (optional) under
  `profiles/{profileId}/companies/{companyId}/audits/{traceId}`

Retention and redaction rules defined by company policy.

---

## 8. Common MCP Flows

### A. Create Embedding

1. Agent → MCP (action: `embedding.create`)
2. MCP → Embedding adapter → Vector DB
3. Response: vector ID + similarity scores.

### B. Invoke Vertex Model

1. Agent → MCP (action: `vertex.invokeModel`)
2. MCP → Vertex adapter → Vertex AI predict API
3. Response: structured model output.

### C. Run Workflow (BPA)

1. Agent → MCP (action: `workflow.run`)
2. MCP → BPM Runner Adapter
3. Executes process and returns status/logs.

---

## 9. Integration with A2A and ADK

* **A2A**: Handles inter-agent collaboration (delegation, messaging).
* **MCP**: Handles tool and runtime execution.

Typical pattern:

1. Agent A → A2A → Agent B (requesting specialized data).
2. Agent B → MCP → Tool adapter (fetches or generates result).
3. Agent B → A2A → returns result to Agent A.

Both A2A and MCP are integral to **ADK** (Agent Development Kit), abstracted through unified APIs.

---

## 10. Deployment & Scaling

| Layer                   | Deployment                | Description                                         |
| ----------------------- | ------------------------- | --------------------------------------------------- |
| **MCP Gateway**         | Cloud Run                 | Autoscaled HTTP API behind Cloud Load Balancer      |
| **Tool Adapters**       | Cloud Run (per adapter)   | Can scale independently; Vertex/NVIDIA regionalized |
| **Observability Stack** | Cloud Logging + Trace     | Request-level visibility and latency tracking       |
| **Firestore**           | Shared metadata store     | Agent, company, and tool configs                    |
| **Security**            | Cloud IAM + Firebase Auth | Fine-grained agent-to-resource authorization        |

---

## 11. Example Endpoint Summary

| Endpoint                   | Method | Description                                |
| -------------------------- | ------ | ------------------------------------------ |
| `/mcp/vertex.invokeModel`  | `POST` | Invoke Gemini or other Vertex model        |
| `/mcp/nvidia.runInference` | `POST` | Run inference on NVIDIA-hosted model       |
| `/mcp/workflow.run`        | `POST` | Execute BPMN or BPA workflow               |
| `/mcp/embedding.create`    | `POST` | Generate embeddings and store in vector DB |

---

## 12. Example Config References

**Default adapter configuration files:**

```
/config/mcp/adapters/vertex.yaml
/config/mcp/adapters/nvidia.yaml
```

**Company overrides:**

```
profiles/{profileId}/companies/{companyId}/settings/adapters/{adapterId}
```

**Agent preferences (in Firestore):**

```json
{
  "agentConfig": {
    "runtime": "vertex-agent",
    "modelAffinity": ["gemini-1.5-pro"],
    "nvidia": { "useFor": ["fine-tuning"] }
  }
}
```

---

## 13. Summary

* MCP standardizes all runtime/tool invocations in the platform.
* Adapters abstract differences between Vertex, NVIDIA, and internal services.
* Security and observability are first-class features.
* A2A and MCP work together to enable fully autonomous multi-agent collaboration.
* The protocol design is flexible and ready for additional adapters (OpenAI, Hugging Face, Anthropic, etc.).
