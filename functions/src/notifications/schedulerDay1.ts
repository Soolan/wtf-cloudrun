import {MAILING_LISTS_DAY1_DOC} from '../shared/constants';
import {sendEmails} from './sendEmails';
import {onSchedule} from 'firebase-functions/scheduler';

export const schedulerDay1 = onSchedule(
  {
    schedule: "0 4 * * *",
    timeZone: "UTC",
  },
  async () => {
    try {
      await sendEmails(MAILING_LISTS_DAY1_DOC);
    } catch (error) {
      console.error("Error processing day 1 mailing list:", error);
    }
  }
);
