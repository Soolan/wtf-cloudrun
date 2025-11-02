export enum TicketStage {
  Backlog = 'backlog',  // Board + C-suite can suggest ideas and add new tickets here
  ToDo = 'todo',  // Only board and CEO (AI) have the power to move tickets here,
         // Board can move tickets here on demand, but CEOs should go through clarification flow first (assuming
         // ticket is within two weeks deadline threshold).
         // tickets moved here by the board members will trigger a function that activates the CEO
         // he studies the ticket and if there are no questions, escalations or proposals, he either assigns it to the
         // right manager (c-suite) or breaks it down to multiple tasks and assign them to multiple managers
  Doing = 'doing', // Board, C-suite and their team members have access to tickets here.
         // C-suite study the tickets that has assigned to them and if they have no questions, escalations or proposals,
         // they either do it themselves, or assign it to one of their team members, or break it down to multiple tasks
         // and assign them all to one or more team members
  Done = 'done'   // Only the tickets that delivered, tested and approved will end up here.
         // if all sub-tasks of a given ticket is completed, the ticket status will be updated to Done as well
         // meaning: when a ticket is done, system checks to find out:
         // - if the ticket was a sub-task (has parent ticket)
         //   - yes? if all other sub-tasks are done
         //     - yes? parent ticket is done
}

/*
  Important notes about the ticket stages:
   1. When the board moves a ticket to "to do", the ticket stage will be updated by angular component
   and at the same time a signal will be sent to CEO
   2. If the CEO has no questions, escalations or proposals, he:
    2.1) Either assigns it to the right manager (c-suite) [GenKit function], or
    2.2) Breaks it down to multiple tasks [GenKit function]
    2.3) Adds or generates missing attachments (urls, files, etc) [GenKit function],
    2.4) and then assigns them to multiple managers [GenKit function].
    2.5) At the end, ticket(s) stage(s) will be updated to "Doing" by calling a GenKit function.
 */

export enum TicketPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export enum TicketEmoji {
  Question = '✋',
  Escalation = '📢',
  Proposal = '📜',
  Resolution = '👍',
  Subtask = '👥',
  Delivery = '🚛',
  Inspection = '🕵️',
  Approval = '🟢',
  Denial = '🔴'
}
