# Kanban & Ticket Tech Spec (A2A + MCP integrated)

Below is the complete **technical specification** for the Kanban / Ticket system, aligned with the A2A protocol (protocol data objects, messaging, task lifecycle) and our hybrid storage decision (`a2aTaskRef` in ticket + full canonical A2A task in `agent_tasks/{taskId}`). It includes schema examples, canonical A2A Task & Message examples, Cloud Function pseudocode for glue logic, cleanup/retention, security, and updated user journeys.

---

## High-level decisions (recap)

* **Tickets** are the UX object stored at:

  ```
  profiles/{profileId}/companies/{companyId}/tickets/{ticketId}
  ```
* **A2A Task** full canonical JSON (per A2A §6) is stored in a root collection:

  ```
  agent_tasks/{taskId}
  ```
* Each ticket contains a lightweight `a2aTaskRef` sub-object for fast lookup and retention operations.
* **Discussions / messages** are contextual subcollections:

  * `profiles/{p}/companies/{c}/tickets/{t}/discussions/{messageId}` (task-bound)
  * `profiles/{p}/companies/{c}/team/{memberId}/discussions/{messageId}` (agent/human chat)
  * Each discussion doc stores the full A2A Message JSON (parts, attachments, metadata).
* Cloud Functions and MCP Gateway handle routing, credential injection, validation, and mirroring between Firestore and Storage.

---

## Firestore schema (examples)

### Ticket document (profiles/.../tickets/{ticketId})

```ts
{
  title: string;
  serial: number;
  deadline: Timestamp;    // firebase timestamp
  description?: string;
  product?: Product;
  stage: TicketStage;
  timestamps: Timestamps; // numbers
  release_entry: ReleaseEntry;
  subtasks?: string[];       // ticket IDs of children
  parentId?: string;  // The parent ticket id, which this ticket is one of its subtasks
  process?: string; // bpmn file
  creator: Entity;
  assignedTo: Entity;
  attachments?: Resource[];
  priority?: TicketPriority;
  policy?: {
    clarificationAuthority?: MemberRank;
    requireApprovalFrom?: string; // memberId
    acceptanceCriteria?: string;
  };
  a2aTaskRef?: {
    id: string;               // agent_tasks/{taskId}
    status: string;           // quick status copy (matches agent_tasks/{taskId}.status)
    createdAt: number;
    lastUpdated: number;
    artifactRefs?: string[];  // storage URIs or paths (optional quick list)
  };
}
```

### Agent Task document (agent_tasks/{taskId}) — **canonical A2A Task JSON**

* This collection stores the full A2A Task object exactly (or conformant) to A2A §6. It is the authoritative task contract used by agents and A2A flows.

Example (simplified, but A2A-shaped — you store the full spec-compliant object):

```json
{
  "taskId": "task-uuid-123",
  "protocolVersion": "0.2.9",
  "type": "Task",
  "createdBy": "profiles/ownerProfileId",
  "context": {
    "company": "profiles/ownerProfileId/companies/companyId",
    "ticketRef": "profiles/ownerProfileId/companies/companyId/tickets/ticketId"
  },
  "status": {
    "state": "created",
    "updatedAt": 1700000000000
  },
  "parts": [                        // A2A Part array (TextPart, DataPart, FilePart references)
    {
      "id": "part-1",
      "type": "text/plain",
      "data": "Please prepare Q3 financial overview including revenue, expenses, and variance analysis."
    },
    {
      "id": "part-2",
      "type": "application/json",
      "data": { "expectedOutputs": ["P&L", "Balance sheet", "Summary slide"] }
    }
  ],
  "assignees": [
    { "memberId": "teamMemberCFO", "role": "assignee", "type": "agent" }
  ],
  "policy": {
    "clarificationAuthority": "CSuite"
  },
  "capabilitiesHint": {
    "preferredMCP": "finance.accounting",
    "requiredTools": ["financialReporting.compile","kb.query"]
  },
  "artifacts": [
    // use A2A Artifact types: FileWithUri references
    { "id": "artifact-1", "uri": "gs://company-artifacts/task-uuid-123/report.pdf", "mediaType": "application/pdf" }
  ],
  "lifecycleHistory": [
    { "state": "created", "by": "profile_abc", "when": 1700000000000 }
  ],
  "metadata": { "version":"1.0.0", "updatedBy":"system", "updatedAt":1700000000000 }
}
```

