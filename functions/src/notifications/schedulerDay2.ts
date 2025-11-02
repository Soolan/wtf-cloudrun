import {onSchedule} from 'firebase-functions/scheduler';
import {sendEmails} from './sendEmails';
import {MAILING_LISTS_DAY2_DOC} from '../shared/constants';

export const schedulerDay2 = onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "UTC",
  },
  async () => {
    try {
      await sendEmails(MAILING_LISTS_DAY2_DOC);
    } catch (error) {
      console.error("Error processing day 2 mailing list:", error);
    }
  }
);
