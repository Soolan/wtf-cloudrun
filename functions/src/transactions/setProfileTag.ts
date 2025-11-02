import * as functions from "firebase-functions";
import {CallableRequest} from "firebase-functions/v2/https";
import {HOT_WALLET_DOC, LAST_TAG, PROFILES, STATS_COLLECTION} from '../shared/constants';
import {ProfileWithId} from '../shared/interfaces';
import {db} from '../shared/firebase';

export async function setProfileTag(req: CallableRequest<ProfileWithId>) {
  const { id, ...profile } = req.data;
  console.log(req.data, id, profile);
  if (!id || !profile) {
    throw new functions.https.HttpsError("invalid-argument", "Missing profile or id.");
  }

  const statsRef = db.collection(STATS_COLLECTION).doc(HOT_WALLET_DOC);
  const profilesRef = db.collection(PROFILES.path).doc(id);

  return await db.runTransaction(async (firestoreTx) => {
    const statsSnap = await firestoreTx.get(statsRef);
    console.log(statsSnap.exists)
    if (!statsSnap.exists)
      throw new functions.https.HttpsError("not-found", "Hot wallet not found.");

    const currentTag = statsSnap.get(LAST_TAG) ?? 0;
    const newTag = currentTag + 1;

    console.log(currentTag, newTag);

    firestoreTx.update(statsRef, { last_tag: newTag }); // Update last_tag in the hot wallet doc
    profile.tag = newTag;
    console.log('==========================================================================');
    firestoreTx.set(profilesRef, profile, { merge: true }); // Set the profile doc with the new tag

    return { success: true, message: 'A profile with a new tag created successfully.', tag: newTag};
  });
}
