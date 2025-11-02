# Vertex AI Agent Builder + NVIDIA

## 1. Goals

* Provide a production-ready runtime and lifecycle for agents (Vertex Agent Engine) while enabling high-performance custom models and fine-tuning on NVIDIA GPU instances.
* Maintain A2A and MCP standards for agent communication and tool invocation.
* Ensure strict multi-tenant isolation, observability, and auditability.

---

## 2. Core Components

### 2.1 Control Plane (Managed)

* **Vertex AI Agent Builder / Agent Engine**

  * Agent lifecycle: deploy, version, session management, model selection (Gemini primary).
  * Managed security (IAM), evaluation service, integrated logging.
  * Provides server-side session & memory management.
* **Cloud IAM / Identity**

  * Service accounts for platform services; OAuth & Firebase ID tokens for agents and users.

### 2.2 Data Plane (Runtime)

* **MCP Gateway** — standard entrypoint for all tool and model invocations.
* **Tool Adapters**

  * Vertex adapter, NVIDIA adapter, BPM runner, Vector DB, Storage connectors.
* **NVIDIA GPU Cluster**

  * For hosting fine-tuned models, custom LLMs, embeddings training, heavy inference.
* **Vertex Execution**

  * Gemini & Garden models (Anthropic, Meta, HF, Mistral) via Vertex or vendor adapters.
* **Firestore**

  * Stores profile, company, team, tickets, playbook, BPM and minimal agent metadata.
* **Object Storage**

  * Cloud Storage for large assets (files for vectorization, training artifacts).
* **Vector DB**

  * For knowledge retrieval (Weaviate / Pinecone / Vertex Matching Engine).
* **BPA Engine**

  * n8n-like worker cluster for automations; triggered by MCP.

---

## 3. Adapter Mappings Explained

### 3.1 Concept

An **adapter mapping** is a configuration object (YAML or JSON) that tells the **MCP Gateway** how to connect to a runtime provider such as Vertex AI or NVIDIA.
It acts as a routing table and a configuration layer.

Each mapping defines:

* **Provider type** (Vertex, NVIDIA, etc.)
* **Connection info** (endpoint, region, credentials)
* **Defaults** (model, GPU type)
* **Behavioral options** (session handling, quotas, tracing)

---

### 3.2 Where They Live

| Level                       | Location                                                                   | Description                                                 |
| --------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **System-level defaults**   | `/config/mcp/adapters/*.yaml`                                              | Global adapter mappings shared across all companies         |
| **Company-level overrides** | `profiles/{profileId}/companies/{companyId}/settings/adapters/{adapterId}` | Company-specific overrides (e.g., dedicated NVIDIA cluster) |
| **Agent-level preferences** | In Firestore `member.agentConfig`                                          | Fine-tunes runtime and model choices for each agent         |

#### Example File Hierarchy

```
mcp-gateway/
├─ config/
│  ├─ adapters/
│  │  ├─ vertex.yaml
│  │  └─ nvidia.yaml
│  └─ defaults.yaml
└─ src/
   ├─ adapters/
   │  ├─ vertex.adapter.ts
   │  └─ nvidia.adapter.ts
   └─ index.ts
```

When an MCP request arrives:

1. Gateway reads the agent’s company and `agentConfig`.
2. Loads the system-level adapter mapping.
3. Merges company and agent-level overrides.
4. Passes the merged config to the adapter implementation.

---

### 3.3 Vertex Adapter Mapping (Example)

**File:** `/config/adapters/vertex.yaml`

```yaml
adapter: vertex
region: asia-southeast1
defaultModel: gemini-1.5-pro
credentials:
  source: "service-account"
sessionHandling:
  enableManagedSession: true
  sessionTTL: 3600
observability:
  tracing: true
  metrics: true
  logs: true
quota:
  maxRequestsPerMinute: 120
```

**Implementation:** `src/adapters/vertex.adapter.ts`

