import {z} from 'zod';
import {TicketSchema} from './clarifyToDo.schema';
import {db} from '../../../shared/firebase';
import {Ticket} from './clarifyToDo.schema';
import {VERTEX_AI} from '../../shared/ai';
import {TicketStage} from '../../../shared/enums';

// ToDo: embrace the BPA in your design
export const clarifyToDoFlow = VERTEX_AI.defineFlow(
  {
    name: 'clarifyToDoFlow',
    inputSchema: TicketSchema,
    outputSchema: z.void(),
  },
  async (ticket: Ticket) => {
    let allClear = true;
    const clarification = ticket.clarification || {
      isValid: false,
      hasBPMN: false,
      hasSubtasks: false,
      hasKb: false,
      usesTool: false,
      hasAccess: false,
      doable: false,
    };

    // 1. Check for meaningful title, description, and attachments
    if (!ticket.title || !ticket.description) {
      allClear = false;
      clarification.isValid = false;
      await addDiscussion(ticket.id, {id: 'system', name: 'Gemini', avatar: ''}, 'The ticket is missing a title or description. ✋');
    } else {
      clarification.isValid = true;
    }

    // 2. Check for knowledge base
    if (!ticket.process) { // Assuming that if a ticket has a process, it has knowledge base
      allClear = false;
      clarification.hasKb = false;
      await addDiscussion(ticket.id, {id: 'system', name: 'Gemini', avatar: ''}, 'The ticket is missing a knowledge base. ✋');
    } else {
      clarification.hasKb = true;
    }

    // 3. Check for a process (BPMN diagram)
    if (!ticket.process) {
      allClear = false;
      clarification.hasBPMN = false;
      await addDiscussion(ticket.id, {id: 'system', name: 'Gemini', avatar: ''}, 'The ticket is missing a BPMN process. 📜');
    } else {
      clarification.hasBPMN = true;
    }

    // 4. Does it require a tool to deliver the task?
    if (ticket.description.toLowerCase().includes('tool') || ticket.description.toLowerCase().includes('api')) {
      clarification.usesTool = true;
    } else {
      clarification.usesTool = false;
    }

    // 5. Does assignee have access to that tool?
    // TODO: Implement tool access check (please ignore for now)
    if (clarification.usesTool) {
      // For now, we assume the assignee has access to the tool.
      clarification.hasAccess = true;
    } else {
      clarification.hasAccess = true;
    }

    // 6. Check for subtasks
    if (!ticket.dependencies || ticket.dependencies.length === 0) {
      // This seems to be the opposite of the markdown, which says to add subtasks if necessary.
      // For now, we just check if they exist.
      clarification.hasSubtasks = false;
    } else {
      clarification.hasSubtasks = true;
    }

    clarification.doable = allClear;

    await db.collection('tickets').doc(ticket.id).update({clarification});

    if (allClear) {
      await addDiscussion(ticket.id, {id: 'system', name: 'Gemini', avatar: ''}, 'The task is clear and ready to be worked on.');
      await db.collection('tickets').doc(ticket.id).update({stage: TicketStage.Doing});
    }
  }
);

async function addDiscussion(ticketId: string, author: any, contents: string) {
  const discussion = {
    author,
    timestamp: Date.now(),
    contents,
  };
  await db.collection('tickets').doc(ticketId).collection('discussions').add(discussion);
}
