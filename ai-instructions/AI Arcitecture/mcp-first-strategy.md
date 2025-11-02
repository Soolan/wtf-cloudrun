# MCP-first Integration Strategy

## 1. Overview

This document defines the **MCP-first Integration Strategy** used in our workflow automation feature.
It explains why our platform prioritizes **Model Context Protocol (MCP)** endpoints over traditional APIs and how this strategy enhances scalability, maintainability, and interoperability across diverse automation scenarios.

MCP enables direct, schema-based, authenticated interactions between agents and external systems, replacing legacy REST integrations with a unified model execution layer.

---

## 2. Why MCP-first

| Aspect            | Traditional API Integration                             | MCP-first Integration                                   |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| **Auth**          | Manual OAuth, token rotation, per-vendor implementation | Managed within MCP server; standardized authentication  |
| **Schema**        | Custom per-API                                          | JSON Schema-defined, machine-readable                   |
| **Discovery**     | Requires human or SDK integration                       | MCP servers are self-describing (`/manifest.json`)      |
| **Scalability**   | You host integration logic                              | Vendors host execution endpoints                        |
| **Maintenance**   | Constant SDK version updates                            | One protocol, many endpoints                            |
| **Composability** | Ad hoc REST chaining                                    | Unified function call model across agents and workflows |

By adopting an **MCP-first** strategy, our workflow engine becomes:

* **Vendor-agnostic** – integrates any system exposing MCP without code changes
* **Self-adapting** – automatically discovers available MCP tools
* **Lightweight** – moves heavy execution to vendor-maintained MCP servers
* **Future-proof** – instantly compatible with new providers entering the MCP ecosystem

---

## 3. How the Strategy Works

1. **Discover**: Determine whether a vendor or service exposes MCP endpoints.
2. **Register**: Store known MCP namespaces in our capability registry.
3. **Resolve**: When executing a workflow node, check if the service has an MCP handler.
4. **Execute**:

  * If MCP exists → invoke via `/mcp/{namespace.method}`
  * If not → fall back to REST API or local GenKit flow.
5. **Extend**: Periodically sync new MCP registries to keep our capability registry up to date.

---

## 4. Detecting MCP Availability Automatically

The system automatically identifies MCP endpoints using several detection methods:

| Detection Method           | Description                                             | Example                                                         |
| -------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| **Known MCP Registry**     | Query global or curated lists of MCP providers          | OpenAI, Anthropic, GitHub, Notion, Google, NVIDIA, Hugging Face |
| **Well-known manifest**    | Probe `/.well-known/mcp/manifest.json` on vendor domain | `https://api.notion.com/.well-known/mcp/manifest.json`          |
| **User-provided**          | User connects their MCP endpoint via dashboard          | `https://mycompany.com/mcp`                                     |
| **Discovery by API proxy** | Attempt to resolve MCP handshake on first request       | `OPTIONS /mcp` or `HEAD /manifest.json`                         |
| **Caching**                | Store results in Firestore `/mcpServers/{vendor}`       | Used to quickly identify known namespaces                       |

### 🌍 Known MCP Registries (as of 2025)

* **OpenAI MCP Registry** – official index of MCP-compliant tools and servers
* **Google Vertex AI MCP endpoints** – integrated into Agent Builder
* **Anthropic Claude MCP** – internal tool integration under evaluation
* **NVIDIA NIM / AI Foundry MCP adapters** – for model hosting and fine-tuning
* **Hugging Face MCP Gateway** – community-contributed MCP endpoints
* **Notion MCP Beta** – automation endpoints for workspace actions
* **GitHub MCP (Copilot integrations)** – repository, issue, and workflow automation
* **Zapier / Make (Beta MCP)** – early adopters bridging legacy APIs into MCP interface

---

## 5. Capability Registry for MCP Endpoints

We maintain a centralized **capability registry** in Firestore that tracks which namespaces have MCP endpoints.

**Path:**

```
capabilities/
└── mcpServers/
    ├── google
    │   ├── endpoint: "https://mcp.googleapis.com/v1"
    │   ├── namespaces: ["drive", "docs", "calendar"]
    │   └── lastSync: <timestamp>
    ├── notion
    ├── github
    └── quickbooks
```

**Schema Example**

```json
{
  "id": "google",
  "endpoint": "https://mcp.googleapis.com/v1",
  "namespaces": ["drive", "docs", "calendar"],
  "auth": "oauth",
  "public": true,
  "verified": true,
  "lastSync": "2025-10-26T04:00:00Z"
}
```

Each record contains:

