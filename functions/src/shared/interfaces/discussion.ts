import {Entity} from '../interfaces';

export interface Discussion {
  author: Entity;     // id, name and avatar of the author (AGI, human, etc.)
  timestamp: number;  // When the discussion was created
  contents: string;   // The actual discussion or message content. content can have one of the following emojis:
                      // - @user: mention a user   @department: mention a department
                      // ✋ ask a question
                      // 📢 escalate a conflicting task/policy scenario
                      // 📜 propose a policy or a process
                      // 👍 mark questions, escalations and proposals as resolved
                      // 🚛 mark a ticket as delivered when assignee AGI has delivered it
                      // 🕵️ mark a delivered ticket as being tested when assigner is inspecting it
                      // 🟢 mark it as approved when assigner AGI has approved the ticket
                      // 🔴 mark it as rejected when assigner AGI has rejected the ticket
}

export interface DiscussionWithId extends Discussion {
  id: string;
}
