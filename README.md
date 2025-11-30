# Introducing Write The Future (WTF)
## An AI platform where you can speak a business into existence

**The problem, the solution and the platform:**
From non-technical perspective, there is a good summary of the problem I am trying to solve, the solution and brief intro to the system here:
https://wtf.pub/investors

Write the Future as an application or system has the following features COVERING talent management, workforce monetization for the specific modules like 
company, team, playbook, kanban, BPM, BPA, marketplace, MCP etc.) 

**Features**
From technical perspective, there are several major business logic that construct our platform:
  - Profile: create/view/edit/delete user profiles. Interface:  `@projects/shared/interfaces/profile.ts`
  - Company: create/view/edit/delete/backup/restore companies. Interface:  `@projects/shared/interfaces/company.ts`
  - Team: create/view/edit/delete team members and departments. Interface:  `@projects/shared/interfaces/member.ts`
  - Tickets: create/view/edit/delete/discuss/assign/deliver tasks. Interface:  `@projects/shared/interfaces/ticket.ts`
  - Playbook: suggest/create/view/edit/delete/vectorize topics. Interface:  `@projects/shared/interfaces/topic.ts`
  - Business Process Modeling (BPM): create/view/edit business process models (BPMN diagrams). Interface: `@projects/shared/interfaces/bpm.ts`
  - Business Process Automation (BPA): create/view/edit/run automated workflows, inspired by n8n.io. Interface: `@projects/shared/interfaces/bpa.ts`

**How it is organized?**
When a user registers a new firestore doc with uid is created under `profiles` collection.
When they create a company, the company is added in a sub collection: `profiles/{profileId}/companies/{companyId}`
Anything related to this company will be added under companyId. I.e.:
```
  profiles/{profileId}/companies/{companyId}
  |- team/{memberId}
  |- tickets/{ticketId}
  |- playbook/{topicId}
  etc
```

**How it works?**
This is an AI platform for creating autonomous online businesses operated by a team of AI Agents 
with various roles and responsibilities.
It operates using well-defined knowledge base, business processes and tasks that is defined in our routes:
  - `@projects/website/src/app/console/routes.ts`

After creating and customizing the company:
  - `@projects/website/src/app/console/landing/landing.component.ts`
the organizational chart (c-suite, their departments and teams) is the next step:
  - `@projects/website/src/app/console/team/team.component.ts`

The next critical step is creating a knowledge base. 
Initially, there will be a human-readable playbook with sections associated to each department and 
topics that cover the business processes and policies for that department:
  - `@projects/shared/components/playbook/playbook.component.ts`
Upon approval, each topic can be chunked and stored as a vectorized document, which is AI friendly. These chunks are
part of the RAG component and will contribute to our context engineering architecture.

Building upon the knowledge base, the platform allows for Business Process Modeling (BPM). Topics can be transformed into structured BPMN diagrams, enabling visual representation and formalization of business processes. The core interface for BPM models is `@projects/shared/interfaces/bpm.ts`.

Furthermore, these formalized processes can be automated through Business Process Automation (BPA). Inspired by n8n.io, the BPA module allows for the creation, execution, and management of automated workflows. The primary interface for BPA workflows is `@projects/shared/interfaces/bpa.ts`, and the editor for these workflows is handled by `@projects/shared/components/bpa-editor/bpa-editor.component.ts`, which orchestrates child components like `BpaToolbarComponent`, `BpaCanvasComponent`, `BpaNodePaletteComponent`, and `BpaNodeEditorComponent`. The `@projects/shared/services/bpa.service.ts` handles data operations for both BPM and BPA entities.

And then we will use our KanBan board to add tasks:
  - `@projects/shared/components/kanban/kanban.component.ts`
Tasks, are initially created by admin user (human) in the backlog: `@projects/shared/enums/ticket.ts`
Creating tickets, triggers a firestore function that adds mirror tickets:
  - `@functions/src/tickets/onTicketCreated.ts`
Mirror tickets are useful to keep the backlogs clean. If tickets stay in backlog longer than they should, 
and in case their deadline falls within the next 14 days, a scheduler function (`@functions/src/tickets/processMirrorTickets.ts`) 
will be called to:
  - either assign it to CEO if assignedTo property is empty
  - or move it to ToDo stage and start a clarification flow (genkit) to discuss and clarify the ticket before execution
Alternatively, admin or AI CEO can manually move the tasks from backlog to todo column. This will trigger a function 
that calls a genkit flow to clarify the task:
  - `@functions/src/genkit/kanban/clarifyToDo.flow.ts`

