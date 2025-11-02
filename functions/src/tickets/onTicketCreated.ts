import {FirestoreEvent, onDocumentCreated} from 'firebase-functions/v2/firestore';
import {MirrorTicket, Ticket} from '../shared/interfaces';
import {db} from '../shared/firebase';
import {COMPANIES, MIRROR_TICKETS, PROFILES, TICKETS} from '../shared/constants';
import {TicketStage} from '../shared/enums';
import {firestore} from 'firebase-admin';
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;
import {ParamsOf} from 'firebase-functions';

export const onTicketCreated = onDocumentCreated(
  'profiles/{profileId}/companies/{companyId}/tickets/{ticketId}',
  async (event) => {
    const ticket = event.data?.data() as Ticket;

    // We want to record mirrors only for backlog tickets that have no assignees so scheduler can deal with them
    if (ticket.stage === TicketStage.Backlog && !ticket.assignedTo) {
      await addMirror(event, ticket);
    }

    // This means board or CEO/c-suit created a ticket and directly assigned it to a member
    if (ticket.stage === TicketStage.ToDo && ticket.assignedTo) {
      // call clarification flow, and then do it, or if you are CEO/C-Suite:
      //  - assign it to someone to do it (This will trigger onTicketUpdated and satisfies condition in line 17)
      //  - create multiple tickets and assign them to others to do them (this will trigger onTicketCreated)
    }
  }
);

async function addMirror(event: FirestoreEvent<QueryDocumentSnapshot | undefined, ParamsOf<string>>, ticket: Ticket) {
  const ticketRef = db
    .collection(PROFILES.path)
    .doc(event.params.profileId)
    .collection(COMPANIES.path)
    .doc(event.params.companyId)
    .collection(TICKETS.path)
    .doc(event.params.ticketId);

  const mirror: MirrorTicket = {
    ticketPath: ticketRef,
    deadline: ticket.deadline?.toMillis?.() ?? 0,
    stage: ticket.stage,
    assignedTo: ticket.assignedTo ?? undefined,
  };

  await db.collection(MIRROR_TICKETS.path).add(mirror);
}
