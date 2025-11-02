import {
  EMAIL_NOTIFICATIONS,
  MAILING_LISTS_COLLECTION,
  MAILING_LISTS_DAY1_DOC,
  MAILING_LISTS_DAY2_DOC
} from '../shared/constants';
import {db} from '../shared/firebase';

export async function sendEmails(docId: string) {
  try {
    const mailingListDoc =
      await db.collection(MAILING_LISTS_COLLECTION).doc(docId).get();
    if (mailingListDoc.exists) {
      const data = {...mailingListDoc.data()};

      // Send emails to receivers
      for (let index = 0; index < data.receivers.length; index++) {
        const delay = index * 10000;
        const notification = {
          to: data.receivers[index],
          message: {
            subject: data.message.subject,
            html: data.message.html,
          },
        };
        delayedSave(db.collection(EMAIL_NOTIFICATIONS.path), notification, delay);
      }

      // Move receivers from day1 to day2
      if (docId === MAILING_LISTS_DAY1_DOC) {
        addEmailToMailingLists(MAILING_LISTS_DAY2_DOC, db, "", data.receivers);
      }

      // Clear receivers list after sending emails
      await purgeEmails(docId);
    } else {
      console.log("No such document!");
    }
    return null;
  } catch (error) {
    console.error("Error sending emails:", error);
    return null;
  }
}

function addEmailToMailingLists(mailingList: string, db: any, email?: string, emails?: string[]) {
  db.collection(MAILING_LISTS_COLLECTION).doc(mailingList).get().then((doc: any) => {
    if (doc.exists) {
      const data = {...doc.data()};
      if (email) {
        if (data.receivers.includes(email)) return;
        data.receivers.push(email);
      } else if (emails) {
        data.receivers.push(...emails);
        const uniqueEmailsSet = new Set(emails); // Use a Set to remove duplicates
        data.receivers = [...uniqueEmailsSet]; // Convert the Set back to an array
      }
      db.collection(MAILING_LISTS_COLLECTION).doc(mailingList).update(data);
    } else {
      console.log("No such document!");
    }
  });
}

// Function to save a document with a delay
function delayedSave(colRef: any, data:any, delay: number) {
  setTimeout(() => {
    colRef.add(data).then(() => {
      console.log("Document saved:", data);
    }).catch((error: any) => {
      console.error("Error saving document:", error);
    });
  }, delay);
}

async function purgeEmails(docId: string) {
  try {
    const mailingListDoc =
      await db.collection(MAILING_LISTS_COLLECTION).doc(docId).get();
    if (mailingListDoc.exists) {
      const data = {...mailingListDoc.data()};
      data.receivers = [];
      await db.collection(MAILING_LISTS_COLLECTION).doc(docId).update(data);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error purging emails:", error);
  }
}

