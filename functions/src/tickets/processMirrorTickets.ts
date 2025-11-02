import {onSchedule} from 'firebase-functions/scheduler';
import {db} from '../shared/firebase';
import {Entity, Member, MirrorTicket, Ticket} from '../shared/interfaces';
import {TicketStage} from '../shared/enums';
import {CEO, DISCUSSIONS, MEMBERS, MIRROR_TICKETS} from '../shared/constants';

/*
 * The primary responsibility for this function is deleting the docs in mirror_tickets
 * Either by assigning the underlying ticket to CEO and move them to ToDo
 * or checking to see if the underlying tickets has moved and assigned already
 */
export const processMirrorTickets = onSchedule("every 24 hours", async () => {
  const mirrorSnap = await db.collection(MIRROR_TICKETS.path)
    .where(MIRROR_TICKETS.where!.field, MIRROR_TICKETS.where!.operator, MIRROR_TICKETS.where!.value)
    .orderBy(MIRROR_TICKETS.orderBy!.field, MIRROR_TICKETS.orderBy!.direction)
    .limit(MIRROR_TICKETS.limit!)
    .get();

  for (const doc of mirrorSnap.docs) {
    const mirror = doc.data() as MirrorTicket;
    const ticketRef = mirror.ticketPath;
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      await doc.ref.delete(); // stale mirror
      continue;
    }

    const ticket = ticketDoc.data() as Ticket;
    if (!ticket) {
      await doc.ref.delete();
      continue;
    }

    // Check if it is already out of backlog or if it is assigned to someone
    const isBacklog = ticket.stage === TicketStage.Backlog;
    if (!isBacklog || ticket.assignedTo) {
      await doc.ref.delete(); // invalid scenario
      continue;
    }

    const path = `${mirror.ticketPath}/${DISCUSSIONS.path}`;
    const discussions = await ticketRef.collection(path).limit(1).get();
    if (!discussions.empty) {
      await doc.ref.delete(); // discussions are not empty. Meaning ticket already being discussed/delivered.
      continue;
    }

    // Assign CEO if needed
    if (!ticket.assignedTo) {
      const companyRef = ticketRef.parent.parent!; // This is companies/{companyId}
      const teamRef = companyRef.collection(MEMBERS.path); // This is companies/{companyId}/team
      const assignedTo = await getCEO(teamRef);
      if (assignedTo) await ticketRef.update({assignedTo});
    }

    await triggerClarificationFlow(ticketRef, ticket);
    await doc.ref.delete(); // cleanup after processing
  }
});

async function getCEO(teamRef: FirebaseFirestore.CollectionReference): Promise<Entity> {
  const snap = await teamRef.where('department', '==', CEO).limit(1).get();
  if (snap.empty) return {} as Entity;
  return (snap.docs[0].data() as Member).persona;
}

async function triggerClarificationFlow(ticketRef: FirebaseFirestore.DocumentReference, ticket: Ticket) {
  // This could call a Genkit flow
  console.log(`Triggering clarification flow for ticket ${ticket.serial} (${ticket.title})`);
  // TODO: Call a Genkit flow to clarify and if all clear start doing the task.
  //
}
