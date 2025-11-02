import {onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {Ticket} from '../shared/interfaces';
import {TicketStage} from '../shared/enums';
import {logger} from 'firebase-functions';

export const onTicketUpdated = onDocumentUpdated(
  'profiles/{profileId}/companies/{companyId}/tickets/{ticketId}',
  async (event) => {
    const before = event.data?.before?.data() as Ticket | undefined;
    const after = event.data?.after?.data() as Ticket | undefined;
    const docPath = event.document;

    // Skip if data is missing
    if (!before || !after) return;

    // CEO scenario: While ticket is in Backlog and it assigned to CEO and after CEO clarifies a ticket,
    // he can remove himself as assignee and assign it to someone else and move it to ToDo
    if(after.stage === TicketStage.ToDo && before.assignedTo !== after.assignedTo) {
      logger.info(`Assignee changed in ToDo from ${before.assignedTo} to ${after.assignedTo}`);
      // Read the history
      // If needed, ask, propose or escalate (call clarification flow)
      // Move to Doing and get on with it
      // return;
    }

    // handle the stage change
    if(before.stage !== after.stage) {
      logger.info(`Stage changed from ${before.stage} to ${after.stage}`);
      switch (after.stage) {
      case TicketStage.ToDo:
        if (before.stage === TicketStage.Backlog) {
          console.log(docPath);
          // call clarification flow, and then do it, or if you are CEO/C-Suite, you may choose to:
          //  - assign it to someone else (This will trigger onTicketUpdated and satisfies condition in line 17)
          //  - create multiple tickets and assign them to others to do them (this will trigger onTicketCreated)
        } else {
          // Todo: implement the logic to deal with backward moves.
        }
        break;
      case TicketStage.Doing:
        // update the discussion - 'Assignee has started doing the ticket'
        break;
      case TicketStage.Done:
        // update the discussion - 'Assignee has delivered the ticket'
        break;
      }
    }
  }
);