```ts
export async function invokeModel(payload, config) {
  const region = config.region;
  const model = payload.model || config.defaultModel;
  const credentials = await resolveCredentials(config.credentials);

  const vertexClient = new VertexAIClient({ region, credentials });
  const result = await vertexClient.predict({
    model,
    input: payload.input,
    parameters: payload.params
  });

  return result;
}
```

---

### 3.4 NVIDIA Adapter Mapping (Example)

**File:** `/config/adapters/nvidia.yaml`

```yaml
adapter: nvidia
clusterEndpoint: "https://nvidia.apps.internal"
models:
  - name: custom-ops-1
    version: v1
    gpuType: a100
    useCase: ["fine-tuning", "batch"]
credentials:
  source: "service-account"
observability:
  tracing: true
  logs: true
quota:
  maxJobs: 5
```

**Implementation:** `src/adapters/nvidia.adapter.ts`

```ts
export async function runInference(payload, config) {
  const model = payload.model || config.models[0].name;
  const endpoint = `${config.clusterEndpoint}/models/${model}/infer`;
  const token = await getServiceToken(config.credentials.source);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload.input)
  });

  return await response.json();
}
```

---

### 3.5 How the Gateway Uses Them

1. Agent sends MCP request:

   ```json
   {
     "action": { "name": "vertex.invokeModel" },
     "payload": { "model": "gemini-1.5-pro", "input": "Summarize this..." }
   }
   ```

2. MCP Gateway reads `action.name` → determines adapter type (`vertex`).

3. Gateway loads `/config/mcp/adapters/vertex.yaml`.

4. Merges company/agent-level overrides from Firestore.

5. Calls the correct adapter with merged configuration.

6. Adapter executes the request (Vertex or NVIDIA API call).

---

### 3.6 Adapter Overrides Examples

**Company-level override (Firestore):**

```
profiles/{profileId}/companies/{companyId}/settings/adapters/nvidia
```

```json
{
  "clusterEndpoint": "https://custom-nvidia.companyA.internal",
  "models": [{ "name": "companyA-llm", "gpuType": "h100" }]
}
```

**Agent-level preference (Firestore `member` doc):**

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

## 4. Data & Request Flows

### A. Agent Deployment & Card Generation

1. New team member created under `profiles/{profileId}/companies/{companyId}/team/{memberId}`.
2. Minimal metadata (runtime, modelAffinity, securityType) stored.
3. `.well-known/agent-cards/{memberId}.json` served dynamically.
4. Vertex Agent Builder deploys runtime using the metadata.

### B. Runtime Invocation

1. Agent receives session request.
2. Agent issues A2A or MCP call to MCP Gateway.
3. Gateway loads adapter mapping → routes to Vertex or NVIDIA adapter.
4. Adapter executes runtime call → returns result.
5. Agent continues execution (updates Firestore, BPM, BPA).

### C. Fine-Tuning / Hosting (NVIDIA)

1. Fine-tuning job triggered.
2. NVIDIA adapter runs job on GPU cluster.
3. Trained model artifacts stored in Cloud Storage.
4. New version registered with MCP Gateway.

---

## 5. Observability & Security

* All adapter calls traced and logged (Cloud Trace + Logging).
* Quotas and rate limits enforced by MCP Gateway.
* Company-specific credentials used for NVIDIA clusters.
* Managed Vertex IAM for agent-level security.

---

## 6. Summary

| Layer                  | Responsibility                                      |
| ---------------------- | --------------------------------------------------- |
| **Vertex AI Adapter**  | Managed sessions, Gemini/Garden model calls         |
| **NVIDIA Adapter**     | Fine-tuning, GPU inference, custom model hosting    |
| **MCP Gateway**        | Auth, routing, policy enforcement, observability    |
| **Firestore Metadata** | Stores per-agent runtime and model config           |
| **Agent Cards**        | Public interface for discovery and interoperability |

