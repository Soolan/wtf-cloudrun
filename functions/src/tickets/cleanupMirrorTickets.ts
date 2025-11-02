import {onSchedule} from 'firebase-functions/scheduler';
import {MirrorTicket} from '../shared/interfaces';
import {db} from '../shared/firebase';
import {MIRROR_TICKETS} from '../shared/constants';

// ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │
// │ │ │ │ └───── Day of week (0 - 6) (Sunday to Saturday)
// │ │ │ └──────── Month (1 - 12)
// │ │ └──────────── Day of month (1 - 31)
// │ └──────────────── Hour (0 - 23)
// └──────────────────── Minute (0 - 59)

// Run on 1st of every month at 00:00
export const cleanupMirrorTickets = onSchedule("0 0 1 * *", async () => {
  const now = Date.now();
  const snap = await db.collection(MIRROR_TICKETS.path).get();
  for (const doc of snap.docs) {
    const mirror = doc.data() as MirrorTicket;
    if (mirror.deadline < now) await doc.ref.delete();
  }
});
