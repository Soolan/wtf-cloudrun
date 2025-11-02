import { Timestamp } from 'firebase-admin/firestore';
import {SendMe} from '../interfaces';

export interface MailingList {
  name: string; // Name of the mailing list. Use these as doc names: Welcome, Day 1 - 7, Newsletter, All
  from: string;
  message: {
    subject: string;
    html: string;
  };
  receivers: string[];
  scheduledTime: Timestamp;
}

export interface Subscriber {
  email: string;
  name?: string;
  settings: SendMe;
}

// This is how it works.

// For users:
// upon registration they will be added to the Welcome, Newsletter and All mailing lists automatically
// If they uncheck the email in their profile, they will be removed from the all lists except newsletter
// If they uncheck the newsletter in their profile, they will be removed from the newsletter list
// At midnights, first the list Day 7 will be processed and after that its receivers will be purged. i.e. []
// Then Day 6 will be processed and after each new notifications entry, the email will be added to the Day 7 list.
// At the end of processing Day 6 emails, all its receivers will be purged. i.e. []
// Then Day 5 will be processed and after each new notifications entry, the email will be added to the Day 6 list.
// At the end of processing Day 5 emails, all its receivers will be purged. i.e. []
// Then Day 4 will be processed and after each new notifications entry, the email will be added to the Day 5 list.
// At the end of processing Day 4 emails, all its receivers will be purged. i.e. []
// Then Day 3 will be processed and after each new notifications entry, the email will be added to the Day 4 list.
// At the end of processing Day 3 emails, all its receivers will be purged. i.e. []
// Then Day 2 will be processed and after each new notifications entry, the email will be added to the Day 3 list.
// At the end of processing Day 2 emails, all its receivers will be purged. i.e. []
// Then Day 1 will be processed and after each new notifications entry, the email will be added to the Day 2 list.
// At the end of processing Day 1 emails, all its receivers will be purged. i.e. []
// Then Welcome will be processed and after each new notifications entry, the email will be added to the Day 1 list.
// At the end of processing welcome emails, all its receivers will be purged. i.e. []

// For guest subscribers:
// upon entering their email they will be added to the Welcome, Newsletter and All mailing lists automatically.

// At the footer of the all emails there is an unsubscribe link that will take the user to the subscription page
// and they can choose what they want to unsubscribe.
