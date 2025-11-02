import {CallableRequest} from 'firebase-functions/https';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export async function getUidByEmail(request: CallableRequest<{email: string}>) {
  const {email} = request.data;
  if (!email)
    throw new functions.https.HttpsError("invalid-argument", "A valid email must be provided.");

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return {uid: userRecord.uid};
  } catch (error) {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }
}