> Store the full A2A-compatible task object here. Do not duplicate or transform in ways that break the A2A schema.

### Discussion / Message document (profiles/.../tickets/{t}/discussions/{messageId})

* Stores full A2A `Message` object (sections 7–8 of A2A spec). Example simplified:

```json
{
  "messageId": "msg-uuid",
  "protocolVersion": "0.2.9",
  "sender": "profiles/.../team/teamMemberId",
  "recipient": "profiles/.../team/otherMemberId",
  "context": "profiles/.../tickets/ticketId",
  "parts": [
    { "id":"p1", "type":"text/plain", "data":"Can you confirm whether Q3 includes region X?" }
  ],
  "timestamp": 1700001000000
}
```

* For large threads you can store subcollections (`messages`) but this pattern is the recommended single path.

---

## Retention & artifact maintenance

* Keep artifacts referenced from `agent_tasks/{taskId}/artifacts/*` stored in Cloud Storage with consistent prefix (e.g., `companyId/agent_tasks/taskId/*`).
* Provide a **maintenance Cloud Function**:

  * Query tickets where `a2aTaskRef.lastUpdated < now - retentionWindow`.
  * For each, delete `agent_tasks/{id}` and `gs://.../agent_tasks/{id}/*`.
  * Remove `a2aTaskRef` or replace with a compact archive record (if you must keep minimal index).
* Because `a2aTaskRef` exists on the ticket, the UI operator can trigger retention/cleanup for the company from one place.

---

## A2A Message & Part examples (clarification exchange)

### Clarification request by agent (Message)

```json
{
  "messageId": "msg-clarify-001",
  "protocolVersion": "0.2.9",
  "sender": "team/agent/CFO-agent",
  "recipient": "profiles/ownerProfileId", // or specific human member
  "context": "profiles/p/companies/c/tickets/t",
  "parts": [
    {
      "id": "part-1",
      "type": "text/plain",
      "data": "Do you want the report to include provisional tax adjustments?"
    },
    {
      "id": "part-2",
      "type": "application/json",
      "data": { "options": ["yes_include", "no_exclude", "include_if_material"] }
    }
  ],
  "timestamp": 1700002000000
}
```

### Human reply (Message)

```json
{
  "messageId": "msg-clarify-002",
  "protocolVersion": "0.2.9",
  "sender": "profiles/human/john",
  "recipient": "team/agent/CFO-agent",
  "context": "profiles/p/companies/c/tickets/t",
  "parts": [
    { "id":"r1", "type":"text/plain", "data":"Yes — include provisional tax adjustments if > 1% of revenue." }
  ],
  "timestamp": 1700002005000
}
```

---

## Cloud Functions & glue pseudocode (key triggers)

### onTicketCreated (profiles/.../tickets/{ticketId} onCreate)

```ts
exports.onTicketCreated = functions.firestore
  .document('profiles/{p}/companies/{c}/tickets/{t}')
  .onCreate(async (snap, ctx) => {
    const ticket = snap.data();

    // Build A2A Task minimal metadata or full task if initial assignment to agents
    const task = buildA2ATaskFromTicket(ticket); // returns canonical A2A Task JSON
    const taskId = `task-${uuid()}`;

    // Persist full A2A task to agent_tasks (canonical)
    await db.doc(`agent_tasks/${taskId}`).set(task);

    // Update ticket with lightweight ref
    await snap.ref.update({
      a2aTaskRef: {
        id: taskId,
        status: task.status?.state || 'created',
        createdAt: Date.now(),
        lastUpdated: Date.now()
      },
      'lifecycleHistory': admin.firestore.FieldValue.arrayUnion({
        state: 'created', by: ticket.creatorProfileId, when: Date.now()
      })
    });

    // If assignee includes agents, deliver A2A task event to assigned agent runtime (via MCP Gateway)
    for (const assignee of ticket.assignees || []) {
      if (assignee.type === 'agent') {
        await mcpGateway.deliverTaskToAgent(taskId, assignee.memberId);
      } else {
        // notify human via notifications system
      }
    }
  });
```

