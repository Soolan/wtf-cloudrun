import {Entity} from '@shared/interfaces';

export interface Discussion {
  author: Entity;     // id, name and avatar of the author (AGI, human, etc.)
  timestamp: number;  // When the discussion was created
  contents: string;   // The actual discussion or message content. content can have one of the following emojis:
                      // @user: mention a user   @department: mention a department
                      //    - If @user is a human, send them notification with the link to chat
                      // ✋ ask a question
                      //    - The chat owner is responsible to answer or escalate
                      // 📢 escalate a conflicting task/policy scenario
                      //    - The admin gets notified and should resolve the situation
                      // 📜 propose a policy or a process
                      //    - The admin gets notified and approve/denies the policy creation,
                      //      - if approved task assigned to playbook maintainer
                      // 👍 mark questions, escalations and proposals as resolved
                      // 🚛 mark a ticket as delivered when assignee AGI has delivered it
                      // 🕵️ mark a delivered ticket as being tested when assigner is inspecting it
                      // 🟢 mark it as approved when assigner AGI has approved the ticket
                      // 🔴 mark it as rejected when assigner AGI has rejected the ticket
}

export interface DiscussionWithId extends Discussion {
  id: string;
}