* **endpoint:** Base URL for the MCP server
* **namespaces:** Available modules or tool groups
* **auth:** Authentication type (OAuth, API key, service token)
* **verified:** Indicates vendor confirmation or manual testing
* **lastSync:** Timestamp for periodic refresh

This registry powers runtime routing in the workflow automation engine.

---

## 6. Refactor Workflow Node Schema

To support multiple integration types, each workflow node includes a `type` property.

### Node Schema

```json
{
  "id": "uploadInvoice",
  "type": "mcp | api | flow | a2a",
  "namespace": "quickbooks",
  "method": "createInvoice",
  "url": "https://api.quickbooks.com/v1/invoices",
  "handler": "genkit://finance/accounting/reconcile",
  "input": {},
  "output": {}
}
```

### Type Descriptions

| Type     | Execution Target       | Example                                 |
| -------- | ---------------------- | --------------------------------------- |
| **mcp**  | External MCP endpoint  | `/mcp/google.drive.listFiles`           |
| **api**  | Traditional REST API   | `https://api.stripe.com/v1/charges`     |
| **flow** | Internal GenKit flow   | `genkit://finance/accounting/reconcile` |
| **a2a**  | Agent-to-agent message | `/a2a/message.send`                     |

---

## 7. Resolver Layer

The **resolver** determines which execution path to use for each node.

```ts
switch (node.type) {
  case 'mcp':
    return callMCP(`/mcp/${node.namespace}.${node.method}`, node.input, context);
  case 'api':
    return callHTTP(node.url, node.method, node.input);
  case 'flow':
    return invokeGenkitFlow(node.handler, node.input);
  case 'a2a':
    return sendA2AMessage(node.input);
}
```

This modular design ensures:

* Extensibility for new protocols
* Uniform input/output handling
* Easy debugging and monitoring

---

## 8. Fallback Rules

When both API and MCP are available:

1. **Prefer MCP** — standardized schema, better auth, vendor-managed execution.
2. **Fallback to API** — if MCP unavailable, misconfigured, or rate-limited.
3. **Log fallback events** — record transitions in Firestore or Cloud Logging.

```ts
if (hasMCP(vendor)) {
  try {
    return callMCP(...);
  } catch (err) {
    log("MCP failed, falling back to API");
    return callHTTP(node.url, node.method, node.input);
  }
} else {
  return callHTTP(node.url, node.method, node.input);
}
```

Fallbacks ensure uninterrupted workflow execution, even if a vendor’s MCP service is offline.

---

## 9. Discovery Routines for Known MCP Vendors

Automated discovery functions periodically refresh known MCP metadata:

```ts
async function refreshMCPRegistry() {
  const knownVendors = ['google', 'notion', 'github', 'openai', 'nvidia', 'huggingface'];
  for (const vendor of knownVendors) {
    const manifestUrl = `https://api.${vendor}.com/.well-known/mcp/manifest.json`;
    const manifest = await fetch(manifestUrl).then(r => r.json()).catch(() => null);
    if (manifest) {
      await firestore.doc(`capabilities/mcpServers/${vendor}`).set({
        endpoint: manifest.endpoint,
        namespaces: manifest.namespaces,
        verified: true,
        lastSync: new Date().toISOString()
      });
    }
  }
}
```

This routine runs daily via Cloud Scheduler to ensure up-to-date MCP availability.

---

## 10. Summary

| Layer                    | Function                                            |
| ------------------------ | --------------------------------------------------- |
| **MCP-first Policy**     | Always prefer vendor MCP endpoints when available   |
| **Capability Registry**  | Tracks all known MCP namespaces and endpoints       |
| **Workflow Node Schema** | Defines flexible node execution types               |
| **Resolver Layer**       | Dynamically routes each node to the correct handler |
| **Fallback Logic**       | Guarantees reliability when MCP endpoints fail      |
| **Discovery Routines**   | Continuously sync MCP ecosystem metadata            |

---

## 11. Benefits Recap

| Dimension            | Benefit                                                            |
| -------------------- | ------------------------------------------------------------------ |
| **Integration cost** | No need to maintain 100s of custom SDKs                            |
| **Speed**            | MCP discovery and execution are automated                          |
| **Reliability**      | Fallback ensures resilience                                        |
| **Extensibility**    | Future vendors can be plugged in instantly                         |
| **Standardization**  | Consistent schema, input/output, and security across all workflows |

---

**In summary**, our platform uses an **MCP-first integration strategy** to unify automation, reduce custom logic, and connect seamlessly to the emerging global MCP ecosystem — all while maintaining backward compatibility with traditional APIs.