### onMessageCreated (tickets/{t}/discussions/{msgId} onCreate)

```ts
exports.onMessageCreated = functions.firestore
  .document('profiles/{p}/companies/{c}/tickets/{t}/discussions/{msgId}')
  .onCreate(async (snap, ctx) => {
    const message = snap.data();

    // Validate A2A message shape
    validateA2AMessage(message); // schema validate, reject if invalid

    // Route message: if recipient is agent, send via MCP/A2A gateway
    if (isAgentRecipient(message.recipient)) {
      await a2aGateway.sendMessageToAgent(message.recipient, message);
    } else {
      // notify human; push UI event
    }

    // Optionally append small audit entry to ticket
    await db.doc(`profiles/${ctx.params.p}/companies/${ctx.params.c}/tickets/${ctx.params.t}`)
      .update({ lastMessageAt: Date.now() });
  });
```

### onAgentTaskUpdated (agent_tasks/{taskId} onUpdate)

```ts
exports.onAgentTaskUpdated = functions.firestore
  .document('agent_tasks/{taskId}')
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after = change.after.data();

    // Keep ticket a2aTaskRef in sync (if exists)
    const ticketRef = after.context?.ticketRef;
    if (ticketRef) {
      const lastStatus = after.status?.state || null;
      await db.doc(ticketRef).update({
        'a2aTaskRef.status': lastStatus,
        'a2aTaskRef.lastUpdated': Date.now(),
        lifecycleHistory: admin.firestore.FieldValue.arrayUnion({
          state: lastStatus, by: 'agent_runtime', when: Date.now()
        })
      });
    }

    // If status == 'delivered', optionally notify reviewer or queue auto-evaluator
    if (after.status?.state === 'delivered') {
      await notifyReviewersForTicket(ticketRef);
    }
  });
```

### cleanupOldArtifacts (maintenance)

```ts
exports.cleanupOldArtifacts = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const cutoff = Date.now() - RETENTION_MS;
  const tickets = await db.collectionGroup('tickets')
    .where('a2aTaskRef.lastUpdated','<', cutoff)
    .get();

  for (const t of tickets.docs) {
    const ref = t.data().a2aTaskRef;
    if (!ref) continue;
    const taskId = ref.id;

    // delete artifacts from storage
    await deleteStoragePrefix(`agent_tasks/${taskId}/artifacts/`);
    // delete agent_tasks doc
    await db.doc(`agent_tasks/${taskId}`).delete().catch(() => {});
    // clear ticket's a2aTaskRef or mark archived
    await t.ref.update({ 'a2aTaskRef': admin.firestore.FieldValue.delete() });
  }
});
```

---

## User journeys (revised and A2A-integrated)

### 1) Create & assign ticket

1. User creates ticket in Kanban UI (ticket doc created).
2. `onTicketCreated` builds canonical A2A Task in `agent_tasks/{taskId}`; ticket receives `a2aTaskRef`.
3. If assignee includes agent(s), function calls MCP Gateway to deliver `tasks/create` (A2A RPC) to agent runtime.
4. Agent responds with `TaskStatusUpdate` to `agent_tasks/{taskId}` (e.g., `claimed` or `clarifying`). `onAgentTaskUpdated` syncs `a2aTaskRef.status`.

### 2) Clarify task

1. Agent detects ambiguity, writes a clarification `Message` under `tickets/{t}/discussions/{msg}` (A2A Message).
2. `onMessageCreated` routes message to recipient (human UI or agent runtime).
3. Human replies in UI; reply saved as a `Message` and routed back to agent.
4. Agent resumes work or escalates per `policy.clarificationAuthority`.

### 3) Create & assign subtasks (C-Suite clarifies once)

1. C-Suite clarifies at ticket creation or in a single clarification round.
2. Agent or platform creates subtasks by issuing multiple `agent_tasks/*` docs and creating `tickets/{subtaskId}` referenced by parent ticket `subtasks[]`.
3. Subtasks follow standard lifecycle lifecycles; parent ticket waits according to `policy` (e.g., all subtasks accepted).

