# What is a discussion?
Discussions are used to clarify tasks, evaluate/generate BPMN charts for topics and 
record the history of direct conversations with agents.
A discussion basically is a document in a `disussions` sub collection. 
Depend on the context these sub collection could be in one of these three places:
  - For clarifying a tasks and recording the history of task delivery:
    `profiles/{profileId}/companies/{companieId}/tickets/{ticketId}/discussions`
  - For evaluating a topic and generating BPMN diagram for it:
    `profiles/{profileId}/companies/{companieId}/playbook/{topicId}/discussions`
  - For chatting directly with an AI agent:
    `profiles/{profileId}/companies/{companieId}/team/{memberId}/discussions`

# What are interfaces look like?
These are the interfaces for main business logic in our platform:
  - Discussion: `@projects/shared/interfaces/discussion.ts`
  - Team: `@projects/shared/interfaces/member.ts`
  - Tickets: `@projects/shared/interfaces/ticket.ts`
  - Playbook: `@projects/shared/interfaces/topic.ts`
  - Company: `@projects/shared/interfaces/company.ts`

## How discussions are handled for tickets?
Creating tickets, triggers a firestore function that adds mirror tickets:
  - `@functions/src/tickets/onTicketCreated.ts`
Mirror tickets are useful to keep the backlogs clean. 
If tickets stay in backlog longer than they should, and in case their deadline falls within the next 14 days, 
a scheduler function (`@functions/src/tickets/processMirrorTickets.ts`) will be called to:
  - either assign it to CEO if assignedTo property is empty
  - or move it to ToDo stage and start a clarification flow (genkit) 

The clarification flow discusses and clarifies the ticket before doing it: `@functions/src/genkit/kanban/clarifyToDo`

Alternatively, admin or AI CEO can manually move the tasks from backlog to todo column, 
which will run the same clarification flow. 

**How clarification flow works?**
During clarification, multiple factors will be examined.
They are all properties of TaskClarification interface: `@projects/shared/interfaces/ticket.ts`

During the examination, if something is missing, a discussion entry will be added.
If ticket.clarification.doable == true, then a single sentence will be added to the discussion (i.e. the task is clear).
And the agent will get on with the task delivery.

**What are the detailed steps in clarification flow?** 
Here is how the clarification flow look like:
  - does ticket have meaningful and relative title, description and attachment(s)?
    - no: add a discussion entry and raise [question], then clarification.meaningful = false and return
    - yes: clarification.meaningful = true
  - does it have knowledge base?
    - no: raise [question], [escalate] or [propose], then clarification.knowledge_base = false and return
    - yes: clarification.knowledge_base = true
  - does it have a process (BPMN diagram)?
    - no:
        - if appropriate, and you can [propose] add a discussion
        - clarification.process = false and return
    - yes: clarification.process = true
  - does it require a tool to deliver the task?
    - no: clarification.needTool = false
    - yes: clarification.needTool = true
  - does assignee have access to that tool?
    - no: 
      - Add an [Escalate] discussion (i.e. needs tool access) 
      - clarification.accessTool = false and return
    - yes: clarification.accessTool = true
  - does it have subtask(s)
    - no:
        - if (necessary, and you are c-suite) add subtasks, then add a discussion (i.e. subtasks added, please finish them first)
        - clarification.subtask = true and return
    - yes: clarification.subtask = true and return
  - If you survived this far set stage to doing and let assignee get on with it.

**How task discussions proceed and when they stop?**
There is a firestore `OnCreated` trigger for `discussions` sub collection that listen to any newly created doc.
  - If it contains the [question] short codes, ticket.creator will answer. 
    - If the answer is satisfying, ticket.assignedTo mark it as [resolved].
    - Else, they [escalate] or [propose] and wait for admin (human) response.  
      - If the answer is satisfying, ticket.assignedTo mark it as [resolved].
      - Else they @admin and continue the loop til is satisfying.
  - If it contains the [delivered] short code, ticket.creator will add a [testing] short code and get on with testing
  - If it contains the [rejected] short code, ticket.assignedTo reads the feedback and responds/tries again.
  - If it contains the [accepted] short code, ticket.status will be set to DONE  (end of discussion).
  - If discussions.length > 20 delivery halts and awaits for human supervision. 

## How discussions are handled for topics during BPMN generation?
The every topic in our playbook has a property called `bpmnEligibility` which plays a key roll for adding BPMN diagrams.
  - `@projects/shared/interfaces/topic.ts`

As such, there are two steps for adding BPMN diagrams to a given topic:
First a flow evaluates and ranks BPMN readiness for a given topic: `@functions/src/genkit/chatBpmnEligibility`.
The user has a choice to go back and enrich the topic with missing factors, or proceed with BPMN generation regardless of low `bpmnEligibility.score`.

If user decides to proceed with BPMN generation, another genkit flow will take care of it: `@functions/src/genkit/genBpmn`.

During running these two flows, every discussion doc will added automatically to the `discussions` sub collection:
`profiles/{profileId}/companies/{companieId}/playbook/{topicId}/discussions`
 
This means all conversations are predefined and we don't need to listen/trigger next action. 


## How discussions are handled for direct chat with AI agents?
All direct chats between user and AI agents are handled by this flow:
- `@functions/src/genkit/chatWithUser`

Which contains all the necessary logic to read the discussions history and new docs here:
`profiles/{profileId}/companies/{companieId}/team/{memberId}/discussions`