### 4) Agents use MCP & skills to deliver

1. Agent uses `agent_card` capabilities and `capabilitiesHint` in Task to choose MCP namespaces/tools.
2. Agent calls MCP Gateway `POST /mcp/{namespace}.{method}`; gateway resolves to company `mcpConnections[*]`, injects credentials, proxies call, and returns results.
3. Agent composes artifacts, uploads to storage, adds `artifact` entries in `agent_tasks/{taskId}.artifacts` and emits `TaskArtifactUpdateEvent` (A2A event).
4. `onAgentTaskUpdated` updates ticket `a2aTaskRef` and lifecycle.

### 5) Evaluate & mark accepted/rejected

1. Agent sets status = `delivered` and attaches artifacts.
2. Platform notifies reviewers (human or review agent).
3. Reviewer evaluates and writes verdict (ticket update): `evaluation: { verdict:'accepted'|'rejected', notes, evaluatedBy }`.
4. On `accepted`:

  * `lifecycleHistory` updated;
  * Ticket archived or moved to done column.
    On `rejected`:
  * Task reverts to `in_progress` or `clarifying` with `rework` instructions; agent receives message.

---

## Security & RBAC

* **Firestore rules**: require `request.auth.token.companyPath` matches `companyId` for read/write.
* **Custom claims**: continue to set `{companyPath, role}` on invited humans.
* **MCP Gateway**: server-side credential injection — agent runtimes never hold plain company secrets.
* **Agent Card**: public `.well-known` card must not include secrets; if extended private card is used, serve via authenticated endpoint only.
* **Policy enforcement**: Cloud Functions and MCP Gateway enforce `policy.clarificationAuthority` and `policy.requireApprovalFrom`.

---

## Observability & metrics

* Emit metrics for: tasks created, tasks completed, average time-to-accept, clarifications per task, rework ratio, MCP call success/latency, agent runtime failures.
* Keep immutable `lifecycleHistory` for auditability.
* Store logs for MCP calls (namespace, method, duration, status) for billing and debugging.

---

## Developer checklist (actions to implement)

1. Create `agent_tasks` collection and document convention; adopt A2A JSON Schema validation on writes.
2. Add `a2aTaskRef` to ticket creation UI & server flows.
3. Implement `onTicketCreated`, `onMessageCreated`, `onAgentTaskUpdated`, and `cleanupOldArtifacts` Cloud Functions (pseudocode above).
4. Implement MCP Gateway adapter to resolve `company.mcpConnections`, inject credentials, and proxy calls.
5. Implement A2A message router (send messages to agent runtime or human notifications).
6. Implement retention/cleanup UI for company admins.
7. Add monitoring dashboards and alerts for agent runtime failures and MCP errors.
8. Write Firestore security rules to enforce company-scoped access and policy checks.

---

## Appendix — enums and sample types

### TicketStatus (sample)

```ts
type TicketStatus =
  | 'created'
  | 'claimed'
  | 'clarifying'
  | 'in_progress'
  | 'delivered'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'archived';
```

### a2aTaskRef (sample TS)

```ts
interface A2ATaskRef {
  id: string;
  status: string;
  createdAt: number;
  lastUpdated: number;
  artifactRefs?: string[];
}
```

---

## Closing notes

* The hybrid model (`a2aTaskRef` in ticket + full `agent_tasks/{taskId}`) gives you **operational simplicity** (easy cleanup, plan-based retention) while remaining **A2A compliant** and scalable.
* Keeping discussions as contextual subcollections is fully compatible with A2A Message semantics and makes retrieval and UI mapping straightforward.
* This spec is intentionally implementation-focused but leaves space for your UX choices (kanban columns, reviewer workflows, etc.). If you want, I can next:

  * produce the **Ticket Tech Spec Markdown** (ready to paste to repo),
  * produce concrete Firestore rules,
  * or generate sample unit-test cases for Cloud Functions.

Say which of the next three you want first:

1. Final Markdown doc (ready to paste into repo)
2. Firestore security rules draft
3. Cloud Function TypeScript skeletons for the triggers above

Which one shall I deliver next?
